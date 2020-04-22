var widgetDimens = {
  width: 226,
  height:108 
};
var bodyOptions = {
        stroke: '#CCCCCC'
      };
var rectOptions = {
        fill: '#395373' }
        var labelRefY = 30;
        var descriptionRefY = 70;

function createDefaultAttrs(name, text) {
var defaultAttrs = {
      '.body': {
        stroke: '#CCCCCC'
      },
      rect: {
        fill: '#395373' },
      circle: {
      },
      '.label': {
        text: name,
        fill: '#FFFFFF',
        'ref-y': labelRefY
      },
      '.description': {
        text: text,
        fill: '#FFFFFF',
        'ref-y': descriptionRefY,
        'font-size': '12px',
        'ref-x': .5,
        'text-anchor': 'middle'
      },

      '.inPorts circle': {
        fill: '#c8c8c8',
        stroke: '#E3E3E3'
      },
      '.outPorts circle': {
        fill: '#262626',

      }
    };
    return defaultAttrs;
  }
var defaultPorts = {
        groups: {
            'in': {
                position: 'top',
                label: {
                position: 'outside'
                },
                attrs: {
                        '.port-body': {
                            stroke: '#CCCCCC'
                        }
                    }
            },
            'out': {
                position: 'bottom',
                label: {
                position: 'outside'
                },
                attrs: {
                        '.port-body': {
                            stroke: '#CCCCCC'
                        }
                    }
            }
        }
    };

var defaultMarkup = '<g class="rotatable"><g class="scalable"><rect rx="10" ry="10" class="body"/></g><image/><text class="label"/><text class="description"/><g class="inPorts"/><g class="outPorts"/></g>';

joint.shapes.devs.LaunchModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: "Launch",
    type: 'devs.LaunchModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Launch", "the flow entrypoint"),
    inPorts: [],
    outPorts: ['Incoming Call'],
    ports: defaultPorts

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.LaunchView = joint.shapes.devs.ModelView;

joint.shapes.devs.SwitchModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Switch',
    type: 'devs.SwitchModel',
    size: widgetDimens, 
    attrs: createDefaultAttrs("Switch", "Change flow based on condition"),
    inPorts: ['In'],
    outPorts: ['No Condition Matches'],
    ports: defaultPorts

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SwitchView = joint.shapes.devs.ModelView;

joint.shapes.devs.DialModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Dial',
    type: 'devs.DialModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Dial", "Dial a number on a new line"), 
    inPorts: ['In'],
    outPorts: ['Answer', 'No Answer', 'Call Failed'],
    ports: defaultPorts,
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.DialView = joint.shapes.devs.ModelView;

joint.shapes.devs.BridgeModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Bridge',
    type: 'devs.BridgeModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Bridge", "Connect this call to an extension/phone"),
  inPorts: ['In'],
  outPorts: ['Connected Call Ended', 'Caller Hung Uo'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.BridgeView = joint.shapes.devs.ModelView;

joint.shapes.devs.ProcessInputModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'ProcessInput',
    type: 'devs.ProcessInputModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("ProcessInput", "Gather input on a call"),
  
  inPorts: ['In'],
  outPorts: ['Digits Received', 'Speech Received', 'No Input'],
  ports:defaultPorts,

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

joint.shapes.devs.RecordVoicemailModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'RecordVoicemail',
    type: 'devs.RecordVoicemailModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("RecordVoicemail", "Record voicemail"),
  inPorts: ['In'],
  outPorts: ['Record Complete', 'No Audio', 'Hangup'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;


joint.shapes.devs.PlaybackModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Playback',
    type: 'devs.PlaybackModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Playback", "Playback an MP3 or TTS"),
  inPorts: ['In'],
  outPorts: ['Finished'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.PlaybackView = joint.shapes.devs.ModelView;


joint.shapes.devs.MacroModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Macro',
    type: 'devs.MacroModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Macro", "add custom code to your flow"),
  inPorts: ['In'],
  outPorts: ['Completed', 'Error'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.MacroView = joint.shapes.devs.ModelView;

joint.shapes.devs.SetVariablesModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'SetVariables',
    type: 'devs.SetVariablesModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("SetVariables", "set variables in the flow runtime"),
  inPorts: ['In'],
  outPorts: ['Completed', 'Error'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SetVariablesView = joint.shapes.devs.ModelView;


joint.shapes.devs.ConferenceModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Conference',
    type: 'devs.ConferenceModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Conference", "set variables in the flow runtime"),
  inPorts: ['In'],
  outPorts: ['Conference Completed', 'Error'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ConferenceView = joint.shapes.devs.ModelView;

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
function createModelFromTemplate(template) {
  var title = template.title;

  //var type = 'devs.'+title+'Model';
  var originalType = template.data.attributes.type;
  var splitted = originalType.split(".");
  var type = joint.shapes.devs[splitted[1]];
  var model = title+'Model';
  var view = title+'View';
  var tag = template.data.attributes.attrs['.description']['text'];
  var inPorts = template.data.attributes.inPorts;
  var outPorts = template.data.attributes.outPorts;

  joint.shapes.devs[model] = type.extend({

    markup: defaultMarkup,

    defaults: joint.util.deepSupplement({
      name: title,
      type: originalType,
      size: widgetDimens,
      attrs: createDefaultAttrs(title, tag),
    inPorts: inPorts,
    outPorts: outPorts,
    ports: defaultPorts
    }, joint.shapes.devs.Model.prototype.defaults)
  });
  joint.shapes.devs[view] = joint.shapes.devs.ModelView;
  return joint.shapes.devs[model];
}

