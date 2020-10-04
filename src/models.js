var widgetDimens = {
  // width: 226,
  // height:108 
  width: 320,
  height:100 
};

// var bodyOptions = {
//         stroke: '#CCCCCC'
//       };
// var rectOptions = {
//         fill: '#395373'
//        }
var labelRefY = 20;
var descriptionRefY = 60;


// NODE Label and Description CSS rules - see in file helpers.js
// in this block - CSS rules for Node block
function createDefaultAttrs(name, text) {
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



// In & OUT port
var defaultPorts = {
      groups: {

          'in': {
              position: 'top',  //left top right bottom

                label: {
                    // label layout definition:
                    position: {
                        name: 'manual', args: {
                            y: -10,
                            x: -140,
                            attrs: { '.': { 'text-anchor': 'middle' } }
                        }
                      }
                  
              },
              attrs: {
                      '.port-label': {
                          'ref-x': -140,
                          fill: '#385374'
                      },
                      '.port-body': {
                          r: 5,
                          'ref-x':-140,
                          'ref-y':0,
                          'stroke-width': 2,
                          // stroke: '#385374',
                          stroke: '#36D576',
                          fill: '#36D576',
                          padding: 20
                      }
                  }
          },

          'out': {
              position: 'bottom' , //right side - center vert
              label: {
                  position: 'outside'  // inside/outside  label position
              },
              attrs: {
                      '.port-label': {
                          fill: '#385374'
                      },
                      '.port-body': {
                        r: 5,
                        'ref-x': 0,
                        'ref-y': 0,
                        'stroke-width': 5,
                        stroke: '#385374',
                        fill: "#000878",
                        padding: 2
                      }
                }
          },

          // attrs: {
          //   '.label': { text: '_HELLO_', 'ref-x': .5, 'ref-y': .2 },
          // }
      }
};

/*
// DEF PORT SETTINGS =================================
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
                          fill: "#E88915",
                          stroke: '#CCCCCC'
                      }
                  }
          }
      }
};
// ==================================================
*/

/*
// custom PORT syle 
// using help - https://stackoverflow.com/questions/38434551/change-port-design-in-jointjs
var a = new joint.shapes.devs.Model({
  position: { x: 50, y: 50 },
  size: { width: 100, height: 100 },
  attrs: {
      '.port-label': {
          fill: 'red'
      },
      // change position and size of the 'a' port
      '.inPorts .port0 circle': {
          r: 15,
        'ref-x': -20,
        'ref-y': 10,
        stroke: 'red',
        'stroke-width': 5
      }, 
      // change color on a single port 
      '.inPorts .port0 .port-label': {
          fill: 'blue',
      }
  },
  inPorts: ['a', 'aa', 'aaa'],
  outPorts: ['b']
});
*/



  /* var defaultMarkup = 
    `<g class="rotatable">
      <g class="scalable">
        <rect rx="10" ry="10" class="body"/>
      </g>
      <image/>
      <text class="label"/>
      <text class="description"/>
      <g class="inPorts"/>
      <g class="outPorts"/>
    </g>`;
  */




  /*
  //  NODE CODE for library
  var defaultMarkupLib = 
  `<g class="rotatable">

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
  
    <line 
        id="separatу-line_16_" 
        class="line" 
        x1="11.6" y1="50.5" x2="161.6" y2="50.5"/>
  </g>

  <g class="user-info">
    <path 
        class="icon-stroke"
        d="M57.1,39.7l3.6-3.6L56,31.3l-2.2,2.2l-8.3-8.3
      l2.2-2.2L43,18.2l-3.6,3.6C41.4,30.3,48.5,37.3,57.1,39.7z"/>
    
    <text 
        class="st9 font-Roboto font-16 label"
        transform="matrix(1 0 0 1 69.3223 33.5857)">
        Call_user
    </text>
  </g>
  
  <text 
      id="dial_31_" 
      class="st9 font-Roboto font-14 description"
      transform="matrix(1 0 0 1 33.7396 76.2296)">
      Dial 1232424124
  </text>

</g>`


//  NODE CODE for grid
  var defaultMarkup = 
  `<svg>	
    <g class="rotatable">

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

      <g  class="scalable shadow  base-body">
        <path class="body" 
              d="M316.5,100.5H3.5c-1.7,0-3-1.3-3-3v-94c0-1.7,1.3-3,3-3h313c1.7,0,3,1.3,3,3v94
          C319.5,99.2,318.1,100.5,316.5,100.5z"/>
      </g>


      <line id="separatу-line_11_" 
            class="line" 
            x1="10.5" y1="50.5" 
            x2="309.5" y2="50.5"/>


      <g class="user-info">
        <path  
            id="icon-phone" 
            class="icon-stroke" 
            d="M130.6,39.7l3.6-3.6l-4.8-4.8l-2.2,2.2l-8.3-8.3l2.2-2.2l-4.8-4.8l-3.6,3.6C114.9,30.4,121.9,37.4,130.6,39.7z"/>
        
        <text 
            transform="matrix(1 0 0 1 142.7391 33.6326)" 
            class="st9 font-Roboto font-16 label">
          Call_user
        </text>
      </g>

      <text transform="matrix(1 0 0 1 107.1563 76.2765)" 
            class="st9 font-Roboto font-14 description">
            Dial 1232424124
      </text>

  </g>
</svg>`
*/


/*
// IN & OUT PORTs code  & body status code 

      <path id="status-body_13_" 
            class="base-body" 
            d="M67.3,110.5H20.5c-5.5,0-10-4.5-10-10v0c0-5.5,4.5-10,10-10h46.9c5.5,0,10,4.5,10,10v0
        C77.3,106.1,72.9,110.5,67.3,110.5z"/>

      <path id="status-body_12_" 
            class="base-body" 
            d="M191.8,110.5h-63.6c-5.5,0-10-4.5-10-10v0c0-5.5,4.5-10,10-10h63.6c5.5,0,10,4.5,10,10v0
        C201.8,106.1,197.3,110.5,191.8,110.5z"/>

      <path id="status-body_11_" 
            class="base-body" 
            d="M299.5,110.5h-51.6c-5.5,0-10-4.5-10-10v0c0-5.5,4.5-10,10-10h51.6c5.5,0,10,4.5,10,10v0
        C309.5,106.1,305,110.5,299.5,110.5z"/>

        

  <circle id="dot-input inPorts" class="st5" cx="12.6" cy="11.3" r="3"/>


  <g class="outPorts">
        <circle id="dot-output_101_" class="st5" cx="19.6" cy="100.5" r="3"/>
        <text transform="matrix(1 0 0 1 26.2242 103.4767)" 
              class="st9 font-Roboto font-10">
              Answered
        </text>
      </g>

      <g class="outPorts">
        <circle id="dot-output_100_" class="st6" cx="126.3" cy="100.5" r="3"/>
        <text transform="matrix(1 0 0 1 132.9925 103.4767)" 
              class="st9 font-Roboto font-10">
              No Answered
        </text>
      </g>

      <g class="outPorts">
        <circle id="dot-output_98_" class="st7" cx="248.2" cy="100.5" r="3"/>
        <text transform="matrix(1 0 0 1 254.8582 103.4767)" 
              class="st9 font-Roboto font-10">
              Call Failed
        </text>
      </g>
====================================================
*/


  
  var defaultMarkup = 
    `<g class="rotatable">

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

      <g  class="scalable" filter="url(#call-shadow)">
        <path class="body"
              fill="#FFFFFF"
              stroke="#385374"
              stroke-miterlimit="10" 
              d="M316.5,100.5H3.5c-1.7,0-3-1.3-3-3v-94c0-1.7,1.3-3,3-3h313c1.7,0,3,1.3,3,3v94
          C319.5,99.2,318.1,100.5,316.5,100.5z"/>
      </g>

      <line id="separatу-line_11_" 
            fill="none"
            stroke="#ECE5F0"
            stroke-miterlimit="10"
            x1="10.5" y1="50.5" 
            x2="309.5" y2="50.5"/>

      <path 
        id="icon-phone" 
        fill="none" stroke="#36D576"  stroke-miterlimit="10"
        d="M130.6,39.7l3.6-3.6l-4.8-4.8l-2.2,2.2l-8.3-8.3l2.2-2.2l-4.8-4.8l-3.6,3.6
        C114.9,30.4,121.9,37.4,130.6,39.7z"/>

      <text transform="matrix(1 0 0 1 142.7391 33.6326)" 
            class="label" 
            font-family="'Roboto-Regular', Arial, Helvetica, sans-serif"
            fill="#385374" font-size="16px">
            "Call_user"
      </text>

      <text transform="matrix(1 0 0 1 107.1563 76.2765)" 
            class="description" 
            font-family="'Roboto-Regular', Arial, Helvetica, sans-serif"
            fill="#385374" font-size="14px">
            "Dial 1232424124"
      </text>

    </g>`;
  

// Launch NODE  
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


// Switch NODE
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

// Dial NODE
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

// Bridge NODE
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

// Process NODE
joint.shapes.devs.ProcessInputModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Process Input',
    type: 'devs.ProcessInputModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("ProcessInput", "Gather input on a call"),
  
  inPorts: ['In'],
  outPorts: ['Digits Received', 'Speech Received', 'No Input'],
  ports:defaultPorts,

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

// Record Voice NODE
joint.shapes.devs.RecordVoicemailModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Record Voicemail',
    type: 'devs.RecordVoicemailModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("RecordVoicemail", "Record voicemail"),
  inPorts: ['In'],
  outPorts: ['Record Complete', 'No Audio', 'Hangup'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

// Playback NODE
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

// Macro NODE
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

// SetVariable NODE
joint.shapes.devs.SetVariablesModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Set Variables',
    type: 'devs.SetVariablesModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("SetVariables", "set variables in the flow runtime"),
  inPorts: ['In'],
  outPorts: ['Completed', 'Error'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SetVariablesView = joint.shapes.devs.ModelView;

// Conference NODE
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

// Send Digits NODE
joint.shapes.devs.SendDigitsModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'SendDigits',
    type: 'devs.SendDigitsModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("SendDigits", "send digits to the channel"),
  inPorts: ['In'],
  outPorts: ['Completed', 'Error'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.SendDigitsView = joint.shapes.devs.ModelView;

// Wait NODE
joint.shapes.devs.WaitModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Wait',
    type: 'devs.WaitModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Wait", "pause execution on channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.WaitView = joint.shapes.devs.ModelView;

// Hang up NODE
joint.shapes.devs.HangupModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'Hangup',
    type: 'devs.HangupModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("Hangup", "hangup a channel"),
  inPorts: ['In'],
  outPorts: ['Completed'],
  ports: defaultPorts
  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.HangupView = joint.shapes.devs.ModelView;


// Flow STYLE
joint.shapes.devs.Link.define('devs.FlowLink', {
      attrs: {
              ".connection": {
                "stroke-width": 2,  // old value: 1
                "stroke": "gray",  // old value: del param
                "stroke-dasharray": 10  // old value: del param
              } 
            }
}, {
    // inherit joint.shapes.standard.Link.markup
}, {
});
function createModelFromTemplate(template) {
  var title = template.title;

  console.log("create ", template);
  //var type = 'devs.'+title+'Model';
  var originalType = template.data.attributes.type;
  var splitted = originalType.split(".");
  var type = joint.shapes.devs[splitted[1]];
  var model = title+'Picker';
  var view = title+'PickerView';
  var tag = template.data.attributes.attrs['.description']['text'];
  var inPorts = template.data.attributes.inPorts;
  var outPorts = template.data.attributes.outPorts;
  console.log("from template model is: " + model);
  console.log("from template type is: " + splitted[1]);
  var creates = splitted[1];

  joint.shapes.devs[model] = type.extend({

    markup: createPickerMarkup(),


    defaults: joint.util.deepSupplement({
      name: title,
      type: originalType,
      size: widgetDimens,
      attrs: createDefaultAttrs(title, tag),
      customType: model,
      creates: creates,
      data: template.data.saved,
    inPorts: inPorts,
    outPorts: outPorts,
    ports: defaultPorts
    }, joint.shapes.devs.Model.prototype.defaults)
  });
  joint.shapes.devs[view] = joint.shapes.devs.ModelView;
  return joint.shapes.devs[model];
}