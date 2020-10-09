function createPickerMarkup(icon) {
 var icon = icon || `<path 
          class="icon-stroke"
					transform="matrix(1 0 0 1 0 0)"
          d="M57.1,39.7l3.6-3.6L56,31.3l-2.2,2.2l-8.3-8.3
        l2.2-2.2L43,18.2l-3.6,3.6C41.4,30.3,48.5,37.3,57.1,39.7z"/>`;

  var pickerMarkup = `<g class="rotatable">

		<filter  filterUnits="objectBoundingBox" id="call-shadow">
			<feGaussianBlur  in="SourceAlpha" stdDeviation="2"></feGaussianBlur>
			<feOffset  dx="2" dy="2"></feOffset>
			<feComponentTransfer>
				<feFuncA type="linear" slope="0.3"/>
			</feComponentTransfer>
			<feMerge>
				<feMergeNode  in="offsetBlurredAlpha"></feMergeNode>
				<feMergeNode  in="SourceGraphic"></feMergeNode>
			</feMerge>
		</filter>
		
		<g class="scalable shadow base-body">
			<path 
					class="body" 
					d="M169.7,100.5H3.5c-1.7,0-3-1.3-3-3v-94
					c0-1.7,1.3-3,3-3h166.2c1.7,0,3,1.3,3,3v94C172.7,99.2,171.3,100.5,169.7,100.5z"/> 
		
			<!-- <line 
					id="separatу-line_16_" 
					class="line" 
					x1="11.6" y1="50.5" x2="161.6" y2="50.5"/> -->
		</g>

    <g class="user-info node-lib">
    ` + icon +  `
      <text 
          class="st9 font-Roboto font-16 label"
          transform="matrix(1 0 0 1 65 55)">
          Call_user
      </text>
    </g>
    
    <!-- <text 
        id="dial_31_" 
        class="st9 font-Roboto font-14 description"
        transform="matrix(1 0 0 1 33.7396 76.2296)">
        Dial 1232424124
    </text> -->

  </g>`;


return pickerMarkup;
}

// NODE Label and Description CSS rules - see in file helpers.js
// in this block - CSS rules for Node block
function createPickerDefaultAttrs(name, text) {
  var defaultAttrs = {
    '.body': { 
            stroke: '#395373',
            strokeWidth: 1
            },
            rect: { fill: '#395373' },
            circle: {
    },
    '.label': {
          text: name,
          fill: '#395373',
          'ref-y': labelRefY
    },
    '.description': {
          text: text,
          fill: '#395373',
          'ref-y': descriptionRefY,
          'font-size': '12px',
          'ref-x': .5,
          'text-anchor': 'middle'
    },

    '.inPorts circle': {
          fill: '#c8c8c8',
          stroke: '#E3E3E3'
    },
    // '.outPorts circle': {
    //       fill: '#262626',
    // },

    // '.shadow'     :      {filter:'url(#call-shadow)'},
    '.base-body'  :      {fill:'#FFFFFF', stroke:'#385374', strokeMiterlimit:'10', overflow:"visible"},
    '.line'       :      {fill:'none', stroke:'#ECE5F0', strokeMiterlimit:'10'},
    '.st5'        :      {fill:'#36D576'},
    '.st6'        :      {fill:'#E88915'},
    '.st7'        :      {fill:'#E46298'},
    '.st9'        :      {fill:'#385374'},
    '.icon-stroke':      {fill:'none',stroke:'#36D576', strokeMiterlimit:'10'},
    '.font-Roboto':      {fontFamily:'"Roboto-Regular", Arial, Helvetica, sans-serif', fill:'#385374'},
    '.font-16'    :      {fontSize:'16px'},
    '.font-14'    :      {fontSize:'14px'},
    '.font-10'    :      {fontSize:'10px'},
    // '.user-info'  :      {minWidth:'50px', display:'flex', justifyContent:'space-between'},
  };

  return defaultAttrs;
}


joint.shapes.devs.SwitchPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_SWITCH),

  defaults: joint.util.deepSupplement({
    name: 'Switch',
    type: 'devs.SwitchPicker',
    creates: 'SwitchModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SwitchPickerView = joint.shapes.devs.ModelView;


joint.shapes.devs.DialPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_DIAL),

  defaults: joint.util.deepSupplement({
    name: 'Dial',
    type: 'devs.DialPicker',
    creates: 'DialModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.DialPickerView = joint.shapes.devs.ModelView;


joint.shapes.devs.BridgePicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_BRIDGE),

  defaults: joint.util.deepSupplement({
    name: 'Bridge',
    type: 'devs.BridgePicker',
    creates: 'BridgeModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.BridgePickerView = joint.shapes.devs.ModelView;


joint.shapes.devs.ProcessInputPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_INPUT),

  defaults: joint.util.deepSupplement({
    name: 'ProcessInput',
    type: 'devs.ProcessInputPicker',
    creates: 'ProcessInputModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputPickerView = joint.shapes.devs.ModelView;

joint.shapes.devs.RecordVoicemailPicker = joint.shapes.devs.Model.extend({


  markup: createPickerMarkup(ICON_RECORD),

  defaults: joint.util.deepSupplement({
    name: 'RecordVoicemail',
    type: 'devs.RecordVoicemailPicker',
    creates: 'RecordVoicemailModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.RecordVoicemailPickerView = joint.shapes.devs.ModelView;

joint.shapes.devs.PlaybackPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_PLAYBACK),

  defaults: joint.util.deepSupplement({
    name: 'Playback',
    type: 'devs.PlaybackPicker',
    creates: 'PlaybackModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.PlaybackPickerView = joint.shapes.devs.ModelView;


joint.shapes.devs.MacroPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_MACRO),

  defaults: joint.util.deepSupplement({
    name: 'Macro',
    type: 'devs.MacroPicker',
    creates: 'MacroModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.MacroPickerView = joint.shapes.devs.ModelView;

joint.shapes.devs.SetVariablesPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_SET),

  defaults: joint.util.deepSupplement({
    name: 'SetVariables',
    type: 'devs.SetVariablesPicker',
    creates: 'SetVariablesModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SetVariablesPickerView = joint.shapes.devs.ModelView;




joint.shapes.devs.ConferencePicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_CONF),

  defaults: joint.util.deepSupplement({
    name: 'Conference',
    type: 'devs.ConferencePicker',
    creates: 'ConferenceModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ConferencePickerView = joint.shapes.devs.ModelView;


joint.shapes.devs.SendDigitsPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_SEND),

  defaults: joint.util.deepSupplement({
    name: 'SendDigits',
    type: 'devs.SendDigitsPicker',
    creates: 'SendDigitsModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SendDigitsPickerView = joint.shapes.devs.ModelView;


joint.shapes.devs.WaitPicker = joint.shapes.devs.Model.extend({

  markup: createPickerMarkup(ICON_WAIT),

  defaults: joint.util.deepSupplement({
    name: 'Wait',
    type: 'devs.WaitPicker',
    creates: 'WaitModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.WaitPickerView = joint.shapes.devs.ModelView;