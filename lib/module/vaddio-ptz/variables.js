module.exports = {

	/**
	 * INTERNAL: initialize variables.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initVariables() {
		var variables = [];

		variables.push({ name: 'pan_speed',   label: 'Pan Speed'   });
		variables.push({ name: 'tilt_speed',  label: 'Tilt Speed'  });
		variables.push({ name: 'zoom_speed',  label: 'Zoom Speed'  });
		variables.push({ name: 'focus_speed', label: 'Focus Speed' });
		variables.push({ name: 'gain',        label: 'Gain'        });
		variables.push({ name: 'red_gain',    label: 'Red Gain'    });
		variables.push({ name: 'blue_gain',   label: 'Blue Gain'   });
		variables.push({ name: 'iris',        label: 'Iris'        });
		variables.push({ name: 'detail',      label: 'Detail'      });
		variables.push({ name: 'chroma',      label: 'Chroma'      });
		variables.push({ name: 'gamma',       label: 'Gamma'       });

		this.setVariable('pan_speed',   this.panSpeed);
		this.setVariable('tilt_speed',  this.tiltSpeed);
		this.setVariable('zoom_speed',  this.zoomSpeed);
		this.setVariable('focus_speed', this.focusSpeed);
		this.setVariable('gain',        this.state.gain);
		this.setVariable('red_gain',    this.state.red_gain);
		this.setVariable('blue_gain',   this.state.blue_gain);
		this.setVariable('iris',        this.state.iris);
		this.setVariable('detail',      this.state.detail);
		this.setVariable('chroma',      this.state.chroma);
		this.setVariable('gamma',       this.state.gamma);

		this.setVariableDefinitions(variables);
	}
}