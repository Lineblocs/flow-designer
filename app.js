function Model(cell, name, links, data) {
  this.cell =cell;
  this.name = name;
  this.links = links || [];
  this.data = data || {};
}
function Link(from, to, condition, value, ports) {
  this.from = from;
  this.to = to;
  this.condition = condition;
  this.value = value;
  this.ports = ports || [];
}

angular
  .module('basicUsageSidenavDemo', ['ngMaterial'])
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    window['angularScope'] = angular.element(document.getElementById('panelCtrl')).scope();

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
    $scope.models = [];
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');
    $scope.cellView = null;
    $scope.cellModel = null;
    $scope.addLink = function() {
      var label = "Out ";
      label += parseInt($scope.cellModel.links.length + 1).toString();
      var port = {
        id: label,
        group: 'out',
        args: {},
        label: {
            position: {
                name: 'top',
                args: {}
            }
        },
        attrs: { text: { text: label } },
      };
      $scope.cellModel.cell.addPort(port);
      var link = new Link( $scope.cellModel, null, null, null );
      link.ports.push( port );
      $scope.cellModel.links.push( link );
    }
    $scope.createModel = function(cell) {
      console.log("creating model for cell ", cell);
      $scope.models.push( new Model(cell, "Untitled Widget") );
    }
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

    $scope.loadWidget = function(cellView) {
      console.log("loadWidget cellView ", cellView);
      console.log("loadWidget models ", $scope.models);
      $scope.cellView = cellView;
      for (var index in $scope.models) {
        if ($scope.models[ index ].cell.id === cellView.model.id ) {
          $scope.cellModel = $scope.models[ index ];
        }
      }
      console.log("changed cellModel to ", $scope.cellModel);
      $scope.toggleRight();
      $timeout(function() {
        $scope.$apply();
      }, 0);
    }

    $scope.close = function () {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };

    $scope.changePlaybackType = function(value) {
      console.log("changePlaybackType ", value);
      $scope.cellModel.data.playback_type = value;
    }

    $scope.changeFinishRecordType = function(value) {
      console.log("changeFinishRecordType ", value);
      $scope.cellModel.data.finish_record_type = value;
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

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    function buildToggler(navID) {
      return function() {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }
  });