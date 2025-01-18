
var offsetLeft, offsetTop, beforeInfo, launchCell, diagram, stateActions = {
  lastSave: null, 
  lastAction: null };
diagram = {};
var GRAPH_CONNECTOR = {
  name: 'rounded'
};
var GRAPH_ROUTER =  {
  name: 'manhattan'
};
/*
var DEFAULT_LINK = new joint.dia.Link({

    attrs: {

      '.connection' : { stroke: 'blue' }

    }

  });
*/
function getAngularScope() {
  return window['angularScope'];
}
function triggerAutosave() {
    var appElement = angular.element(document.getElementById('scopeCtrl'));
    var $scope = appElement.scope();
    $scope.$broadcast('graphChangesBroadcast');
}

function getSVGEl(joint)
{
  return $("g[model-id='" + joint.id + "']");
}
function getSVGInfo(joint)
{
  return getSVGEl(joint).get( 0 ).getBoundingClientRect();
}
function computeOffset() {
  console.log("before info ", beforeInfo);
  var info = getSVGInfo(launchCell);
  console.log("new info ", info);
  console.log("graph scale ", graphScale);
  offsetLeft = beforeInfo.left - info.left;
  offsetTop = beforeInfo.top - info.top;
}
function removePorts(widget) {
        widget.attributes.inPorts.forEach(function(port) {
            widget.removePort( port );
        });
        widget.attributes.outPorts.forEach(function(port) {
            widget.removePort( port );
        })
}
function appendStencilModels(graph, list)
{
  var vert = 0;
  var padding = 10;
  var widget = 128;
  var yPos = vert + padding;
  var xPos = 10;
  list.forEach( function( clazz ) {
        var widget =new clazz({
            ports: {},
            position: {
                x: xPos,
                y: yPos
            },
            size: {
              width: 256,
              height: 64
            }
        });
        var xPos = ( $("#stencil").width() / 2 ) 
        console.log("widget ", widget);
        var refY = (64 / 2) - (18 / 2);
        changeLabel(widget, widget.attributes.name, refY);
        removePorts( widget );
        graph.addCell( widget );
        var size = widget.attributes.size;
        var xPos = ( $("#stencil").width() / 2 )  - ( size.width / 2);
        widget.position( xPos, yPos );
        yPos += padding;
        yPos += widget.attributes.size.height;
  });
  $("#stencil").height(yPos);
  labelAlign("#stencil #v-8");
}
function appendStencilLibraryModels(graph, list)
{
  var vert = 0;
  var padding = 10;
  var widget = 128;
  var yPos = vert + padding;
  var xPos = 10;
  list.forEach( function( clazz ) {
        var widget =new clazz({
            ports: {},
            position: {
                x: xPos,
                y: yPos
            },
            size: {
              width: 256,
              height: 64
            }
        });
        var xPos = ( $("#stencilLibrary").width() / 2 ) 
        console.log("widget ", widget);
        var refY = (64 / 2) - (18 / 2);
        changeLabel(widget, widget.attributes.name, refY);
        removePorts( widget );
        graph.addCell( widget );
        var size = widget.attributes.size;
        var xPos = ( $("#stencilLibrary").width() / 2 )  - ( size.width / 2);
        widget.position( xPos, yPos );
        yPos += padding;
        yPos += widget.attributes.size.height;
  });
  $("#stencilLibrary").height(yPos);
  labelAlign("#stencil #v-8");
}

  var graphScale = 1;
  var numberOfZoom = 0;

  var paperScale = function(sx, sy) {
      //paper.scale(sx, sy, $("#canvas").width()/2, $("#canvas").height()/2);
      //$("#canvas").css({"zoom": sx});
      var paper = diagram['paper'];
      paper.scale(sx, sy);
  };
  var scaleDragPosition = function() {
  var scale = V(paper.viewport).scale();
  dragStartPosition = { x: x * scale.sx, y: y * scale.sy};
  }
  var zoomOut = function() {
    panAndZoom.zoomOut();
  };

  var zoomIn = function() {
    panAndZoom.zoomIn();
  };

  var resetZoom = function() {
      graphScale = 1;
      paperScale(graphScale, graphScale);
  };


function setGrid(paper, gridSize, color) {
    // Set grid size on the JointJS paper object (joint.dia.Paper instance)
    paper.options.gridSize = gridSize;
    // Draw a grid into the HTML 5 canvas and convert it to a data URI image
    var canvas = $('<canvas/>', { width: gridSize, height: gridSize });
    canvas[0].width = gridSize;
    canvas[0].height = gridSize;
    var context = canvas[0].getContext('2d');
    context.beginPath();
    context.rect(1, 1, 2, 2);
    context.fillStyle = color || '#AAAAAA';
    context.fill();
    // Finally, set the grid background image of the paper container element.
    var gridBackgroundImage = canvas[0].toDataURL('image/png');
    paper.$el.css('background-image', 'url("' + gridBackgroundImage + '")');
}

function initializeDiagram() {
  var graph = new joint.dia.Graph;
  var PAPER_HEIGHT = 768;
  var PAPER_WIDTH = "100%";
  diagram['graph'] = graph;
  var targetElement= $('#canvas')[0];
  var paper = new joint.dia.Paper({
el: $('#canvas'),
gridSize: 15,
width: PAPER_WIDTH,
height: PAPER_HEIGHT,
model: graph,
defaultConnector: GRAPH_CONNECTOR,
defaultRouter: GRAPH_ROUTER,
defaultLink: new joint.shapes.devs.FlowLink(),
drawGrid: true,
  //defaultLink: DEFAULT_LINK, 
validateMagnet: function(cellView, magnet) {
    // Prevent links from ports that already have a link
    console.log('validateMagnet' , arguments);
    var port = magnet.getAttribute('port');
    console.log("get models ", cellView.model);
    // let Launch have multiple links
    if ( cellView.model.attributes.type === 'devs.LaunchModel') {
        return true;
    }
    var links = graph.getConnectedLinks(cellView.model, { outbound: true });
    var portLinks = _.filter(links, function(o) {
        return o.get('source').port == port;
    });
    if(portLinks.length > 0) return false;
    // Note that this is the default behaviour. Just showing it here for reference.
    // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
    return magnet.getAttribute('magnet') !== 'passive';
}
}); 
var gridsize = 1;
var currentScale = 1;
        panAndZoom = svgPanZoom( document.getElementById('canvas').childNodes[2] ,
{
    viewportSelector: document.getElementById('canvas').childNodes[2].childNodes[1],
    center: false,
        fit: false,
        minZoom: 0.5,
       maxZoom: 3,
    zoomScaleSensitivity: 0.4,
    panEnabled: false,
    onZoom: function(scale){
        currentScale = scale;
        //setGrid(paper, gridsize*15*currentScale, '#808080');
    },
    beforePan: function(oldpan, newpan){
        //setGrid(paper, gridsize*15*currentScale, '#808080', newpan);
    }
});
// Example usage:
setGrid(paper, 15, '#E3E3E3');
  diagram['paper'] = paper;
  var commandManager = new joint.dia.CommandManager({ graph: graph });
  diagram['commandManager'] = commandManager;
  graph.on('change:source change:target', function(link) {
      console.log("created a link ", arguments);
      if (link.get('source').id && link.get('target').id) {
          var angular = getAngularScope();
          var source = angular.$shared.getCellById( link.get('source').id );
          var target = angular.$shared.getCellById( link.get('target').id );
          if ( source.cell.attributes.type === "devs.SwitchModel" ) {
            var port = link.get('source').port;
            source.model.links.forEach(function(link) {
              if (link.label === port) {
                link.cell = target.model.name;
              }
            });
          }
          // both ends of the link are connected.
      }
  })
  // enable interactions
  bindInteractionEvents(adjustVertices, graph, paper);
  // enable tools
  bindToolEvents(paper);
  var dragStartPosition = null;
  var copyPosition = null;
  paper.on('blank:pointerdown',
    function(event, x, y) {
      console.log("blank pointer down called");
              panAndZoom.enablePan();
        //dragStartPosition = { x: x, y: y};
        var scope = getAngularScope();
        if (scope.cellModel) {
          //scope.unsetCellModel();
        }
    }
);

paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) {
    //delete dragStartPosition;
    panAndZoom.disablePan();
});
$("#canvas")
    .mousemove(function(event) {
      /*
        if (dragStartPosition) {
            copyPosition = {};
            copyPosition.x = event.offsetX - dragStartPosition.x;
            copyPosition.y = event.offsetY - dragStartPosition.y;
            copyPosition.offsetX = event.offsetX;
            copyPosition.offsetY = event.offsetY;
            copyPosition.dragX = dragStartPosition.x;
            copyPosition.dragY = dragStartPosition.y;
            console.log("doing canvas translate");
            paper.translate(
                copyPosition.x,
                copyPosition.y);
            }
            */
                   if (dragStartPosition) {
                     /*
            paper.translate(
                event.offsetX - dragStartPosition.x, 
                event.offsetY - dragStartPosition.y);
                */
            }

    });
  paper.model.on('batch:stop', function () {
      var links = paper.model.getLinks();
      _.each(links, function (link) {
          var source = link.get('source');
          var target = link.get('target');
          console.log("batch stop info ", link);
          if ( !link.isBack ) {
            link.toBack();
            link.isBack = true;
          }
          if (source.id === undefined || target.id === undefined) {
              link.remove();
          }
          if (source.id === target.id) {
            link.remove();
          }
      });
      labelAlign();
  });

  graph.on('change:source change:target', function(link) {
      var sourcePort = link.get('source').port;
      var sourceId = link.get('source').id;
      var targetPort = link.get('target').port;
      var targetId = link.get('target').id;

      var m = [
          'The port <b>' + sourcePort,
          '</b> of element with ID <b>' + sourceId,
          '</b> is connected to port <b>' + targetPort,
          '</b> of elemnt with ID <b>' + targetId + '</b>'
      ].join('');

      out(m);
  });
  graph.on('change add remove', function () {
    triggerAutosave();
  });

  paper.on('cell:pointerdblclick',
      function(cellView, evt, x, y) { 
          getAngularScope().loadWidget(cellView, true);
      }
  );
    paper.on('cell:pointerdown',
      function(cellView, evt, x, y) { 
          evt.stopPropagation();
          console.log("load widget called..", arguments);
          getAngularScope().loadWidget(cellView, false);
      }
  );



  function out(m) {
      $('#paper-link-out').html(m);
  }


  
// Canvas from which you take shapes
var stencilGraph = new joint.dia.Graph,
  stencilPaper = new joint.dia.Paper({
    el: $('#stencil'),
    width: "100%",
    height: 768,
    model: stencilGraph,
    interactive: false
  });
  diagram['stencilGraph'] = stencilGraph;
  diagram['stencilPaper'] = stencilPaper;
var stencilLibraryGraph = new joint.dia.Graph,
  stencilLibraryPaper = new joint.dia.Paper({
    el: $('#stencilLibrary'),
    width: "100%",
    height: 768,
    model: stencilLibraryGraph,
    interactive: false
  });
  diagram['stencilLibraryGraph'] = stencilLibraryGraph;
  diagram['stencilLibraryPaper'] = stencilLibraryPaper;

  console.log("APPENDING pickers..");
  appendStencilModels(stencilGraph, [
       joint.shapes.devs.SwitchPicker,
       joint.shapes.devs.DialPicker,
       joint.shapes.devs.BridgePicker,
       joint.shapes.devs.ProcessInputPicker,
       joint.shapes.devs.RecordVoicemailPicker,
       joint.shapes.devs.PlaybackPicker,
       joint.shapes.devs.MacroPicker,
       joint.shapes.devs.StreamAudioPicker,
       joint.shapes.devs.SetVariablesPicker,
       joint.shapes.devs.ConferencePicker,
       joint.shapes.devs.SendDigitsPicker,
       joint.shapes.devs.WaitPicker
  ])
  stencilPaper.on('cell:pointerdown', function(cellView, e, x, y) {
    $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
    console.log("cell pointer down ", arguments);
      console.log("cellView is ", cellView);
      if (copyPosition) {
        console.log("copyPosition is ", copyPosition);
        console.log("initial x and y are ", x, y)
        //x = x - copyPosition.x;
        //y = y - copyPosition.y;
        console.log("drag modified x and y are ", x, y);
      }
      var info1, info2;
      var sizeShape = cellView.model.clone();
      var size = sizeShape.attributes.size;

      console.log(cellView.model);
      console.log("creating new ", cellView.model.attributes.creates);
      var flyShape = cellView.model.clone();
      var createShape = new joint.shapes.devs[cellView.model.attributes.creates]();

    var flyGraph = new joint.dia.Graph,
      flyPaper = new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        width: size.width,
        height: size.height,
        interactive: false
      }),
      //createShape = cellView.model.clone(),
      //flyShape = cellView.model.clone(),
      pos = cellView.model.position(),
      offset = {
        x: x - pos.x,
        y: y - pos.y
      };
      removePorts(flyShape);
    flyShape.position(0, 0);
    flyGraph.addCell(flyShape);
      console.log("infos are ", info1, info2);
    $("#flyPaper").offset({
      left: e.pageX - offset.x,
      top: e.pageY - offset.y
    });
    $('body').on('mousemove.fly', function(e) {
      $("#flyPaper").offset({
        left: e.pageX - offset.x,
        top: e.pageY - offset.y
      });
    });
    $('body').on('mouseup.fly', function(e) {
      var x = e.pageX,
        y = e.pageY,
        target = paper.$el.offset();
        console.log("paper el is", paper.$el);
      // Dropped over paper ?
      if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
        console.log("dropped ", flyShape);
        var s = new joint.shapes.devs[cellView.model.attributes.creates]();

        s.size( widgetDimens.width, widgetDimens.height );
        changeLabel(s, s.attributes.name);
        console.log("graph scale is ", graphScale);
        var finalX = (x - target.left - offset.x);
        var finalY = (y - target.top - offset.y);
        var stuff1 = finalX - (finalX * graphScale);
        var stuff2 = finalY - (finalY * graphScale);
        console.log("stuff is ", stuff1, stuff2);
        var myOffsetLeft, myOffsetTop, beforeInfo, afterInfo;
        console.log("final x,y before any changes ", finalX, finalY);
        s.translate(finalX, finalY);
        if (copyPosition) {
          console.log("changing final x and y based on copyPosition");
          //var finalX = (x - target.left - offset.x) + copyPosition.x;
          //var finalY = (y - target.top - offset.y) + copyPosition.y;
          //paper.translate(0, 0);
          graph.addCell(s);
          console.log("adding new cell ", s);
          s.translate(-(copyPosition.x), -(copyPosition.y));

                    var scope = getAngularScope();
          scope.createModel( s );
          //paper.translate(copyPosition.x, copyPosition.y);
        } else {
          console.log("not changing final x,y because no copyPosition");
          graph.addCell(s);
                    var scope = getAngularScope();
          scope.createModel( s );
        }
        var test = paper.clientToLocalPoint(x, y);
        var size = s.size();
        console.log("tranlated point is ", test);
        s.position(test.x - (size.width / 2), test.y - (size.height / 2));
        //s.translate(-(66*numberOfZoom), -(36*numberOfZoom));
      }
      var cell = graph.getCells()[0];

      $('body').off('mousemove.fly').off('mouseup.fly');
      flyShape.remove();
      $('#flyPaper').remove();
    });
  });
  stencilLibraryPaper.on('cell:pointerdown', function(cellView, e, x, y) {
    $('body').append('<div id="flyPaper" style="position:fixed;z-index:100;opacity:.7;pointer-event:none;"></div>');
    console.log("cell pointer down ", arguments);
      console.log("cellView is ", cellView);
      if (copyPosition) {
        console.log("copyPosition is ", copyPosition);
        console.log("initial x and y are ", x, y)
        //x = x - copyPosition.x;
        //y = y - copyPosition.y;
        console.log("drag modified x and y are ", x, y);
      }
      var info1, info2;
      var sizeShape = cellView.model.clone();
      var size = sizeShape.attributes.size;
var flyShape = cellView.model.clone();
      var createShape = new joint.shapes.devs[cellView.model.attributes.creates]();


    var flyGraph = new joint.dia.Graph,
      flyPaper = new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        width: size.width,
        height: size.height,
        interactive: false
      }),
      pos = cellView.model.position(),
      offset = {
        x: x - pos.x,
        y: y - pos.y
      };
      removePorts(flyShape);
    flyShape.position(0, 0);
    flyGraph.addCell(flyShape);
      console.log("infos are ", info1, info2);
    $("#flyPaper").offset({
      left: e.pageX - offset.x,
      top: e.pageY - offset.y
    });
    $('body').on('mousemove.fly', function(e) {
      $("#flyPaper").offset({
        left: e.pageX - offset.x,
        top: e.pageY - offset.y
      });
    });
    $('body').on('mouseup.fly', function(e) {
      var x = e.pageX,
        y = e.pageY,
        target = paper.$el.offset();
        console.log("paper el is", paper.$el);
      // Dropped over paper ?
      if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
        var s = new joint.shapes.devs[cellView.model.attributes.creates]();
        // set the custom type
        s.attributes.customType = cellView.model.attributes.customType;
        s.size( widgetDimens.width, widgetDimens.height );
        changeLabel(s, cellView.model.attributes.name);
        console.log("graph scale is ", graphScale);
        var finalX = (x - target.left - offset.x);
        var finalY = (y - target.top - offset.y);
        var stuff1 = finalX - (finalX * graphScale);
        var stuff2 = finalY - (finalY * graphScale);
        console.log("stuff is ", stuff1, stuff2);
        var myOffsetLeft, myOffsetTop, beforeInfo, afterInfo;
        console.log("final x,y before any changes ", finalX, finalY);
        s.translate(finalX, finalY);
        if (copyPosition) {
          console.log("changing final x and y based on copyPosition");
          //var finalX = (x - target.left - offset.x) + copyPosition.x;
          //var finalY = (y - target.top - offset.y) + copyPosition.y;
          //paper.translate(0, 0);
          var scope = getAngularScope();
          scope.createLibraryModel( s, cellView.model );

          graph.addCell(s);
          console.log("adding new cell ", s);
          s.translate(-(copyPosition.x), -(copyPosition.y));
          //paper.translate(copyPosition.x, copyPosition.y);
        } else {
          console.log("not changing final x,y because no copyPosition");
          var scope = getAngularScope();
          scope.createLibraryModel( s, cellView.model );
          graph.addCell(s);
        }
        var test = paper.clientToLocalPoint(x, y);
        var size = s.size();
        console.log("tranlated point is ", test);
        s.position(test.x - (size.width / 2), test.y - (size.height / 2));
        //s.translate(-(66*numberOfZoom), -(36*numberOfZoom));
      }
      var cell = graph.getCells()[0];

      $('body').off('mousemove.fly').off('mouseup.fly');
      flyShape.remove();
      $('#flyPaper').remove();
    });
  });

}

function bindHotkeys() {
    var ctrlDown = false,
        ctrlKey = 17,
        cmdKey = 91,
        vKey = 86,
        cKey = 67,
        undoKey=90,
        redoKey=89,
        enterKey=13;
    var copiedModel;
    var copiedView;

    $(document).keydown(function(e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
    }).keyup(function(e) {
        if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
    });

    // Document Ctrl + C/V 
    $(document).keydown(function(e) {
        var scope = getAngularScope();
        var active = document.activeElement;
        console.log("active element is ", active);
        var parent = $(active).parent();
        if ( e.keyCode === enterKey && ( $( active ).is("input") || ( parent && $(parent).is("md-select"))  )) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        if ( $( active ).is("input") || ( parent && $(parent).is("md-select")) || $(active).is("md-option") || $(active).is("textarea")) {
          return;
        }
        if (ctrlDown && (e.keyCode == cKey)) {
          copiedModel = scope.cellModel;
          copiedView = scope.cellView;
          console.log("Document catch Ctrl+C");
          console.log("copied model is ", copiedModel);
          console.log("copied view is ", copiedView);
        }
        if (ctrlDown && (e.keyCode == vKey)) {
          console.log("Document catch Ctrl+V");
          var type = copiedView.model.attributes.type;
          if (copiedModel && copiedView && type !== "devs.LaunchModel") {
            scope.$shared.duplicateWidgetAlt(copiedModel, copiedView);
            copiedModel = null;
            copiedView = null;
          }
        }
        if (ctrlDown && (e.keyCode == undoKey)) {
          console.log("Document catch Ctrl+Z");
          var scope = getAngularScope();
          scope.$shared.undo();
        }
        if (ctrlDown && (e.keyCode == redoKey)) {
          console.log("Document catch Ctrl+Y");
          var scope = getAngularScope();
          scope.$shared.redo();
        }

        if (e.keyCode === 8) {
          console.log("backspace detected");
          var check = angular.element("#confirmDelete"); //make sure we dont do the popup twice
          if (scope.$shared.cellModel && !check.is(":visible")) {
            scope.$shared.deleteWidget();
          }
        }

    });
}

function labelAlign(selector) { 
  selector =  selector || "#canvas #v-2";
  let targetVal = document.querySelectorAll(selector);
  let textStartPosX, iconNewStartPosX
  let iconShift = 40

  //console.log("█===>  in SVG targetVal");
  //console.log(targetVal);   // NodeList
  
  targetVal.forEach( el => {
    //console.log(el);  // full Grid SVG
    let cellNodes = el.querySelectorAll(".joint-cells-layer .joint-cell") // get All Nodes in Grid 
    let iconLabels = el.querySelectorAll(".joint-cells-layer .joint-cell  .label ")   //.node_icon   .label
    
    //console.log("// All Nodes in Grid");  // label Text data
    //console.log(cellNodes);  // label Text data

    cellNodes.forEach( el => {
    //console.log("// current Node");  // current Node
    //console.log(el);  // current Node
    
    const textLabel = el.querySelector(".label")
    if (!textLabel) {
      return;
    }
    console.dir(textLabel);  // current Label
    
    let textLabelWidth= textLabel.textLength.baseVal.value;  // get Label width
    console.log("█ textLabelWidth : ", textLabelWidth);  
    
    textStartPosX = textLabel.transform.baseVal[0].matrix.e  // get Label startPosX 
    // el.setAttribute("fill", "red")  // for test
    
    const iconNode = el.querySelector(".node_icon")
    if ( iconNode ) {
      console.dir(iconNode);  // current Icon
      
      let sub = textStartPosX - textLabelWidth/2 - iconShift
      iconNewStartPosX = iconNode.transform.baseVal[0].matrix.e = sub

      console.log(" textStartPosX : ", textStartPosX, "    iconNewStartPosX : ", iconNewStartPosX );  // current Node
    }
      
    })
  })
}


//initializeDiagram();
/*
$.get("./templates.html", function(data) {
     console.log("data is ", data);
          $(data).appendTo('body');
          angular.bootstrap(document, ['basicUsageSidenavDemo']);

      bindHotkeys();

});
*/
window.addEventListener("load", function() {
      angular.bootstrap(document, ['basicUsageSidenavDemo']);
      bindHotkeys();
      labelAlign();
      labelAlign("#stencil #v-8");
}, false);

function checkChangesSaved() {
    var lastSave = stateActions.lastSave;
    var lastAction= stateActions.lastAction;
    if ( ( ( lastAction !== null && lastSave !== null ) && lastAction >= lastSave ) 
    || (lastAction !== null && lastSave === null) ) {
      return false;
    }
    return true;
}
window.onbeforeunload = function (e) {
    e = e || window.event;

    var text = "Are you sure all your unsaved changes will be lost";
    if ( !checkChangesSaved() ) {
      // For IE and Firefox prior to version 4
      if (e) {
          e.returnValue = text;
      }

      // For Safari
      return text;
    }
};
window.addEventListener("click", function() {
  //stateActions.lastAction = Date.now();
});
window.addEventListener("keyup", function() {
  var element = document.activeElement;
  if ( !element ) {
    return;
  }
  var type = $(element).prop('nodeName');
  if ( type === 'INPUT' || type === 'TEXTAREA' ) {
    stateActions.lastAction = Date.now();
  }
});
window.addEventListener("dragstart", function() {
  stateActions.lastAction = Date.now();
});
window.addEventListener('message', function(event) {
    // IMPORTANT: check the origin of the data! 
    console.log("received window emssage ", arguments);
    if (event.origin.startsWith('https://app.lineblocs.com')) { 
      if ( event.data === 'check' ) {
        var result = checkChangesSaved();
        if ( result ) {
          parent.postMessage('saved', '*');
        } else {
          parent.postMessage('not-saved', '*');
        }
      }
    } else {
        // The data was NOT sent from your site! 
        // Be careful! Do not use it. This else branch is
        // here just for clarity, you usually shouldn't need it.
        return; 
    } 
}); 