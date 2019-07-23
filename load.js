
function getAngularScope() {
  return window['angularScope'];
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
  var paper = new joint.dia.Paper({
el: $('#canvas'),
gridSize: 20,
width: "80%",
height: 1024,
model: graph
}); 

  // enable interactions
  bindInteractionEvents(adjustVertices, graph, paper);
  // enable tools
  bindToolEvents(paper);
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
    console.log("cellView is ", cellView);
    var size = cellView.model.attributes.size;
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
    
    // Dropped over paper ?
    if (x > target.left && x < target.left + paper.$el.width() && y > target.top && y < target.top + paper.$el.height()) {
      var s = flyShape.clone();
      s.position(x - target.left - offset.x, y - target.top - offset.y);
      graph.addCell(s);
      var scope = getAngularScope();
      scope.createModel( s );
    }
    $('body').off('mousemove.fly').off('mouseup.fly');
    flyShape.remove();
    $('#flyPaper').remove();
  });
});