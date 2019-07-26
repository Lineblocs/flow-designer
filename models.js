joint.shapes.devs.LaunchModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.LaunchModel',
    size: {
      width: 256,
      height: 128
    },
    attrs: {
      rect: {
        stroke: '#d1d1d1',
        fill: '#3366cc',
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Launch',
        fill: '#FFFFFF',
        'ref-y': 50
      },
      '.inPorts circle': {
        fill: '#c8c8c8'
      },
      '.outPorts circle': {
        fill: '#262626'
      },
      /*
      image: {
        'xlink:href': 'https://jointjs.com/images/logo.png',
        width: 80,
        height: 50,
        'ref-x': .5,
        'ref-y': .5,
        ref: 'rect',
        'x-alignment': 'middle',
        'y-alignment': 'middle'
      }
      */
    },
    inPorts: [],
    outPorts: ['Incoming Call'],
    ports: {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                }
            }
        }
    }

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.LaunchView = joint.shapes.devs.ModelView;

joint.shapes.devs.SwitchModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.SwitchModel',
    size: {
      width: 256,
      height: 128
    },
    attrs: {
      rect: {
        stroke: '#d1d1d1',
        fill: '#3366cc',
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Switch',
        fill: '#FFFFFF',
        'ref-y': 50
      },
      '.inPorts circle': {
        fill: '#c8c8c8'
      },
      '.outPorts circle': {
        fill: '#262626'
      }
    },
    inPorts: ['In'],
    outPorts: ['No Condition Matches'],
    ports: {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                }
            }
        }
    }

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SwitchView = joint.shapes.devs.ModelView;

joint.shapes.devs.DialModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.DialModel',
    size: {
      width: 256,
      height: 128
    },
    attrs: {
      rect: {
        stroke: '#d1d1d1',
        fill: '#3366cc'
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Dial',
        fill: '#FFFFFF',
        'ref-y': 50
      },
      '.inPorts circle': {
        fill: '#c8c8c8'
      },
      '.outPorts circle': {
        fill: '#262626'
      }
    },
  inPorts: ['In'],
  outPorts: ['Busy', 'No Answer', 'Call Failed'],
  ports: {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                }
            }
        }
    }

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.DialView = joint.shapes.devs.ModelView;

joint.shapes.devs.BridgeModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.BridgeModel',
    size: {
      width: 256,
      height: 128
    },
    attrs: {
      rect: {
        stroke: '#d1d1d1',
        fill: '#cc0000'
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Bridge',
        fill: '#FFFFFF',
        'ref-y': 50
      },
      '.inPorts circle': {
        fill: '#c8c8c8'
      },
      '.outPorts circle': {
        fill: '#262626'
      }
    },
  inPorts: ['In'],
  outPorts: ['Connected Call Ended', 'Caller Hung Uo'],
  ports: {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                }
            }
        }
    }

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.BridgeView = joint.shapes.devs.ModelView;

joint.shapes.devs.ProcessInputModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.ProcessInputModel',
    size: {
      width: 256,
      height: 128
    },
    attrs: {
      rect: {
        stroke: '#009900',
        fill: '#009900'
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Process Input',
        fill: '#FFFFFF',
        'ref-y': 50
      },
      '.inPorts circle': {
        fill: '#c8c8c8'
      },
      '.outPorts circle': {
        fill: '#262626'
      }
    },
  inPorts: ['In'],
  outPorts: ['Digits Received', 'Speech Received'],
  ports: {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                }
            }
        }
    }

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

joint.shapes.devs.RecordVoicemailModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.RecordVoicemailModel',
    size: {
      width: 256,
      height: 128
    },
    attrs: {
      rect: {
        stroke: '#009900',
        fill: '#808080',
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Record Voicemail',
        fill: '#FFFFFF',
        'ref-y': 50
      },
      '.inPorts circle': {
        fill: '#c8c8c8'
      },
      '.outPorts circle': {
        fill: '#262626'
      }
    },
  inPorts: ['In'],
  outPorts: ['Record Complete', 'No Audio', 'Hangup'],
  ports: {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                }
            }
        }
    }

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

joint.shapes.devs.UnspecifiedProcess = joint.shapes.devs.Model.extend(_.extend({}, joint.plugins.TooledModelInterface, {
markup: ['<g class="rotatable">',
            '<g class="scalable">',
                '<rect class="body"/>',
                '<g xmlns="http://www.w3.org/2000/svg" transform="translate(-549.49953,-824.87393)" id="layer1">',
                    '<g transform="matrix(0.933025,0,0,-0.2986125,549.49953,846.37362)" id="g3553">',
                      '<g transform="scale(0.98976,3.0047)" id="g3555">',
                        '<g clip-path="url(#clipPath3559)" id="g3557">',
                          '<path d="m 57.805,0.90155 -57.805,0 0,23.06045 57.805,0 L 72.244,12.432 57.805,0.90155 z" id="path3563" style="fill:#b8cde8;fill-opacity:1;fill-rule:evenodd;stroke:none"/>',
                        '</g>',
                      '</g>',
                    '</g>',
                '</g>',
            '</g>',
            '<g class="inPorts"/>',
            '<g class="outPorts"/>',
            '<g class="moveTool"/>',
            '<g class="resizeTool"/>',
            '<g class="portsTool"/>',
            '<g class="deleteTool"/>',
            '<title class="tooltip"/>',
        '</g>'].join(''),
  defaults: joint.util.deepSupplement({
      type: 'devs.UnspecifiedProcess',
      inPorts: [''],
      outPorts: [''],
      moveTool: true,
      resizeTool: true,
      deleteTool: true,
      size: { width: 100, height: 31},
    attrs: {
        '.inPorts circle': { fill: '#fff' },
        '.outPorts circle': { fill: '#fff' },
        '.body': {
            width: 67, height: 21,
            stroke: 'none'
        },
    }
  }, joint.shapes.devs.Model.prototype.defaults),
}));
joint.shapes.devs.UnspecifiedProcessView = joint.dia.ElementView.extend(joint.plugins.TooledViewInterface);