# Help section for the Analog Way Picturall module

With this module you can control all Media Servers from the Picturall series by Analog Way.
This module has been sponsored by Analog Way. We want to thank Analog Way for the support of free software and Companion!

This module uses always the default TCP port number of 11000 for control of the device. Make sure the port number is not set to something different on your Picturall server.

**Available variants for Analog Way Picturall**

none
There are different servers available, but they use all the same protocol. The available commands doesn't depend on specific hardware.

**Available commands for Analog Way Picturall**

* Run Cue
* Playback Go
* Playback Goto
* Select Cuestack into Playback
* Playback Release
* Layer Playback control
* Layer Playback Seek
* Set Layer Media End Action
* Send custom command

You easily can send any command to the Picturall server. To find out the command in the Picturall Commander go to  Edit -> Options -> Logging and make sure you have Log commands checked.
After this select View -> Commander log
Now when you do any changes in Commander the sent commands will be copied to the Commander Log after 5 to 10 seconds.
You only have to enter the part AFTER the "-->"

**Available variables for Analog Way Picturall**
There is a variable for the server software version. Although the server can only be controlled by the Picturall Commander with a matching software version, the Companion module should work with all server versions since 2.0.
There are variables for each playback indicating the state of the playback. The x_cuestack variable indicates if a cuestack is selected in the playback. It reads "0" if none or the number of the selected cuestack. The x_cue variable indicates the active cue of the cuestack in the playback. It reads "0" if none or the number of the active cue.

There are some variables which are not exposed in the instance configuration.
This are the available variables (you have to replace INSTANCENAME with the name of your instance and the captital letter X denotes where yhou have to substitute a number)
* $(INSTANCENAME:sourceX_elapsed) Gives you the source's elapsed playtime
* $(INSTANCENAME:sourceX_countdown) Gives you the source's remaining time until outpoint
* $(INSTANCENAME:sourceX_playstate) Gives you a literal readout of the playstate, e.g. Play, Stop...
* $(INSTANCENAME:playbackX_questack) Gives you the number of the cuestack in the playback, 0 if empty
* $(INSTANCENAME:playbackX_cue) Gives you the number of the current cue played back in a playback, 0.0 if none
* $(INSTANCENAME:playbackX_state) Gives you a literal readout of the state of a playback, e.g. Waiting for trigger...
* $(INSTANCENAME:playbackX_progress) Gives you the progress of the fade between current and next cue in a playback in percent


Most of these variables are not pulled actively, so they read N/A until companion receives the first change.

**Available presets for Analog Way Picturall**
There are presets for the Go actions for all playbacks.

**Available feedbacks for Analog Way Picturall**
There is one feedback indicating if a cuestack is selected in a playback or if it is empty by changing the bank colors.