
var offsetLeft, offsetTop, beforeInfo, launchCell;
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
  var PAPER_HEIGHT = 768;
  var PAPER_WIDTH = "100%";
  var paper = new joint.dia.Paper({
el: $('#canvas'),
gridSize: 1,
width: PAPER_WIDTH,
height: PAPER_HEIGHT,
model: graph
}); 

  // enable interactions
  bindInteractionEvents(adjustVertices, graph, paper);
  // enable tools
  bindToolEvents(paper);

  var graphScale = 1;
  var numberOfZoom = 0;

  var paperScale = function(sx, sy) {
      //paper.scale(sx, sy, $("#canvas").width()/2, $("#canvas").height()/2);
      //$("#canvas").css({"zoom": sx});
      paper.scale(sx, sy);
      computeOffset();
  };

  var zoomOut = function() {
      graphScale -= 0.1;
      numberOfZoom -= 1;
      paperScale(graphScale, graphScale);
  };

  var zoomIn = function() {
      graphScale += 0.1;
      numberOfZoom += 1;
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
      console.log("blank pointer down called");
        dragStartPosition = { x: x, y: y};
        var scope = getAngularScope();
        scope.unsetCellModel();
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
    var info1, info2;
    var sizeShape = cellView.model.clone();
    var size = sizeShape.attributes.size;
    info1 = getSVGInfo(cellView.model);
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
    info2 = getSVGInfo(flyShape);
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
launchCell = graph.getCells()[0];
beforeInfo = getSVGInfo(launchCell);