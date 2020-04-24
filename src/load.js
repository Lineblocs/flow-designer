
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
}

  var graphScale = 1;
  var numberOfZoom = 0;

  var paperScale = function(sx, sy) {
      //paper.scale(sx, sy, $("#canvas").width()/2, $("#canvas").height()/2);
      //$("#canvas").css({"zoom": sx});
      var paper = diagram['paper'];
      paper.scale(sx, sy);
  };

  var zoomOut = function() {
      if (numberOfZoom === -5) {
        return;
      }
      graphScale -= 0.1;
      numberOfZoom -= 1;
      paperScale(graphScale, graphScale);
  };

  var zoomIn = function() {
      if (numberOfZoom === 5) {
        return;
      }
      graphScale += 0.1;
      numberOfZoom += 1;
      paperScale(graphScale, graphScale);
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
        dragStartPosition = { x: x, y: y};
        var scope = getAngularScope();
        if (scope.cellModel) {
          //scope.unsetCellModel();
        }
    }
);

paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) {
    dragStartPosition = null;
});
$("#canvas")
    .mousemove(function(event) {
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

    });
  paper.model.on('batch:stop', function () {
            var links = paper.model.getLinks();
            _.each(links, function (link) {
                var source = link.get('source');
                var target = link.get('target');
                console.log("batch stop info ", link);
                if (source.id === undefined || target.id === undefined) {
                    link.remove();
                }
                if (source.id === target.id) {
                  link.remove();
                }
            });
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
  paper.on('cell:pointerdblclick',
    function(cellView, evt, x, y) { 
        getAngularScope().loadWidget(cellView, true);
    }
);
  paper.on('cell:pointerdown',
    function(cellView, evt, x, y) { 
        evt.stopPropagation();
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

  appendStencilModels(stencilGraph, [
       joint.shapes.devs.SwitchModel,
       joint.shapes.devs.DialModel,
       joint.shapes.devs.BridgeModel,
       joint.shapes.devs.ProcessInputModel,
       joint.shapes.devs.RecordVoicemailModel,
       joint.shapes.devs.PlaybackModel,
       joint.shapes.devs.MacroModel,
       joint.shapes.devs.SetVariablesModel,
       joint.shapes.devs.ConferenceModel,
  ]);
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
    var flyGraph = new joint.dia.Graph,
      flyPaper = new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        width: size.width,
        height: size.height,
        interactive: false
      }),
      createShape = cellView.model.clone(),
      flyShape = cellView.model.clone(),
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
        var s = flyShape.clone();
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
    var flyGraph = new joint.dia.Graph,
      flyPaper = new joint.dia.Paper({
        el: $('#flyPaper'),
        model: flyGraph,
        width: size.width,
        height: size.height,
        interactive: false
      }),
      createShape = cellView.model.clone(),
      flyShape = cellView.model.clone(),
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
        var s = flyShape.clone();
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
          scope.createLibraryModel( s );
          //paper.translate(copyPosition.x, copyPosition.y);
        } else {
          console.log("not changing final x,y because no copyPosition");
          graph.addCell(s);
          var scope = getAngularScope();
          scope.createLibraryModel( s );
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
        enterKey=89;
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
        if ( e.keyCode === enterKey ) {
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