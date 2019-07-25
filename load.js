
var offsetLeft, offsetTop, beforeInfo, launchCell;
function getAngularScope() {
  return window['angularScope'];
}
function getSVGInfo(joint)
{
  return $("g[model-id='" + joint.id + "']").get( 0 ).getBoundingClientRect();
}
function computeOffset() {
  var info = getSVGInfo(launchCell);
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
  list.forEach( function( clazz ) {
        var widget =new clazz({
            ports: {},
            position: {
                x: 10,
                y: vert + padding
            }
        });
        console.log("widget ", widget);
        removePorts( widget );
        graph.addCell( widget );
        vert += widget.attributes.size.height;
  });
}

  var graph = new joint.dia.Graph;
  var PAPER_HEIGHT = 1024;
  var PAPER_WIDTH = "80%";
  var paper = new joint.dia.Paper({
el: $('#canvas'),
gridSize: 20,
width: PAPER_WIDTH,
height: PAPER_HEIGHT,
model: graph
}); 

  // enable interactions
  bindInteractionEvents(adjustVertices, graph, paper);
  // enable tools
  bindToolEvents(paper);

  var graphScale = 1;

  var paperScale = function(sx, sy) {
      //$("#canvas").css({"zoom": sx});
      paper.scale(sx, sy);
      stencilPaper.scale(sx, sy);
      computeOffset();
  };

  var zoomOut = function() {
      graphScale -= 0.1;
      paperScale(graphScale, graphScale);
  };

  var zoomIn = function() {
      graphScale += 0.1;
      paperScale(graphScale, graphScale);
  };

  var resetZoom = function() {
      graphScale = 1;
      paperScale(graphScale, graphScale);
  };

  var dragStartPosition = null;
  var copyPosition = null;
  paper.on('blank:pointerdown',
    function(event, x, y) {
        dragStartPosition = { x: x, y: y};
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
  var launch = new joint.shapes.devs.LaunchModel({
      position: {
          x: 500,
          y: 0
      }
  });
  graph.addCell(launch);

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
        getAngularScope().loadWidget(cellView);
    }
);

  function out(m) {
      $('#paper-link-out').html(m);
  }


  
// Canvas from which you take shapes
var stencilGraph = new joint.dia.Graph,
  stencilPaper = new joint.dia.Paper({
    el: $('#stencil'),
    width: "20%",
    height: 1024,
    model: stencilGraph,
    interactive: false
  });

  appendStencilModels(stencilGraph, [
       joint.shapes.devs.SwitchModel,
       joint.shapes.devs.DialModel,
       joint.shapes.devs.BridgeModel,
       joint.shapes.devs.ProcessInputModel,
       joint.shapes.devs.RecordVoicemailModel
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
    var sizeShape = cellView.model.clone();
    sizeShape.scale(graphScale, graphScale);
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
    //flyPaper.scale(graphScale, graphScale);
    removePorts(flyShape);
  flyShape.position(0, 0);
  flyPaper.scale(graphScale, graphScale);
  flyGraph.addCell(flyShape);
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
      var finalX = (x - target.left - offset.x);
      var finalY = (y - target.top - offset.y);
      console.log("final x,y before any changes ", finalX, finalY);

      if (copyPosition) {
        console.log("changing final x and y based on copyPosition");
        //var finalX = (x - target.left - offset.x) + copyPosition.x;
        //var finalY = (y - target.top - offset.y) + copyPosition.y;
        //paper.translate(0, 0);
        s.position(finalX, finalY);
        graph.addCell(s);
        console.log("adding new cell ", s);
        s.translate(-(copyPosition.x), -(copyPosition.y));
        var scope = getAngularScope();
        scope.createModel( s );
        //paper.translate(copyPosition.x, copyPosition.y);
      } else {
        console.log("not changing final x,y because no copyPosition");
        s.position(finalX, finalY);
        graph.addCell(s);
        console.log('SVG info x, y changes are ', x, y);
        var scope = getAngularScope();
        scope.createModel( s );
      }
      removePorts( s );
      if (graphScale !== 0) {
        console.log("doing graph scale adjustments on ", s);
        computeOffset();
        var curr = s.position();
        console.log("current position is ", curr);

        s.position(curr.x + offsetLeft, curr.y + offsetTop);
        //s.translate(-(offsetLeft), -(offsetTop));
        /*
        var cellInfo = getSVGInfo(s);
        console.log("after fly info is ", cellInfo);
        var x = cellInfo.x - fly.width;
        var height = cellSize.height - flySize.height;
        console.log("after width, height is ", width, height);
        s.translate(-(width), -(height));
        */
      }
    }
    $('body').off('mousemove.fly').off('mouseup.fly');
    flyShape.remove();
    $('#flyPaper').remove();
  });
});
launchCell = graph.getCells()[0];
beforeInfo = getSVGInfo(launchCell);