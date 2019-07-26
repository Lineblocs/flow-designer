function Model(cell, name, links, data) {
  console.log("creating new model ", arguments);
  this.cell =cell;
  this.name = name;
  this.links = links || [];
  this.data = data || {};
  this.toJSON = function() {
    return {
      id: this.cell.id,
      name: this.name,
      data: this.data
    };
  }
}
function Link(from, to, label, type, condition, value, ports) {
  this.from = from;
  this.to = to;
  this.condition = condition;
  this.type = type;
  this.value = value;
  this.label = label;
  this.ports = ports || [];
  this.toJSON = function() {
    var params = {};
    params['from'] = null;
    params['to'] = null;
    if (this.from) {
      params['from'] = this.from.id;
    }
    if (this.to) {
      params['to'] = this.to.id;
    }
    params['type'] = this.type;
    params['value'] = this.value;
    params['label'] = this.label;
    return params;
  }
}

angular
  .module('basicUsageSidenavDemo', ['ngMaterial'])
  .config(function($locationProvider) {
        $locationProvider.html5Mode(true);  
  })
  .factory("$const", function() {
    var factory = this;
    factory.LINK_CONDITION_MATCHES = "LINK_CONDITION_MATCHES";
    factory.LINK_NO_CONDITION_MATCHES = "LINK_NO_CONDITION_MATCHES";
    factory.FLOW_REMOTE_URL = "http://localhost:8001/api/flow";
    return factory;
  })
  .factory("$shared", function($mdDialog, $mdSidenav) {
    var factory = this;
    factory.models = [];
    factory.deleteWidget = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this widget ?')
            .content('removing this widget will permantely remove its data and all its links')
            .ariaLabel('Remove Widget')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
      $mdDialog.show(confirm).then(function() {
        factory.cellModel.cell.remove();
      }, function() {
      });
    }
    factory.saveWidget = function() {
      var model = factory.cellModel;
      //model.cell.attr({ text: { text:  model.name } });
      model.cell.attr('.label', {
        text: model.name,
        fill: '#FFFFFF',
        'ref-y': 50
      });
    }
    return factory;
  })
  .controller('ControlsCtrl', function ($scope, $timeout, $mdSidenav, $log, $mdDialog, $shared, $http, $location, $const, $mdSidenav) {
    $scope.$shared = $shared;
    $scope.flow = {
      "name": "Unititled Flow"
    };

    function showSaved(ev) {

      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('body')))
          .clickOutsideToClose(true)
          .title('Changes Saved')
          .content('Your flow has been saved and published. thanks')
          .ariaLabel('Saved Changes')
          .ok('ok')
          .targetEvent(ev)
      );

    }

    $scope.centerFocus = function() {
      copyPosition = null;
      paper.translate(0, 0);
    }
    $scope.zoomIn = function() {
      zoomIn();
    }

    $scope.zoomOut = function() {
      zoomOut();
    }

    $scope.saveChanges = function(ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog
      var json = graph.toJSON();
      var params = {};
      params['graph'] = json;
      var models = [];
      for (var index in $shared.models) {
        var model = $shared.models[ index ];
        var data = model.toJSON();
        data.links = model.links.map(function(link) {
          return link.toJSON();
        });
        models.push(data);
      }
      params['models'] = models;
      console.log("output JSON is ", params);

      var query = $location.search();
      var flowId = query.flowId;
      if (flowId) {
        var serverData = {};
        serverData['name'] = "";
        serverData['flow_json'] = JSON.stringify( params );

        $http.post( $const.FLOW_REMOTE_URL + "/updateFlow/" + flowId, serverData ).then(function() {
          showSaved(ev);
        }, function(err) {
          alert("An error occured");
        });
      /*
          $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('body')))
        .clickOutsideToClose(true)
        .title('This is an alert title')
        .content('You can specify some description text in here.')
        .ariaLabel('Alert Dialog Demo')
        .ok('Got it!')
        .targetEvent(ev)
    );
    */
      }
    }


  })
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http) {
    window['angularScope'] = angular.element(document.getElementById('panelCtrl')).scope();
    $scope.$shared = $shared;
    $scope.$const = $const;

    $scope.conditions = [
      'Equals',
      'Starts With',
      'Ends With',
      'Matches Any'
    ];
    $scope.playbackTypes = [
      'Say',
      'Play'
    ];
    $scope.finishRecordTypes = [
      'Keypress',
      'Silence'
    ];
    $scope.voices = [
      'Alice',
      'Joe'
    ];
    $scope.languages =[
      'en-US',
      'fr-FR'
    ];
    $scope.cellView = null;
    $scope.addLink = function(label, type, cellModel) {
      cellModel = cellModel || $shared.cellModel;
      type = type || $const.LINK_CONDITION_MATCHES;
      if (typeof label === 'undefined') {
        var label = "COndition Matches";
        label += parseInt($shared.cellModel.links.length + 1).toString();
      }
      var port = {
        id: label,
        group: 'out',
        args: {},
        label: {
            position: {
                name: 'bottom',
                args: {}
            }
        },
        attrs: { text: { text: label } },
      };
      cellModel.cell.addPort(port);
      var link = new Link( cellModel, null, label, type, null, null );
      link.ports.push( port );
      cellModel.links.push( link );
    }

    $scope.createModel = function(cell) {
      console.log("creating model for cell ", cell);
      var model = new Model(cell, "Untitled Widget");
      /*
      if (cell.attributes.type === 'devs.SwitchModel') {
        $scope.addLink("No Condition Matches", $const.LINK_NO_CONDITION_MATCHES, model);
      }
      */
      $shared.models.push( model );
    }
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

  
    $scope.loadWidget = function(cellView, openSidebar) {
      console.log("loadWidget cellView ", cellView);
      console.log("loadWidget models ", $shared.models);
      //openSidebar = openSidebar || false;
      $scope.cellView = cellView;
      for (var index in $shared.models) {
        if ($shared.models[ index ].cell.id === cellView.model.id ) {
          $shared.cellModel = $shared.models[ index ];
        }
      }
      console.log("changed cellModel to ", $shared.cellModel);
      if (openSidebar) {
        //$scope.toggleRight();
      }
      $timeout(function() {
        $scope.$apply();
      }, 0);
    }


    $scope.changePlaybackType = function(value) {
      console.log("changePlaybackType ", value);
      $shared.cellModel.data.playback_type = value;
    }

    $scope.changeFinishRecordType = function(value) {
      console.log("changeFinishRecordType ", value);
      $shared.cellModel.data.finish_record_type = value;
    }

    $scope.unsetCellModel = function() {
      $shared.cellModel = null;
      $timeout(function() {
        console.log("cellModel is now ", $shared.cellModel);
        $scope.$apply();
      }, 0);
    }
    /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    function createDynamicPort(cell, link)
    {
      var port = {
        id: link.label,
        group: 'out',
        args: {},
        label: {
            position: {
                name: 'bottom',
                args: {}
            }
        },
        attrs: { text: { text: link.label } },
      };
     cell.addPort(port);
    }
    function load() {

      var search = $location.search();
      console.log("load search is ", search);
      //var data = JSON.parse(testJSON);
      //graph.fromJSON(data.graph);
      if (search.flowId) {
        //fetch( $const.FLOW_REMOTE_URL + "/flowData/" + search.flowId ).then(function(res) {
        $http.get( $const.FLOW_REMOTE_URL + "/flowData/" + search.flowId ).then(function(res) {
          //res.json().then(function(res) {
            console.log("fetch JSON is ", res);
            if (res.data.flow_json) {
            //if (false) {
              //var data = JSON.parse(res.data.flow_json);
              var data = JSON.parse( res.data.flow_json );
              console.log("loading graph data ", data);
              graph.fromJSON(data.graph);
              var cells = graph.getCells();
              for (var index in cells) {
                var cell = cells[index];
                console.log("checking if cell needs dynamic ports ", cell);
                if (cell.attributes.type === 'devs.SwitchModel') {
                  for (var index1 in data.models) {
                    var model = data.models[index1];
                    if (model.id === cell.id) {
                      for (var index2 in model.links) {
                        var link = model.links[index2];
                        createDynamicPort(cell, link);
                      }
                    }
                  } 
                }
              }
            for (var index in data.models) {
              var model = data.models[ index ];
              for (var index1 in cells) {
                  var cell = cells[ index1 ];
                  if (model.id === cell.id) {
                    var links = [];
                    for (var index2 in model.links) {
                        var link = model.links[ index2 ];
                        var obj1 = new Link(null, null, link.label, link.type, link.condition, link.value, []);
                        links.push(obj1);
                    }
                    var obj2 = new Model(cell, model.name, links, model.data);
                    $shared.models.push(obj2);
                  }
                }
              }
            } else {
              var launch = new joint.shapes.devs.LaunchModel({
                  position: {
                      x: 0,
                      y: 0
                  }
              });
              var size = launch.size();
              launch.position(
                $("#canvas").width()/2 - (size.width / 2), 
                $("#canvas").height()/2 - (size.height / 2)
              );

              graph.addCell(launch);
              $scope.createModel(launch);
            }
          //});
        });
      }
  }

      load();
      $mdSidenav('rightWidgets').open();
  }).controller('PaperCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http) {
    $scope.$shared = $shared;
  });