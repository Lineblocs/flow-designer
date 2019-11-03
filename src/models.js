var widgetDimens = {
  width: 256,
  height: 128
};
joint.shapes.devs.LaunchModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({

    type: 'devs.LaunchModel',
    size: widgetDimens,
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
    name: 'Switch',
    type: 'devs.SwitchModel',
    size: widgetDimens, 
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
    name: 'Dial',
    type: 'devs.DialModel',
    size: widgetDimens,
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
  outPorts: ['Answer', 'No Answer', 'Call Failed'],
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
    name: 'Bridge',
    type: 'devs.BridgeModel',
    size: widgetDimens,
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
    name: 'ProcessInput',
    type: 'devs.ProcessInputModel',
    size: widgetDimens,
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
    name: 'RecordVoicemail',
    type: 'devs.RecordVoicemailModel',
    size: widgetDimens,
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


joint.shapes.devs.PlaybackModel = joint.shapes.devs.Model.extend({

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><image/><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',

  defaults: joint.util.deepSupplement({
    name: 'Playback',
    type: 'devs.PlaybackModel',
    size: widgetDimens,
    attrs: {
      rect: {
        stroke: '#009900',
        fill: '#eb9b34',
      },
      circle: {
        stroke: 'gray'
      },
      '.label': {
        text: 'Playback',
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
  outPorts: ['Finished'],
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

joint.shapes.devs.Link.define('devs.FlowLink', {
      attrs: {
              ".connection": {
                "stroke-width": 1
              } 
            }
}, {
    // inherit joint.shapes.standard.Link.markup
}, {
});
