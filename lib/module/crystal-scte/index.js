var instance_skel = require('../../instance_skel');
var udp           = require('../../udp');
var debug;
var log;


function instance(system, id, config) {
   var self = this;

   // super-constructor
   instance_skel.apply(this, arguments);

   self.actions(); // export actions

   return self;
}

instance.prototype.init_udp = function() {
        var self = this;

        if (self.config.ipaddress !== undefined) {
           self.udp = new udp(self.config.ipaddress, self.config.port);
           


           self.udp.on('status_change', function (status, message) {
              self.status(status, message);
           });
           
           self.udp.on('data', function (data) {
              //self.status(self.STATE_OK);
              self.log('info',"SCTE104 Inserter Response: " + data);
           });
        }
};

instance.prototype.updateConfig = function(config) {
   var self = this;

   self.config = config;
   
   if (self.udp !== undefined) {
      self.udp.destroy();
      delete self.udp;
   }
   
   self.actions();
   self.init_udp();
}

instance.prototype.init = function() {
   var self = this;

   self.status(self.STATE_OK);

   debug = self.debug;
   log = self.log;
   self.init_udp();
   self.last_ad_event_id = 1;
   self.last_splice_event_id = 1;
}

// Return config fields for web config
instance.prototype.config_fields = function () {
   var self = this;
   return [
      {
         type: 'text',
         id: 'info',
         width: 12,
         label: 'Information',
         value: 'This module will send a SCTE104 command to a Crystal Server.'
      },
      {
         type: 'textinput',
         id: 'ipaddress',
         label: 'IP Address',
         width: 4
      },
      {
         type: 'number',
         id: 'port',
         label: 'UDP Port',
         width: 4,
         min:1,
         max:50000,
         default: 14011
      },
      {
         type: 'number',
         id: 'insert_line',
         label: 'VANC Line',
         width: 4,
         min: 1,
         max: 20,
         default: 13
      }
   ]
}

// When module gets deleted
instance.prototype.destroy = function() {
   var self = this;
   
   if (self.udp !== undefined) {
      self.udp.destroy();
   }
   debug("destroy");
}

instance.prototype.actions = function(system) {
   var self = this;

   self.setActions({

      'ad_start': {
         label: 'Ad Start',
         options: [
            {
               type: 'number',
               label: 'Duration (seconds)',
               id: 'duration',
               min: 0,
               max: 600,
               default: 30
            },
            {
               type: 'number',
               label: 'Preroll (ms)',
               id: 'preroll',
               min: 0,
               max: 10000,
               default: 0
            }
         ]
      },
      'ad_end': {
         label: 'Ad End',
         options: [
            {
               type: 'number',
               label: 'Preroll (ms)',
               id: 'preroll',
               min: 0,
               max: 10000,
               default: 0
            }
         ]
      },
      'splice_start': {
         label: 'Splice Start',
         options: [
            {
               type: 'number',
               label: 'Duration (seconds)',
               id: 'duration',
               min: 0,
               max: 600,
               default: 30
            },
            {
               type: 'number',
               label: 'Preroll (ms)',
               id: 'preroll',
               min: 0,
               max: 10000,
               default: 0
            }
         ]
      },
      'splice_end': {
         label: 'Splice End',
         options: [
            {
               type: 'number',
               label: 'Preroll (ms)',
               id: 'preroll',
               min: 0,
               max: 10000,
               default: 0
            }
         ]
      }
   });
   
}

instance.prototype.action = function(action) {
   var self = this;
   //var cmd;

   if ( (self.config.ipaddress !== undefined) && (self.config.ipaddress.length > 0) ) {
      //cmd = 'http://' + self.config.ipaddress + '/webadmin/?rq=system-api&obj=ioprt&path=';
   }
   else {
      self.log('error', 'IP address not set');
      self.status(self.STATUS_ERROR, 'IP Address Not Set');
      return;
   }

   var _operations = [{}];
   if((action.action == 'ad_start') || (action.action == 'ad_end') || (action.action == 'splice_start') || (action.action == 'splice_end')) {
      //cmd += 'send_scte' + self.config.channel;
      if((action.action == 'ad_start') || (action.action == 'ad_end')){
         _operations = [{opID: 0x0104, pre_roll_time: action.options.preroll}];
         var ad_upid = "";
         var ad_upid_type = 0x00;
         if((action.action == 'ad_start')){
            self.last_ad_event_id++;
            _operations.push({ 
               opID: 0x010B, // segmentation_descriptor
               segmentation_event_id: self.last_ad_event_id,
               segmentation_type_id: 0x30, // Provider Ad Start
               segmentation_upid_type: ad_upid_type,
               segmentation_upid: ad_upid,
               duration: action.options.duration, //seconds
               delivery_not_restricted_flag: true,
               web_delivery_allowed_flag: true,
               no_regional_blackout_flag: true,
               archive_allowed_flag: true,
               device_restrictions: 0x03
            });
         }
         else if ((action.action == 'ad_end')){
            _operations.push({ 
               opID: 0x010B, // segmentation_descriptor
               segmentation_event_id: self.last_ad_event_id,
               segmentation_type_id: 0x31, // Provider Ad End
               segmentation_upid_type: ad_upid_type,
               segmentation_upid: ad_upid,
               delivery_not_restricted_flag: true,
               web_delivery_allowed_flag: true,
               no_regional_blackout_flag: true,
               archive_allowed_flag: true,
               device_restrictions: 0x03
            });
         }
      }
      else if((action.action == 'splice_start')){
         self.last_splice_event_id++;
         var splice_duration = action.options.duration * 10;
         var splice_type = 1;
         if(action.options.preroll == 0){
            splice_type = 2;
         }
         _operations = [{ opID: 0x0101, splice_insert_type: splice_type, break_duration: splice_duration, pre_roll_time: action.options.preroll, splice_event_id: self.last_splice_event_id }];   
      }
      else if(action.action == 'splice_end'){
         var splice_type = 3;
         if(action.options.preroll == 0){
            splice_type = 4;
         }
         _operations = [{ opID: 0x0101, splice_insert_type: splice_type, pre_roll_time: action.options.preroll, splice_event_id: self.last_splice_event_id }];
      }
      var body  = {actions:[{scte104: {opID: 0xFFFF, operations: _operations}, line: self.config.insert_line}]};
            
      if (body !== undefined) {
         debug("Sending ", JSON.stringify(body), "to", self.config.ipaddress);         
         if (self.udp !== undefined) {
            self.udp.send(JSON.stringify(body));
            

         }
         else{
            self.log('error', 'UDP Not Defined');
            self.status(self.STATUS_ERROR);
         }
      }
      
   }
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;