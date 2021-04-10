exports = module.exports = Base => class extends Base {

	constructor (...args) {
		super(...args)

		this.commands = {
			'stop':              () => ('STP'),
			'play':              () => ('PLY'),
			'pause':             () => ('PAS'),
			'chapter_jump':      op => ('SKP' + Number(op.chapter).toFixed().padStart(4, '0')),
			'chapter_jump_next': () => ('SKPNX'),
			'chapter_jump_prev': () => ('SKPPV'),
			'title_jump':        op => ('GSK' + Number(op.title).toFixed().padStart(4, '0')),
			'title_jump_next':   () => ('GSKNX'),
			'title_jump_prev':   () => ('GSKPV'),
			'time_mode_code':    op => ('TMD' + op.code),
			'hide_menu':         op => ('OSD' + op.hide),
			'setup_menu':        () => ('SMN'),
			'top_menu':          () => ('TMN'),
			'option_menu':       () => ('OMN'),
			'pop_up_menu':       () => ('PMN'),
			'return':            () => ('RET'),
			'audio_dialog':      op => ('ADG' + op.code),
			'subtitle':          () => ('SBT1'),
			'enter':             () => ('ENT'),
			'disc_tray':         op => ('OPC' + op.tray),
			'video_resolution':  op => ('RSC' + op.resolution),
			'display_info':      () => ('DSP'),
			'function_color':    op => ('CBC' + op.color),
			'home':              () => ('HOM'),
			'ten_key':           op => ('NUM' + op.number),
			'slow_search':       op => ('SCN' + op.direction
			                                  + op.speed),
			'mute':              op => ('MUT' + op.mute),
			'auto_play':         op => ('APL' + op.suffix),
			'pip_mark':          op => ('PMK' + op.suffix),
			'3d_output':         op => ('3DO' + op.suffix),
			'aspect_ratio':      op => ('ASC' + op.suffix),
			'tv_system':         op => ('TVS' + op.suffix),
			'24_conversion':     op => ('R1K' + op.suffix),
			'color_space':       op => ('CLS' + op.suffix),
			'deep_color':        op => ('DPC' + op.suffix),
			'secondary_audio':   op => ('SCA' + op.suffix),
			'fs_setting':        op => ('COO' + op.suffix),
			'speaker_config':    op => ('SPC' + op.configuration),
			'speaker_setting':   op => ('SPS' + op.type
			                                  + op.size
			                                  + Number(op.level).toFixed().replace(/^([+-]?)([0-9]{1,2})$/, (g, s, n) => ((s ? s : '+') + n.padStart(2, '0')))
			                                  + Number(op.delay).toFixed().padStart(4, '0')),
			'firmware_upgrade':  op => ('FWU' + op.suffix),
			'hdmi_cec':          op => ('CCR' + op.suffix),
			'factory_reset':     () => ('INI'),
			'bd_live':           op => ('LNA' + op.suffix)
		}	
	}

	actions () {
		this.system.emit('instance_actions', this.id, {
			'stop': {
				label:   'Stop'
			},
			'play': {
				label:   'Play'
			},
			'pause': {
				label:   'Pause'
			},
			'chapter_jump': {
				label:   'Chapter Jump',
				options: [
					{
						type:     'number',
						label:    'Chapter',
						tooltip:  'DVD/BD Chapter, File No (0001-2000)',
						id:       'chapter',
						required: true,
						min:      1,
						max:      2000,
						default:  1
					}
				]	
			},
			'chapter_jump_next': {
				label:   'Track/Chapter Jump Next'
			},
			'chapter_jump_prev': {
				label:   'Track/Chapter Jump Prev'
			},
			'title_jump': {
				label:   'Title Jump',
				options: [
					{
						type:     'number',
						label:    'Title',
						tooltip:  'DVD/BD Title/CD Track No (0001-2000)',
						id:       'title',
						required: true,
						min:      1,
						max:      2000,
						default:  1
					}
				]
			},
			'title_jump_next': {
				label:   'Title Jump Next'
			},
			'title_jump_prev': {
				label:   'Title Jump Prev'
			},
			'time_mode_code': {
				label:   'Time Mode Code',
				options: [
					{
						type:     'dropdown',
						label:    'Time Mode',
						tooltip:  'Time Mode',
						id:       'code',
						required: true,
						choices:  [
							{ id: 'TL', label: 'Total Elapsed' },
							{ id: 'TR', label: 'Total Remain'  },
							{ id: 'EL', label: 'Elapsed'       },
							{ id: 'RM', label: 'Remain'        }
						],
						default:  'TL'
					}
				]
			},
			'hide_menu': {
				label:   'Hide Menu',
				options: [
					{
						type:     'dropdown',
						label:    'On/Off',
						tooltip:  'Complete hiding of the menu/icon displayed on the screen.',
						id:       'hide',
						required: true,
						choices:  [
							{ id: '00', label: 'OSD on'  },
							{ id: '01', label: 'OSD off' }
						],
						default:  '00'
					}
				]
			},
			'setup_menu': {
				label:   'Setup Menu'
			},
			'top_menu': {
				label:   'Top Menu (Disc Menu)'
			},
			'option_menu': {
				label:   'Option Menu'
			},
			'pop_up_menu': {
				label:   'Pop Up Menu'
			},
			'return': {
				label:   'Return'
			},
			'audio_dialog': {
				label:   'Audio Dialog',
				options: [
					{
						type:     'dropdown',
						label:    'Audio stream code',
						tooltip:  'Selects dialog in the BD/DVD disc.',
						id:       'code',
						required: true,
						choices:  [
							{ id: '+', label: 'Primary'   },
							{ id: '-', label: 'Secondary' }
						],
						default:  '+'
					}
				]
			},
			'subtitle': {
				label:   'Subtitle'
			},
			'enter': {
				label:   'Enter'
			},
			'disc_tray': {
				label:   'Disc Tray',
				options: [
					{
						type:     'dropdown',
						label:    'Disc Tray Open/Close',
						tooltip:  'Controls Disc Tray',
						id:       'tray',
						required: true,
						choices:  [
							{ id: 'OP', label: 'Open'  },
							{ id: 'CL', label: 'Close' }
						],
						default:  'OP'
					}
				]
			},
			'video_resolution': {
				label:   'Video Resolution',
				options: [
					{
						type:     'dropdown',
						label:    'Resolution',
						tooltip:  'Changes the resolution of HDMI',
						id:       'resolution',
						required: true,
						choices:  [
							{ id: '1', label: 'Auto'     },
							{ id: '2', label: '480/576i' },
							{ id: '3', label: '480/576p' },
							{ id: '4', label: '720p'     },
							{ id: '5', label: '1080i'    },
							{ id: '6', label: '1080p'    }
						],
						default:  '1'
					}
				]
			},
			'display_info': {
				label:   'Display/Info'
			},
			'function_color': {
				label:   'Function/Color',
				options: [
					{
						type:     'dropdown',
						label:    'Color',
						tooltip:  'Carries out a function peculiar to a disc.',
						id:       'color',
						required: true,
						choices:  [
							{ id: '1', label: 'Red'    },
							{ id: '2', label: 'Green'  },
							{ id: '3', label: 'Blue'   },
							{ id: '4', label: 'Yellow' }
						],
						default:  '1'
					}
				]
			},
			'home': {
				label:   'Home'
			},
			'ten_key': {
				label:   'Ten Key',
				options: [
					{
						type:     'number',
						label:    'Number',
						tooltip:  'Inputs 0-9',
						id:       'number',
						required: true,
						min:      0,
						max:      9,
						default:  0
					}
				]
			},
			'slow_search': {
				label:   'Slow/Search',
				options: [
					{
						type:     'dropdown',
						label:    'Direction',
						id:       'direction',
						required: true,
						choices:  [
							{ id: 'F', label: 'Forward' },
							{ id: 'R', label: 'Reverse' }
						],
						default:  'F'
					},
					{
						type:     'dropdown',
						label:    'Search Speed',
						id:       'speed',
						required: true,
						choices:  [
							{ id: 'f', label: 'Fast (cyclic 1,2,3,4,5)'          },
							{ id: 's', label: 'Slow (cyclic 1/16,1/8,1/4,1/2,1)' }
						],
						default:  'f'
					}
				]
			},
			'mute': {
				label:   'Mute',
				options: [
					{
						type:     'dropdown',
						label:    'On/Off',
						id:       'mute',
						required: true,
						choices:  [
							{ id: '00', label: 'Mute on'  },
							{ id: '01', label: 'Mute off' }
						],
						default:  '00'
					}
				]
			},
			'auto_play': {
				label:   'Auto Play',
				options: [
					{
						type:     'dropdown',
						label:    'Auto Play',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '00', label: 'On (repeat off)' },
							{ id: '01', label: 'Off'             }
						],
						default:  '00'
					}
				]
			},
			'pip_mark': {
				label:   'PIP Mark',
				options: [
					{
						type:     'dropdown',
						label:    'PIP Mark',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '00', label: 'On'  },
							{ id: '01', label: 'Off' }
						],
						default:  '00'
					}
				]
			},
			'3d_output': {
				label:   '3D Output',
				options: [
					{
						type:     'dropdown',
						label:    '3D Output',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: 'AT', label: 'Auto' },
							{ id: '01', label: 'Off'  }
						],
						default:  'AT'
					}
				]
			},
			'aspect_ratio': {
				label:   'TV Aspect Ratio',
				options: [
					{
						type:     'dropdown',
						label:    'TV Aspect Ratio',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '9W', label: '16:9 Wide'      },
							{ id: '9A', label: '16:9 Wide/Auto' },
							{ id: '3P', label: '4:3 pan & scan' },
							{ id: '3L', label: '4:3 letterbox'  }
						],
						default:  '9W'
					}
				]
			},
			'tv_system': {
				label:   'TV System',
				options: [
					{
						type:     'dropdown',
						label:    'TV System',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: 'NT', label: 'NTSC'         },
							{ id: 'PL', label: 'PAL'          },
							{ id: 'MS', label: 'Multi-system' }
						],
						default:  'NT'
					}
				]
			},
			'24_conversion': {
				label:   '1080p 24 Conversion',
				options: [
					{
						type:     'dropdown',
						label:    '1080p 24 Conversion',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '00', label: 'On'  },
							{ id: '01', label: 'Off' }
						],
						default:  '00'
					}
				]
			},
			'color_space': {
				label:   'HDMI Color Space',
				options: [
					{
						type:     'dropdown',
						label:    'HDMI Color Space',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: 'RV', label: 'RGB Video Level' },
							{ id: 'RP', label: 'RGB PC Level'    },
							{ id: 'Y4', label: 'YCbCr 4:4:4'     },
							{ id: 'Y2', label: 'YCbCr 4:2:2'     }
						],
						default:  'RV'
					}
				]
			},
			'deep_color': {
				label:   'HDMI Deep Color',
				options: [
					{
						type:     'dropdown',
						label:    'HDMI Deep Color',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '48', label: '48 Bits' },
							{ id: '36', label: '36 Bits' },
							{ id: '30', label: '30 Bits' },
							{ id: 'OF', label: 'Off'     }
						],
						default:  '48'
					}
				]
			},
			'secondary_audio': {
				label:   'Secondary Audio',
				options: [
					{
						type:     'dropdown',
						label:    'Secondary Audio',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '00', label: 'On'  },
							{ id: '01', label: 'Off' }
						],
						default:  '00'
					}
				]
			},
			'fs_setting': {
				label:   'Fs Setting',
				options: [
					{
						type:     'dropdown',
						label:    'Fs Setting',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '48', label: '48k LPCM'  },
							{ id: '96', label: '96k LPCM'  },
							{ id: '19', label: '192k LPCM' }
						],
						default:  '48'
					}
				]
			},
			'speaker_config': {
				label:   'Speaker Configuration',
				options: [
					{
						type:     'dropdown',
						label:    'Speaker/Woofer Number',
						tooltip:  'Woofer Number is fixed to 1.',
						id:       'configuration',
						required: true,
						choices:  [
							{ id: '21', label: '2.1Ch' },
							{ id: '31', label: '3.1Ch' },
							{ id: '41', label: '4.1Ch' },
							{ id: '51', label: '5.1Ch' },
							{ id: '61', label: '6.1Ch' },
							{ id: '71', label: '7.1Ch' }
						],
						default:  '21'
					}
				]
			},
			'speaker_setting': {
				label:   'SC Speaker Setting',
				options: [
					{
						type:     'dropdown',
						label:    'Type',
						id:       'type',
						required: true,
						choices:  [
							{ id: 'C', label: 'Center'         },
							{ id: 'L', label: 'Left'           },
							{ id: 'R', label: 'Right'          },
							{ id: 'l', label: 'Left Surround'  },
							{ id: 'r', label: 'Right Surround' }
						],
						default:  'C'
					},
					{
						type:     'dropdown',
						label:    'Size',
						id:       'size',
						required: true,
						choices:  [
							{ id: '0', label: 'Large' },
							{ id: '1', label: 'Small' }
						],
						default:  '0'
					},
					{
						type:     'textinput',
						label:    'Level',
						tooltip:  'Example: -01 = -1dB, +10 = +10dB',
						id:       'level',
						required: true,
						regex:    this.REGEX_LEVEL_DB
					},
					{
						type:     'number',
						label:    'Delay',
						tooltip:  'Milliseconds',
						id:       'delay',
						required: true,
						min:      0,
						max:      9999,
						default:  0
					}
				]
			},
			'firmware_upgrade': {
				label:   'Firmware Upgrade',
				options: [
					{
						type:     'dropdown',
						label:    'Firmware Upgrade',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: 'US', label: 'Via USB'  },
							{ id: 'DS', label: 'Via Disc' }
						],
						default:  'US'
					}
				]
			},
			'hdmi_cec': {
				label:   'HDMI CEC',
				options: [
					{
						type:     'dropdown',
						label:    'HDMI CEC',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: 'H1', label: 'HDMI1' },
							{ id: 'OF', label: 'Off'   }
						],
						default:  'H1'
					}
				]
			},
			'factory_reset': {
				label:   'Reset Factory Defaults'
			},
			'bd_live': {
				label:   'BD-Live Network Access',
				options: [
					{
						type:     'dropdown',
						label:    'BD-Live Network Access',
						id:       'suffix',
						required: true,
						choices:  [
							{ id: '00', label: 'On'      },
							{ id: 'LT', label: 'Limited' },
							{ id: '01', label: 'Off'     }
						],
						default:  '00'
					}
				]
			}
		})
	}

}