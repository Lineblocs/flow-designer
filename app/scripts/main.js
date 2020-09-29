
function Model(cell, name, links, data) {
  console.log("creating new model ", arguments);
  this.cell = cell;
  this.name = name;
  this.links = links || [];
  this.data = data || {};
  this.tempData = {};
  this.toJSON = function () {
    return {
      id: this.cell.id,
      name: this.name,
      data: this.data
    };
  }
}

function Link(from, to, label, type, condition, value, cell, ports) {
  this.from = from;
  this.to = to;
  this.condition = condition;
  this.type = type;
  this.value = value;
  this.cell = cell;
  this.label = label;
  this.ports = ports || [];
  this.tempData = {};
  this.toJSON = function () {
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
    params['condition'] = this.condition;
    params['cell'] = this.cell;
    return params;
  }
}

function checkExpires(expiresIn) {
  return false;
}

function changeLabel(cell, text, refY) {
  refY = refY || labelRefY;
  cell.attr('.label', {
    text: text,
    fill: '#FFFFFF',
    'font-size': '18',
    'ref-y': refY
  });
}

function changeDescription(cell, text, refY) {
  refY = refY || descriptionRefY;
  refX = .5;
  cell.attr('.description', {
    text: text,
    fill: '#FFFFFF',
    'font-size': '12px',
    'ref-y': refY,
    'ref-x': refX
  });
}

function addCellArgs(model) {
  console.log("addCellArgs ", model);
  if (model.cell.attributes.type === 'devs.SwitchModel') {
    model.tempData.searchText = model.data.test;
    for (var index in model.links) {
      var link = model.links[index];
      link.tempData.searchText = link.cell;
    }
  }
}

var href1 = document.location.href.includes("http://localhost");
var href2 = document.location.href.includes("ngrok.io");
var isLocal = false;
if (href1 || href2) {
  var baseUrl = "https://lineblocs.com/api";
  isLocal = true;
} else {
  var baseUrl = "/api";
}

function createUrl(path) {
  return baseUrl + path;
}

angular
  .module('basicUsageSidenavDemo', ['ngMaterial', 'ngRoute'])
  .service('JWTHttpInterceptor', function () {
    return {
      // optional method
      'request': function (config) {
        try {
          var urlObj = URI(document.location.href);
          var query = urlObj.query(true);


          var token = query.auth;
          var workspaceId = query.workspaceId;
          if (token) {
            config.headers['Authorization'] = "Bearer " + token;
          }
          if (workspaceId) {
            config.headers['X-Workspace-ID'] = workspaceId;
          }
          var admin = query.admin;
          if (admin) {
            config.headers['X-Admin-Token'] = admin;
          }


          console.log("request headers are ", config.headers);
        } catch (e) {}
        console.log("headers are ", config.headers);
        return config;
      }
    };
  })
  .config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when("/create", {
      templateUrl: "templates/create.html",
      controller: "CreateCtrl"
    });
    $routeProvider.when("/adjust", {
      templateUrl: "templates/adjust.html",
      controller: "AdjustCtrl",
      search: {
        flowId: null,
        templateId: null
      }
    });
    $routeProvider.when("/edit", {
      templateUrl: "templates/edit.html",
      controller: "AppCtrl",
      search: {
        flowId: null
      }
    });
    $routeProvider.otherwise("/create");
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('JWTHttpInterceptor');
  })
  .run(function () {
    angular.element(document).ready(function () {
      angular.element(".loading").removeClass("dont-show");
      angular.element(".isnt-loading").removeClass("dont-show");
    });
  })
  .factory("$const", function () {
    var factory = this;
    factory.LINK_CONDITION_MATCHES = "LINK_CONDITION_MATCHES";
    factory.LINK_NO_CONDITION_MATCHES = "LINK_NO_CONDITION_MATCHES";
    factory.SERVER_REMOTE_URL = "http://lineblocs.com";
    factory.FLOW_REMOTE_URL = factory.SERVER_REMOTE_URL + "/api/flow";
    return factory;
  })
  .factory("$shared", function ($mdDialog, $mdSidenav, $log, $const, $http, $timeout, $q, $mdToast) {
    var factory = this;
    factory.models = [];
    factory.trash = [];
    factory.selectorContext = 'AVAILABLE';
    factory.voices = {
      "da-DK": [{
        "lang": "da-DK",
        "name": "da-DK-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "da-DK",
        "name": "da-DK-Wavenet-A",
        "gender": "FEMALE"
      }],
      "nl-NL": [{
        "lang": "nl-NL",
        "name": "nl-NL-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "nl-NL",
        "name": "nl-NL-Wavenet-A",
        "gender": "FEMALE"
      }],
      "en-AU": [{
        "lang": "en-AU",
        "name": "en-AU-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "en-AU",
        "name": "en-AU-Wavenet-D",
        "gender": "MALE"
      }],
      "en-GB": [{
        "lang": "en-GB",
        "name": "en-GB-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "en-GB",
        "name": "en-GB-Wavenet-D",
        "gender": "MALE"
      }],
      "en-US": [{
        "lang": "en-US",
        "name": "en-US-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Standard-E",
        "gender": "FEMALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Wavenet-A",
        "gender": "MALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Wavenet-D",
        "gender": "MALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Wavenet-E",
        "gender": "FEMALE"
      }, {
        "lang": "en-US",
        "name": "en-US-Wavenet-F",
        "gender": "FEMALE"
      }],
      "fr-CA": [{
        "lang": "fr-CA",
        "name": "fr-CA-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "fr-CA",
        "name": "fr-CA-Wavenet-D",
        "gender": "MALE"
      }],
      "fr-FR": [{
        "lang": "fr-FR",
        "name": "fr-FR-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "fr-FR",
        "name": "fr-FR-Wavenet-D",
        "gender": "MALE"
      }],
      "de-DE": [{
        "lang": "de-DE",
        "name": "de-DE-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "de-DE",
        "name": "de-DE-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "de-DE",
        "name": "de-DE-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "de-DE",
        "name": "de-DE-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "de-DE",
        "name": "de-DE-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "de-DE",
        "name": "de-DE-Wavenet-D",
        "gender": "MALE"
      }],
      "it-IT": [{
        "lang": "it-IT",
        "name": "it-IT-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "it-IT",
        "name": "it-IT-Wavenet-A",
        "gender": "FEMALE"
      }],
      "ja-JP": [{
        "lang": "ja-JP",
        "name": "ja-JP-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "ja-JP",
        "name": "ja-JP-Wavenet-A",
        "gender": "FEMALE"
      }],
      "ko-KR": [{
        "lang": "ko-KR",
        "name": "ko-KR-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Standard-B",
        "gender": "FEMALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Standard-C",
        "gender": "MALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Wavenet-B",
        "gender": "FEMALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Wavenet-C",
        "gender": "MALE"
      }, {
        "lang": "ko-KR",
        "name": "ko-KR-Wavenet-D",
        "gender": "MALE"
      }],
      "nb-NO": [{
        "lang": "nb-NO",
        "name": "nb-no-Standard-E",
        "gender": "FEMALE"
      }, {
        "lang": "nb-NO",
        "name": "nb-no-Wavenet-E",
        "gender": "FEMALE"
      }],
      "pl-PL": [{
        "lang": "pl-PL",
        "name": "pl-PL-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Standard-C",
        "gender": "MALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Standard-D",
        "gender": "FEMALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Standard-E",
        "gender": "FEMALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Wavenet-C",
        "gender": "MALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Wavenet-D",
        "gender": "FEMALE"
      }, {
        "lang": "pl-PL",
        "name": "pl-PL-Wavenet-E",
        "gender": "FEMALE"
      }],
      "pt-BR": [{
        "lang": "pt-BR",
        "name": "pt-BR-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "pt-BR",
        "name": "pt-BR-Wavenet-A",
        "gender": "FEMALE"
      }],
      "pt-PT": [{
        "lang": "pt-PT",
        "name": "pt-PT-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Standard-C",
        "gender": "MALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Standard-D",
        "gender": "FEMALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Wavenet-C",
        "gender": "MALE"
      }, {
        "lang": "pt-PT",
        "name": "pt-PT-Wavenet-D",
        "gender": "FEMALE"
      }],
      "ru-RU": [{
        "lang": "ru-RU",
        "name": "ru-RU-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Standard-D",
        "gender": "MALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "ru-RU",
        "name": "ru-RU-Wavenet-D",
        "gender": "MALE"
      }],
      "sk-SK": [{
        "lang": "sk-SK",
        "name": "sk-SK-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "sk-SK",
        "name": "sk-SK-Wavenet-A",
        "gender": "FEMALE"
      }],
      "es-ES": [{
        "lang": "es-ES",
        "name": "es-ES-Standard-A",
        "gender": "FEMALE"
      }],
      "sv-SE": [{
        "lang": "sv-SE",
        "name": "sv-SE-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "sv-SE",
        "name": "sv-SE-Wavenet-A",
        "gender": "FEMALE"
      }],
      "tr-TR": [{
        "lang": "tr-TR",
        "name": "tr-TR-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Standard-B",
        "gender": "MALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Standard-C",
        "gender": "FEMALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Standard-D",
        "gender": "FEMALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Standard-E",
        "gender": "MALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Wavenet-A",
        "gender": "FEMALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Wavenet-B",
        "gender": "MALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Wavenet-C",
        "gender": "FEMALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Wavenet-D",
        "gender": "FEMALE"
      }, {
        "lang": "tr-TR",
        "name": "tr-TR-Wavenet-E",
        "gender": "MALE"
      }],
      "uk-UA": [{
        "lang": "uk-UA",
        "name": "uk-UA-Standard-A",
        "gender": "FEMALE"
      }, {
        "lang": "uk-UA",
        "name": "uk-UA-Wavenet-A",
        "gender": "FEMALE"
      }]
    }
    factory.isLoading = false;
    factory.isCreateLoading = false;
    factory.voiceGenders = ['MALE', 'FEMALE'];
    factory.voiceLangs = Object.keys(factory.voices);
    factory.searchText = "";

    function doReload() {
      var scope = getAngularScope();
      $timeout(function () {
        scope.$apply();
      }, 0)
    }
    factory.loadExtensions = function () {
      var url = createUrl("/extension/listExtensions");
      return $q(function (resolve, reject) {
        $http.get(url).then(function (res) {
          console.log("extensions are ", res.data);
          var extensions = res.data.data.map(function (extension) {
            return extension.username;
          });
          resolve(extensions);
        }, reject);
      });
    }
    factory.loadFunctions = function () {
      var url = createUrl("/function/listFunctions");
      return $q(function (resolve, reject) {
        $http.get(url).then(function (res) {
          console.log("functions are ", res.data);
          var functions = res.data.data.map(function (obj) {
            return obj.title;
          });
          factory.functionsFull = res.data.data;
          resolve(functions);
        }, reject);
      });
    }
    factory.loadWidgetTemplates = function () {
      var url = createUrl("/widgetTemplate/listWidgets");
      return $q(function (resolve, reject) {
        $http.get(url).then(function (res) {
          console.log("widgets are ", res.data);
          factory.widgetTemplates = res.data.data.map(function(template) {
            var obj = Object.assign({}, template);
            obj['data'] = JSON.parse( obj['data'] );
            return obj;
          });
          resolve(factory.widgetTemplates);
        }, reject);
      });
    }

    factory.addFunction = function () {
      console.log("addFunction called..");
      $mdDialog.show({
          controller: DialogController,
          templateUrl: '/dialogs/editor.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true
        })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    }
    function confirmDelete() {
        var models = [];
        for (var index in factory.models) {
          var model = factory.models[index];
          if (model.cell.id === factory.cellModel.cell.id) {
            factory.trash.push(model);
            continue;
          }
          models.push(model);
        }
        console.log("models are now ", models);
        factory.cellModel.cell.remove();
        factory.models = models;
        factory.cellModel = null;
        factory.cellView = null;
        doReload();
      }
    factory.deleteWidget1 = function (ev) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure you want to remove this widget ?')
        .content('removing this widget will permantely remove its data and all its links')
        .ariaLabel('Remove Widget')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('No');
      $mdDialog.show(confirm).then(function () {
        confirmDelete();
      }, function () {});
    }
    factory.deleteWidget = function(ev) {
        function DialogController($scope, $mdDialog, onConfirm, onCancel) {
          $scope.cancel = function() {
            $mdDialog.cancel();
            onCancel();
          };

          $scope.confirm = function(answer) {
            $mdDialog.hide(answer);
            onConfirm();
          };
  }
        $mdDialog.show({
          controller: DialogController,
          templateUrl: '/dialogs/confirm-delete.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          locals: {
            onConfirm: function() {
              confirmDelete();
            },
            onCancel: function() {

            }
          },
          fullscreen: false // Only for -xs, -sm breakpoints.
        })
    }
    function DialogWidgetSaveController($scope, $shared, $timeout, $q, $http, model, onSave, onCancel) {
      $scope.params = {
        "id": null,
        "title": "",
        "code": "",
        "tags": []
      };
      $scope.save = function() {
        var data = angular.copy($scope.params);
        var url = createUrl("/widgetTemplate/saveWidget");
        var modelJSON = model.toJSON();
        modelJSON.links = model.links.map(function (link) {
          return link.toJSON();
        });
        data['data'] = {};
        //data['data']['json'] = modelJSON;
        data['data']['attributes']= model.cell.attributes;
        data['data']['saved']= model.data;
        data['data']['name']= model.name;
        $http.post(url, data).then(function (res) {
          $mdDialog.hide();
          $shared.loadWidgetTemplates().then(function() {
            onSave();
          });
        });
      }
      $scope.cancel = function() {
        $mdDialog.hide();
        onCancel();
      }

    }
    factory.saveWidgetAsTemplate = function (ev, widget) {
      console.log("saveWidgetAsTemplate called in $scope..");

      $mdDialog.show({
          controller: DialogWidgetSaveController,
          templateUrl: '/dialogs/widget-save.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          locals: {
            model: widget,
            onSave: function (value) {
            },
            onCancel: function (value) {
            },
          }
        })
    }


    function doDuplicate(view, model) {
      var graph = diagram['graph'];
      var newCell = view.model.clone();
      var newModel = Object.assign({}, view.model);
      graph.addCell(newCell);
      var oldPos = view.model.position();
      var size = view.model.size();
      var padding = 30;
      var newX = (oldPos.x + size.width + padding);
      console.log("adding new cell ", newCell);
      newCell.position(newX, oldPos.y);
      var scope = getAngularScope();
      var name = model.name + " (duplicate)";
      scope.createModel(newCell, name);
    }

    factory.changeCell = function(item) {
      var graph = diagram['graph'];
      var cells = graph.getCells();
      angular.forEach(cells, function (cell) {
        console.log("changeCell changing ", arguments);
        if (cell.id === item.cell.id) {
          item.cell = cell;
        }
      });
    }
    factory.syncTrash = function() {
      var newTrash = [];
      angular.forEach(factory.trash, function (item) {
        var id = item.cell.id;
        if ($("g[model-id='" + id + "']").is(":visible")) {
          factory.changeCell(item);
          factory.models.push(item);
        } else {
          newTrash.push(item);
        }
      });
      angular.forEach(factory.models, function (item) {
        var id = item.cell.id;
        if (!$("g[model-id='" + id + "']").is(":visible")) {
          newTrash.push(item);
        }
      });
      factory.trash = newTrash;

    }
    factory.undo = function() {
      var commandManager = diagram['commandManager'];
      commandManager.undo();
      factory.syncTrash();
    }
    factory.redo = function () {
      var commandManager = diagram['commandManager'];
      commandManager.redo();
      factory.syncTrash();
    }

    factory.duplicateWidget = function (ev) {
      console.log("duplicating widget ", factory.cellView);
      var graph = diagram['graph'];
      doDuplicate(factory.cellView, factory.cellModel);
    }
    factory.duplicateWidgetAlt = function (model, view) {
      doDuplicate(view, model);
    }
    factory.canDelete = function () {
      console.log("canDelete called ", arguments, factory.cellModel);
      if (factory.cellModel && factory.cellModel.cell && factory.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    factory.canSave = function () {
      console.log("canSave called ", arguments, factory.cellModel);
      if (factory.cellModel && factory.cellModel.cell && factory.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    factory.canDuplicate = function () {
      if (factory.cellModel && factory.cellModel.cell && factory.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    factory.hasCellModel = function () {
      console.log("hasCellModel ", factory.cellModel);
      if (factory.cellModel && factory.cellModel.cell) {
        return true;
      }
      return false;
    }

    function createOption(model, label) {
      var tag = model.name + "." + label;
      return {
        value: tag,
        display: tag
      };
    }
    // get widget auto complete options
    factory.loadACOptions = function () {
      var options = [];
      console.log("loadACOptions called. models are ", factory.models);
      for (var index in factory.models) {
        var model = factory.models[index];
        if (model.cell.attributes.type === 'devs.LaunchModel') {
          options.push(createOption(model, 'call.from'));
          options.push(createOption(model, 'call.to'));
        } else if (model.cell.attributes.type === 'devs.DialModel') {
          options.push(createOption(model, 'from'));
          options.push(createOption(model, 'to'));
          options.push(createOption(model, 'call_id'));
          options.push(createOption(model, 'dial_status'));
        } else if (model.cell.attributes.type === 'devs.BridgeModel') {
          options.push(createOption(model, 'from'));
          options.push(createOption(model, 'to'));
          options.push(createOption(model, 'call_id'));
          options.push(createOption(model, 'dial_status'));
        } else if (model.cell.attributes.type === 'devs.ProcessInputModel') {
          options.push(createOption(model, 'from'));
          options.push(createOption(model, 'to'));
          options.push(createOption(model, 'digits'));
          options.push(createOption(model, 'call_id'));
          options.push(createOption(model, 'speech'));
        } else if (model.cell.attributes.type === 'devs.RecordVoicemailModel') {
          options.push(createOption(model, 'from'));
          options.push(createOption(model, 'to'));
          options.push(createOption(model, 'call_id'));
          options.push(createOption(model, 'recording_id'));
          options.push(createOption(model, 'recording_uri'));
        }

      }
      console.log("loadACOptions created ", options);
      return options;
    }

    factory.loadLinkACOptions = function () {
      var options = [];
      for (var index in factory.models) {
        var model = factory.models[index];
        options.push({
          "display": model.name,
          "value": model.name
        });
      }
      return options;
    }
    factory.querySearch = querySearch;
    factory.queryExtensionsSearch = queryExtensionsSearch;
    factory.selectedItemChange = selectedItemChange;
    factory.searchTextChange = searchTextChange;

    factory.queryLinkSearch = queryLinkSearch;
    factory.selectedLinkItemChange = selectedLinkItemChange;
    factory.searchLinkTextChange = searchLinkTextChange;

    factory.newState = newState;
    factory.transformChip = transformChip;

    function newState(state) {
      alert("Sorry! You'll need to create a Constitution for " + state + " first!");
    }

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch(query) {
      console.log("querySearch was called..");
      var data = factory.loadACOptions();
      var results = query ? data.filter(createFilterFor(query)) : data,
        deferred;
      if (factory.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () {
          deferred.resolve(results);
        }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        console.log("results are ", results);
        return results;
      }
    }

    function queryExtensionsSearch(query) {
      console.log("querySearch was called..");
      console.log("extensions are ", factory.extensions);
      return $q.resolve(factory.extensions.map(function (extension) {
        return {
          value: extension,
          display: extension
        };
      }));
      /*
      return factory.extensions.map(function(extension) {
        return extension.username;
      });
      */
    }
    /**
     * Return the proper object when the append is called.
     */
    function transformChip(chip) {
      // If it is an object, it's already a known chip
      if (angular.isObject(chip)) {
        return chip;
      }

      // Otherwise, create a new one
      return {
        name: chip,
        type: 'new'
      };
    }

    function queryLinkSearch(query) {
      console.log("queryLinkSearch was called..");
      var data = factory.loadLinkACOptions();
      var results = query ? data.filter(createFilterFor(query)) : data,
        deferred;
      if (factory.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () {
          deferred.resolve(results);
        }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        console.log("results are ", results);
        return results;
      }
    }

    function searchTextChange(model, key) {
      console.log("searchTextChange called ", model);
      if (model && model.data) {
        model.data[key] = model.tempData.searchText;
      }
    }

    function searchLinkTextChange(link) {
      console.log("searchLinkTextChange called ", link);
      link.cell = link.tempData.searchText;
    }

    function selectedItemChange(model, key, item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      factory.cellModel.tempData.ACItem = item;
      model.data[key] = item.value;
      console.log('model data is now ', model.data);
    }

    function selectedLinkItemChange(link, item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      link.tempData.ACItem = item;
      link.cell = item.value;
      var linkLabel = link.label;
      console.log('link data is now ', link);
      var srcModel = factory.cellModel.cell,
        dstModel;
      var graph = diagram['graph'];
      for (var index in factory.models) {
        var model = factory.models[index];
        if (link.cell === model.name) {
          dstModel = model.cell;
        }
      }

      var link = new joint.shapes.devs.FlowLink({
        source: {
          id: srcModel.id,
          port: linkLabel
        },
        target: {
          id: dstModel.id,
          port: 'In'
        },
        attrs: {
          ".connection": {
            "stroke-width": 1
          }
        },
        connector: GRAPH_CONNECTOR,
        router: GRAPH_ROUTER,
      });

      // check for any current one
      var cells = graph.getCells();
      cells.forEach(function (cell) {
        var attrs = cell.attributes;
        if (attrs.type === 'devs.FlowLink') {
          console.log("compare srcModel.id", srcModel.id);
          console.log("compare attrs.source.id", attrs.source.id);
          console.log("compare linkLabel", linkLabel);
          console.log("compare attrs.soure.port", attrs.source.port);

          if (attrs.source.id === srcModel.id && attrs.source.port === linkLabel) {
            cell.remove();
          }
        }
      });

      // Assume graph has the srcModel and dstModel with in and out ports.
      console.log("adding link ", link);
      graph.addCell(link)
    }


    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';

      return allStates.split(/, +/g).map(function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = query.toLowerCase();

      return function filterFn(option) {
        var subject = option.value.toLowerCase();
        return (subject.indexOf(lowercaseQuery) === 0);
      };

    }
    factory.addMacroParam = function () {
      var current = factory.cellModel.data.params;
      if ( typeof current === 'undefined' ) {
        factory.cellModel.data.params = [];
      } 
      factory.cellModel.data.params.push( {
        name: "",
        value: ""
      });
    }
    factory.removeMacroParam = function ($index, param) {
      factory.cellModel.data.params.splice($index, 1);
      console.log("params are now ", factory.cellModel.data.params);
    }
    factory.addVariable = function () {
      var current = factory.cellModel.data.variables
      if ( typeof current === 'undefined' ) {
        factory.cellModel.data.variables = [];
      } 
      factory.cellModel.data.variables.push( {
        name: "",
        value: ""
      });
    }
    factory.removeVariable = function ($index, param) {
      factory.cellModel.data.variables.splice($index, 1);
      console.log("variables are now ", factory.cellModel.data.variables);
    }
    factory.openLibrary = function () {
      console.log("openLibrary");
      var created = [];
      for ( var index in factory.widgetTemplates ) {
        var template = factory.widgetTemplates[ index ];
        console.log("creating widget ", template);
        var obj = createModelFromTemplate( template );
        created.push( obj );
      }
      angular.element("#stencil").hide();
      angular.element("#stencilLibrary").show();
      factory.selectorContext = 'LIBRARY';
      $timeout(function() {
        appendStencilLibraryModels( diagram['stencilLibraryGraph'], created );
      }, 0);
    }
    factory.openAvailable = function () {
      console.log("openAvailable");
      angular.element("#stencilLibrary").hide();
      angular.element("#stencil").show();
      factory.selectorContext = 'AVAILABLE';
    }
    factory.saveWidget = function () {
      var model = factory.cellModel;
      //model.cell.attr({ text: { text:  model.name } });
      changeLabel(model.cell, model.name);
      console.log("saveWidget model", model);
      var data = model.data;
      if (model.cell.attributes.type === 'devs.DialModel') {
        if (data.call_type === 'Phone Number') {
          changeDescription(model.cell, "Call " + data.number_to_call + " on new line");
        } else if (data.call_type === "Extension") {
          changeDescription(model.cell, "Call ext " + data.extension + " on new line");
        }
      } else if (model.cell.attributes.type === 'devs.BridgeModel') {
        if (data.call_type === 'Phone Number') {
          changeDescription(model.cell, "Connect to " + data.number_to_call);
        } else if (data.call_type === "Extension") {
          changeDescription(model.cell, "Connect to ext " + data.extension);
        }
      } else if (model.cell.attributes.type === 'devs.ProcessInputModel') {
        if (data.playback_type === 'Say') {
          changeDescription(model.cell, "Use text to speech to process input");
        } else {
          changeDescription(model.cell, "Use media file to process input");
        }
      } else if (model.cell.attributes.type === 'devs.RecordVoicemailModel') {
        var length = data.max_recording_length;
        changeDescription(model.cell, "Record voicemail for " + length + " seconds");
      } else if (model.cell.attributes.type === 'devs.PlaybackModel') {
        if (data.playback_type === 'Say') {
          changeDescription(model.cell, "Use text to speech to create playback");
        } else {
          changeDescription(model.cell, "Use media file as playback");
        }
      } else if (model.cell.attributes.type === 'devs.SwitchModel') {}
      factory.unsetCellModel();
      factory.showToast("Widget changes saved")
    }
    factory.showToast = function(message) {
          $mdToast.show(
      $mdToast.simple()
        .content(message)
        .position('top right')
        .hideDelay(3000)
    );
    }
    factory.unsetCellModel = function () {
      factory.cellModel = null;
      $timeout(function () {
        console.log("cellModel is now ", factory.cellModel);
        //$scope.$apply();
        if (factory.selectorContext === 'LIBRARY') {
          factory.openLibrary();
        } else if (factory.selectorContext === 'AVAILABLE') {
          factory.openAvailable();
        }

      }, 0);
    }


    factory.getCellById = function (id) {
      var found = null;
      var graph = diagram['graph'];
      graph.getCells().forEach(function (cell) {
        if (cell.id === id) {
          factory.models.forEach(function (model) {
            if (model.cell.id === id) {
              found = {
                "cell": cell,
                "model": model
              };
            }

          })
        }
      });
      console.log("getCellById result ", found);
      return found;
    }
    factory.getVoiceLangs = function () {
      var langs = Object.keys(factory.voices);
      console.log("voice languages are ", langs);
      return langs;
    }
    factory.getVoices = function () {
      console.log("getVoices ", factory.cellModel);
      var cellModel = factory.cellModel;
      if (!cellModel || !cellModel.data || !cellModel.data.text_language) {
        return [];
      }
      var options = factory.voices[cellModel.data.text_language];
      if (cellModel.data.text_gender) {
        options = options.filter(function (option) {
          if (option.gender === cellModel.data.text_gender) {
            return true;
          }
          return false;
        })
      }
      options = options.map(function (option) {
        return option.name;
      });
      return options;
    }

    return factory;
  })
  .controller('RootCtrl', function ($scope, $timeout, $mdSidenav, $log, $mdDialog, $shared, $http, $location, $const, $mdSidenav) {
    $scope.$shared = $shared;
  })
  .controller('ControlsCtrl', function ($scope, $timeout, $mdSidenav, $log, $mdDialog, $shared, $http, $location, $const, $mdSidenav) {
    $scope.$shared = $shared;

    function showSaved(ev) {

      $mdDialog.show(
        $mdDialog.alert()
        .parent(angular.element(document.querySelector('body')))
        .clickOutsideToClose(true)
        .title('Changes Saved')
        .content('Your flow has been saved and published.')
        .ariaLabel('Saved Changes')
        .ok('ok')
        .targetEvent(ev)
      );

    }

    $scope.canDelete = function () {
      console.log("canDelete called ", arguments, $scope.cellModel);
      if ($shared.cellModel && $shared.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    $scope.canDuplicate = function () {
      if ($shared.cellModel && $shared.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }



    $scope.centerFocus = function () {
      copyPosition = null;
      var paper = diagram['paper'];
      //paper.translate(0, 0);
      panAndZoom.resetPan();
    }

    function changeCell(item) {
      var graph = diagram['graph'];
      var cells = graph.getCells();
      angular.forEach(cells, function (cell) {
        console.log("changeCell changing ", arguments);
        if (cell.id === item.cell.id) {
          item.cell = cell;
        }
      });
    }
    $scope.undo = function () {
      $shared.undo();
    }
    $scope.redo = function () {
      $shared.redo();
    }
    $scope.zoomOut = function () {
      zoomOut();
    }


    $scope.zoomIn = function () {
      zoomIn();
    }

    $scope.zoomOut = function () {
      zoomOut();
    }

    $scope.saveChanges = function (ev) {
      // Appending dialog to document.body to cover sidenav in docs app
      // Modal dialogs should fully cover application
      // to prevent interaction outside of dialog
      var graph = diagram['graph'];
      var json = graph.toJSON();
      var params = {};
      params['graph'] = json;
      var models = [];
      for (var index in $shared.models) {
        var model = $shared.models[index];
        var data = model.toJSON();
        data.links = model.links.map(function (link) {
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
        serverData['name'] = $shared.flow.name;
        serverData['flow_json'] = JSON.stringify(params);
        $shared.isCreateLoading = true;
        $http.post(createUrl("/flow/updateFlow/" + flowId), serverData).then(function () {
          $shared.isCreateLoading = false;
          showSaved(ev);
          stateActions.lastSave = Date.now();
        }, function (err) {
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
  .controller('CreateCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http) {
    $scope.values = {
      name: ""
    };
    $scope.blankTemplate = {
      "title": "Blank Template",
      "id": null
    };
    $scope.templates = [];
    $scope.$shared = $shared;
    $scope.submit = function () {
      var data = angular.copy($scope.values);
      data['flow_json'] = null;
      data['template_id'] = null;
      data['started'] = true;
      if ($scope.selectedTemplate.name !== 'Blank') {
        data['template_id'] = $scope.selectedTemplate.id;
      }
      $shared.isCreateLoading = true;
      $http.post(createUrl("/flow/saveFlow"), data).then(function (res) {
        $shared.isCreateLoading = false;
        console.log("response arguments ", arguments);
        console.log("response headers ", res.headers('X-Flow-ID'));
        console.log("response body ", res.body);
        var id = res.headers('X-Flow-ID');
        var urlObj = URI(document.location.href);
        var query = urlObj.query(true);
        var token = query.auth;

        $http.get(createUrl("/getFlowPresets?templateId=" + data['template_id'])).then(function (res) {
          if ( !res.data.has_presets ) {
            var url = "/edit?flowId=" + id + "&auth=" + token + "&workspaceId=" + query.workspaceId;
            if ( query.admin ) {
              url += "&admin=" + query.admin;
            }
            $location.url(url);
            if (!islocal) {
              //top.window.location.href = "https://app.lineblocs.com/#/dashboard/flows/" + id;
            }
            return;
          } 
           var url = "/adjust?flowId=" + id + "&templateId=" + data['template_id'] + "&auth=" + token + "&workspaceId=" + query.workspaceId;
            if ( query.admin ) {
              url += "&admin=" + query.admin;
            }
            $location.url(url);
            if (!isLocal) {
              //top.window.location.href = "https://app.lineblocs.com/#/dashboard/flows/" + id;
            }
            return;
          });

      });
    }
    $scope.useTemplate = function (template) {
      $scope.selectedTemplate = template;
    };
    $scope.isSelected = function (template) {
      if ($scope.selectedTemplate && template.id === $scope.selectedTemplate.id) {
        return true;
      }
      return false;
    }

    function init() {
      $shared.isLoading = true;
      $http.get(createUrl("/flow/listTemplates")).then(function (res) {
        $shared.isLoading = false;
        console.log("flow templates are ", res.data);
        var templates = res.data.data;
        $scope.templates = templates;
        var templatesByCategory = [];
        for ( var index in templates ) {
          var template = templates[ index ];
          var category = templatesByCategory[ template.category ];
          var found = false;
          for (var index1 in templatesByCategory ) {
              if (templatesByCategory[index1].name === template.category) {
                found = true;
                templateByCategory = templatesByCategory[index1];
              }
          }
          if ( !found ) {
            templatesByCategory.push({
              "name": template.category,
              "templates": [template]
            });
            continue;
          }
          templateByCategory['templates'].push( template );
        }
        $scope.templatesByCategory = templatesByCategory;
        console.log("template ", templatesByCategory);
      });
    }
    init();
  }).controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, $timeout, $q) {
    $scope.$shared = $shared;
    $scope.$const = $const;
    $scope.extensions = [];

    $scope.conditions = [
      'Equals',
      'Starts With',
      'Ends With',
      'Matches Any'
    ];
    $scope.callTypes = [
      'Extension',
      'ExtensionFlow',
      'Phone Number',
      'Queue',
      'Follow Me'
    ];
    $scope.dialCallTypes = [
      'Extension',
      'ExtensionFlow',
      'Phone Number'
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
    $scope.languages = [
      'en-US',
      'fr-FR'
    ];
    $scope.cellView = null;
    $scope.addLink = function (label, type, cellModel) {
      cellModel = cellModel || $shared.cellModel;
      type = type || $const.LINK_CONDITION_MATCHES;
      if (typeof label === 'undefined') {
        var label = "Condition Matches";
        label += " " + parseInt($shared.cellModel.links.length + 1).toString();
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
        attrs: {
          text: {
            text: label
          }
        },
      };
      console.log("adding port ", port);
      cellModel.cell.addPort(port);
      var link = new Link(cellModel, null, label, type, null, null, null);
      link.ports.push(port);
      cellModel.links.push(link);
    }

    $scope.createModel = function (cell, name) {
      console.log("creating model for cell ", cell);
      /*
      if (cell.attributes.type === 'devs.SwitchModel') {
        $scope.addLink("No Condition Matches", $const.LINK_NO_CONDITION_MATCHES, model);
      }
      */

      if (typeof name === 'undefined') {
        var name = cell.attributes.name;
        var graph = diagram['graph'];
        var cells = graph.getCells();
        var count = 0;
        for (var index in cells) {
          var target = cells[index];
          if (target.attributes.type === cell.attributes.type && target !== cell) {
            count += 1;
          }
        }
        if (count > 0) {
          name += " (" + count + ")";
        }
      }
      var model = new Model(cell, name);
      changeLabel(cell, name);
      $shared.models.push(model);
      return model;
    }
    $scope.isOpenRight = function () {
      return $mdSidenav('right').isOpen();
    };
    $scope.createLibraryModel = function (cell) {
      console.log("createLibraryModel ", arguments);
      console.log("createLibraryModel ", $shared.widgetTemplates);
      var find = cell.attributes.name;
      var model = $scope.createModel(cell);
      for (var index in $shared.widgetTemplates) {
        var item = $shared.widgetTemplates[ index ];
        if ( item.title === find ) {
          model.data = item.data.saved;
        }
      }
      //$shared.widgetTemplates
      return model;
    }

    $scope.loadWidget = function (cellView, openSidebar) {
      console.log("loadWidget cellView ", cellView);
      console.log("loadWidget models ", $shared.models);
      //openSidebar = openSidebar || false;
      $shared.cellView = cellView;
      $scope.cellView = cellView;
      for (var index in $shared.models) {
        if ($shared.models[index].cell.id === cellView.model.id) {
          $shared.cellModel = $shared.models[index];
          $scope.cellModel = $shared.cellModel;
        }
      }
      console.log("changed cellModel to ", $shared.cellModel);
      if (openSidebar) {
        //$scope.toggleRight();
      }
      $timeout(function () {
        $scope.$apply();
      }, 0);
    }
    $scope.changeTextLanguage = function (value) {
      console.log("changeTextLanguage ", value);
      $shared.cellModel.data.text_language = value;
    }
    $scope.changeTextGender = function (value) {
      console.log("changeTextGender ", value);
      $shared.cellModel.data.text_gender = value;
    }
    $scope.changeVoice = function (value) {
      console.log("changeVoice ", value);
      $shared.cellModel.data.voice = value;
    }
    $scope.changeConditionType = function (link, value) {
      console.log("changeConditionType ", value);
      link.condition = value;
    }
    $scope.changePlaybackType = function (value) {
      console.log("changePlaybackType ", value);
      $shared.cellModel.data.playback_type = value;
    }
    $scope.changeCallType = function (value) {
      console.log("changeCallType ", value);
      $shared.cellModel.data.call_type = value;
    }
    $scope.changeExtension = function (value) {
      console.log("changeExtension ", value);
      $shared.cellModel.data.extension = value;
    }
    $scope.updateExtensions = function () {
      console.log("updateExtensions ");
      $shared.loadExtensions().then(function (extensions) {
        $shared.extensions = extensions;
      });
    }

    $scope.updateFunctions = function () {
      console.log("updateFunctions ");
      $shared.loadFunctions().then(function (functions) {
        $shared.functions = functions;
              console.log("$shared.functions are ", $shared.functions);
      });
    }

    $scope.updateWidgetTemplates = function () {
      console.log("updateWidgetTemplatess ");
      $shared.loadWidgetTemplates().then(function (templates) {
        $shared.widgetTemplates = templates;
      });
    }


    $scope.changeFinishRecordType = function (value) {
      console.log("changeFinishRecordType ", value);
      $shared.cellModel.data.finish_record_type = value;
    }

    $scope.unsetCellModel = function () {
      $shared.unsetCellModel();
    }

    $scope.flowWasStarted = function () {
      console.log("flowWasStarted ", $shared.flow);
      if ($shared.flow && $shared.flow.started) {
        return true;
      }

      return false;
    }
    $scope.useTemplate = function (template) {
      $scope.selectedTemplate = template;
    };
    $scope.isSelected = function (template) {
      if ($scope.selectedTemplate && template.id === $scope.selectedTemplate.id) {
        return true;
      }
      return false;
    }
    $scope.addTemplate = function () {
      var data = {};
      data['flow_json'] = null;
      data['template_id'] = null;
      data['started'] = true;
      if ($scope.selectedTemplate) {
        data['template_id'] = $scope.selectedTemplate.id;
      }
      $http.post(createUrl("/flow/updateFlow/" + $shared.flow.public_id), data).then(function (res) {
        $shared.flow.started = true;
        load();
      });
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
        timer = $timeout(function () {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    function createDynamicPort(cell, link) {
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
        attrs: {
          text: {
            text: link.label
          }
        },
      };
      cell.addPort(port);
    }

    function load() {

      var search = $location.search();
      console.log("load search is ", search);
      $shared.flow = {
        "started": true
      };
      $shared.isLoading = true;
      var url = createUrl("/extension/listExtensions");
      $q.all([
        $scope.updateFunctions(),
        $shared.loadExtensions(),
        $shared.loadWidgetTemplates(),
      ]).then(function (responses) {
        var extensions = responses[1];
        console.log("extensions are ", extensions);
        $shared.extensions = extensions;
        $timeout(function () {
          window['angularScope'] = angular.element(document.getElementById('scopeCtrl')).scope();
          var graph;
          if (search.flowId) {
            $q.all([
              $http.get(createUrl("/flow/flowData/" + search.flowId)),
              $http.get(createUrl("/flow/listTemplates"))
            ]).then(function (res) {
              console.log("flow templates are ", res[1].data);
              $scope.templates = res[1].data.data;
              $shared.flow = {
                "started": true
              };
              $shared.isLoading = false;
              console.log("fetch JSON is ", res[0]);
              $timeout(function () {
                $shared.flow = res[0].data;
                if (!$shared.flow.started) {
                  return;
                }
                initializeDiagram();
                graph = diagram['graph'];

                if (res[0].data.flow_json) {

                  var data = JSON.parse(res[0].data.flow_json);
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
                    var model = data.models[index];
                    for (var index1 in cells) {
                      var cell = cells[index1];
                      if (model.id === cell.id) {
                        var links = [];
                        for (var index2 in model.links) {
                          var link = model.links[index2];
                          var obj1 = new Link(null, null, link.label, link.type, link.condition, link.value, link.cell, []);
                          links.push(obj1);
                        }
                        var obj2 = new Model(cell, model.name, links, model.data);
                        addCellArgs(obj2);
                        console.log("pushing model ", obj2);
                        $shared.models.push(obj2);
                      }
                    }
                  }
                  $shared.cellModel = null;
                } else {
                  var launch = new joint.shapes.devs.LaunchModel({
                    position: {
                      x: 0,
                      y: 0
                    }
                  });
                  var subtractPaddingTop = 240;
                  var size = launch.size();
                  console.log("launch size is ", size);
                  launch.position(
                    $("#canvas").width() / 2 - (size.width / 2),
                    ($("#canvas").height()/2 - (size.height / 2)) - subtractPaddingTop
                  );

                  graph.addCell(launch);
                  $scope.createModel(launch, "Launch");
                  $shared.isLoading = false;
                }
              }, 0);
            });
          }
        }, 0);
      });
    }
    $scope.load = load;
    load();
    //$mdSidenav('rightWidgets').open();
  }).controller('AdjustCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, $timeout, $q, $mdDialog) {
    $scope.$shared = $shared;
    $scope.$const = $const;
    var search = $location.search();
    var url = createUrl("/getFlowPresets?templateId=" + search.templateId);
    $scope.inputs = {};

    $scope.changeValues = function(inputs, presets, preset) {
      console.log("values change ", arguments);
    }
    $http.get(url).then(function (res) {
      console.log("presets are ", res.data);
      $scope.presets = res.data.presets;
      angular.forEach($scope.presets, function(preset) {
        preset.value = preset.default;
      });
    });

    $scope.canShowPreset = function(preset) {
      var show = false;
      var presets = $scope.presets;
      if (preset.depends_on_field !== '') {
        for ( var index in presets ) {
          var obj = presets[ index ];
          if ( preset.depends_on_field === obj.var_name ) {
            if (obj.value === preset.depends_on_value ) {
              show = true;
            }
          }
        }
      } else {
        show = true;
      }
      return show;
    }
    function save() {
      return $q(function( resolve, reject ) {
        var url = createUrl("/saveUpdatedPresets?templateId=" + search.templateId + "&flowId=" + search.flowId);
        var presets = angular.copy( $scope.presets );

        var data = presets.map(function(preset) {
          return {
            widget: preset.widget,
            widget_key: preset.widget_key,
            value: preset.value
          };
        });
        $shared.isLoading = true;
        $http.post(url, data).then(function (res) {
          console.log("updated presets..");
            var urlObj = URI(document.location.href);
            var query = urlObj.query(true);
            var token = query.auth;
        $shared.isLoading = false;
            resolve();
        }, reject);
      });
    }

    $scope.saveContinue = function() {
      save().then(function() {
              console.log("updated presets..");
          var urlObj = URI(document.location.href);
          var query = urlObj.query(true);
          var token = query.auth;
      $shared.isLoading = false;
            var url = "/edit?flowId=" + search.flowId + "&auth=" + token + "&workspaceId=" + query.workspaceId;
            if ( query.admin ) {
              url += "&admin=" + query.admin;
            }
            $location.url(url);
            if (!islocal) {
              //top.window.location.href = "https://app.lineblocs.com/#/dashboard/flows/" + id;
            }
            return;
          });
    }
    $scope.saveExit = function($event) {
      save().then(function() {
              console.log("updated presets..");
      $mdDialog.show(
        $mdDialog.alert()
        .parent(angular.element(document.querySelector('body')))
        .clickOutsideToClose(true)
        .title('Changes Saved')
        .content('Your flow has been saved and published.')
        .ariaLabel('Saved Changes')
        .ok('ok')
        .targetEvent($event)
      );
      });
    }

  }).controller('PaperCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, $mdDialog) {
    $scope.$shared = $shared;

    function DialogController($scope, $timeout, $q, $http, macroFunction, onSave, onCancel) {
      console.log("creating editor with macroFunction ", macroFunction);
      $scope.params = {
        "id": null,
        "title": "",
        "code": ""
      };
      //$scope.errors = false;
      $scope.errors = false;
      editor = null;


      if (macroFunction['code'] && !macroFunction['id']) {
        $scope.params['code'] = macroFunction['code'];
      }
      if (macroFunction['id']) {
        $scope.params['id'] = macroFunction['id'];
        $scope.params['public_id'] = macroFunction['public_id'];
        $scope.params['title'] = macroFunction['title'];
        $scope.params['code'] = macroFunction['code'];
      }

      function saveNewFunction($event) {
        var url = createUrl("/function/saveFunction");
        return $q(function (resolve, reject) {
          if ($scope.params['title']) {
            resolve();
            return;
          }
          var title = window.prompt('Please enter a title for this macro');
          $scope.params['title'] = title;
          var data = angular.copy($scope.params);
          data['code'] = editor.getValue();
          console.log("create function data ", data);
          $http.post(url, data).then(function (res) {
            $mdDialog.hide();
            resolve();
          }, function (err) {
            console.error(err);
            reject();
          });
        });
      }
      $scope.save = function ($event) {
        console.log("save called..");
        var url = createUrl("/function/saveFunction");
        return $q(function (resolve, reject) {
          if (!$scope.params['title']) {
            saveNewFunction().then(function () {
              onSave($scope.params);
            });
            return;
          }
          var data = angular.copy($scope.params);
          data['code'] = editor.getValue();
          var url = createUrl("/function/updateFunction/" + $scope.params['public_id']);
          console.log("update function data ", data);
          $http.post(url, data).then(function (res) {
            var reply = res.data;
            if ( !reply.success ) {
                $scope.errors = {
                  "logs": reply.info.logs
                };
            }
            var previous = angular.copy($shared.cellModel);
            console.log("previous cellModel is ", previous);
            $shared.loadFunctions().then(function(functions) {
              $shared.functions = functions;
              console.log("$shared.functions are ", $shared.functions);
              angular.forEach(functions, function(obj) {
                 if ( obj.id === previous.data.function.id ) {
                   $scope.cellModel= previous;
                   $scope.cellModel.data.function = obj;
                 }
                });
              $mdDialog.hide();
              onSave($scope.params);
            });
          }, function (err) {
            console.error(err);
            alert("Internal Error occured..");
          });
        });
      }
      $scope.cancel = function () {
        $mdDialog.hide();
      }

      function loadMonaco() {
        editor = monaco.editor.create(document.getElementById("editor"), {
          value: "module.exports = function(event: LineEvent, context: LineContext) {\n\treturn new Promise(async function(resolve, reject) {\n\t});\n}",
          language: "typescript"
        });

        $http({
          url: "https://tsc.lineblocs.com/defs.ts",
          method: 'GET',
          responseType: 'text'
        }).then(function(response) {
          var fact1 = response.data;
          console.log("typescript defs are ", fact1);
          var factFilename1 = 'myCustomNamespace2';
          this.monaco.languages.typescript.typescriptDefaults.addExtraLib(fact1, factFilename1);
          if ($scope.params['code'] !== '') {
            editor.setValue($scope.params['code']);
          }
        });
      }
      $timeout(function () {
        loadMonaco();
      }, 0);
    }

    function DialogSelectController($scope, $timeout, $q, $http, onSelected, onCancel) {
      $scope.selection=null;
      $scope.templates = [];
      $scope.changeableParams = [];
      $scope.step = 1;
      $scope.paramsToAdd = [];
      $scope.useTemplate = function (template) {
        $scope.selection = template;
        $scope.changeableParams = [];
        console.log("selected ", $scope.selection);
        angular.forEach($scope.selection.changeable_params, function(param) {
            var obj = {
              "name": param.name,
              "value": param.placeholder,
              "type": param.type
            };
            $scope.changeableParams.push( obj );
        })
      };
      $scope.isSelected = function (template) {
        if ($scope.selection && template.id === $scope.selection.id) {
          return true;
        }
        return false;
      }
      $scope.save = function() {
        if ( $scope.selection ) {
          $scope.step = 2;
          return;
        }
        onSelected($scope.selection);
      }
      $scope.save2 = function() {
        var model = $shared.cellModel;
        console.log("adding macro params to ", model);
        var paramsToAdd = angular.copy($scope.changeableParams);
        onSelected($scope.selection, paramsToAdd);
      }
      $scope.cancel = function() {

          $mdDialog.hide();
          onCancel();
      }
      $http.get("/")
      var url = createUrl("/function/listTemplates");
      $http.get(url).then(function (res) {
        console.log("templates are ", res.data);
        $scope.templates = res.data.data;
      });
    }


    $scope.editFunction = function ($event, macroFunctionTitle) {
      console.log("editFunction called..", macroFunctionTitle);
      console.log("editFunction saved functions are ", $shared.functions);
      var macroFunction = $shared.functionsFull.filter(function(obj) {
        return obj.title === macroFunctionTitle;
      })[0];
      console.log("editFunction macro function is ", macroFunction);
      $mdDialog.show({
          controller: DialogController,
          templateUrl: '/dialogs/editor.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {
            macroFunction: macroFunction,
            onSave: function () {
              console.log("saved new function");

            },
            onCancel: null
          }
        })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    }

    function addFunctionStep2($event, code, paramsToAdd) {
      console.log("addFunction called..");
      $mdDialog.show({
          controller: DialogController,
          templateUrl: '/dialogs/editor.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {
            macroFunction: { code: code },
            onSave: function (macroFn) {
              console.log("saved new function", macroFn);
              var model = $scope.cellModel;
              $shared.loadFunctions().then(function(functions) {
                if (paramsToAdd) {
                  model.data.params = model.data.params || [];
                  angular.forEach(paramsToAdd, function(param) {
                      model.data.params.push( {
                        "name": param.name,
                        "value": param.value
                      });
                    });
                  }
                  $shared.functions = functions;
                  console.log("checking functions ", functions);
                  angular.forEach(functions, function(item) {
                      if ( item === macroFn.title ) {
                        model.data.function = item;
                      }
                  });
                  console.log("model data is now ", model.data);
                  $scope.$apply();
                });
            },
            onCancel: null
          }
        })
        .then(function (answer) {
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });
    }
   $scope.addFunction = function($event) {
      console.log("addFunction called in $scope..");
      $mdDialog.show({
          controller: DialogSelectController,
          templateUrl: '/dialogs/editor-select.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {
            macroFunction: null,
            onSelected: function (value, paramsToAdd) {
              console.log("saved new function");
              addFunctionStep2($event, value['code'], paramsToAdd);
            },
            onCancel: null
          }
        })
    }

  });

angular.lowercase = angular.$$lowercase;  
/*! JointJS+ - Set of JointJS compatible plugins

Copyright (c) 2013 client IO

 2014-01-22 


This Source Code Form is subject to the terms of the JointJS+ License
, v. 1.0. If a copy of the JointJS+ License was not distributed with this
file, You can obtain one at http://jointjs.com/license/jointjs_plus_v1.txt
 or from the JointJS+ archive as was distributed by client IO. See the LICENSE file.*/


// Command manager implements undo/redo functionality.

joint.dia.CommandManager = Backbone.Model.extend({

    defaults: {
	cmdBeforeAdd: null,
	cmdNameRegex: /^(?:add|remove|change:\w+)$/
    },

    // length of prefix 'change:' in the event name
    PREFIX_LENGTH: 7,

    initialize: function(options) {

        _.bindAll(this, 'initBatchCommand', 'storeBatchCommand');

        this.graph = options.graph;

        this.reset();
        this.listen();
    },

    listen: function() {

        this.listenTo(this.graph, 'all', this.addCommand, this);

	this.listenTo(this.graph, 'batch:start', this.initBatchCommand, this);
	this.listenTo(this.graph, 'batch:stop', this.storeBatchCommand, this);
    },

    createCommand: function(options) {
	
	var cmd = {
	    action: undefined,
	    data: { id: undefined, type: undefined, previous: {}, next: {}},
	    batch: options && options.batch
	}
	
	return cmd;
    },

    addCommand: function(cmdName, cell, graph, options) {

	if (!this.get('cmdNameRegex').test(cmdName)) {
	    return;
	}

	if (typeof this.get('cmdBeforeAdd') == 'function' && !this.get('cmdBeforeAdd').apply(this, arguments)) {
	    return;
	}

	var push = _.bind(function(cmd) {
	    
	    this.redoStack = [];

	    if (!cmd.batch) {
		this.undoStack.push(cmd);
		this.trigger('add', cmd);
	    } else {
                this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
		// Commands possible thrown away. Someone might be interested.
		this.trigger('batch', cmd);
	    }
	    
	}, this);
	
	var command = undefined;

	if (this.batchCommand) {
            // set command as the one used last.
            // in most cases we are working with same object, doing same action
            // etc. translate an object piece by piece
	    command = this.batchCommand[Math.max(this.lastCmdIndex,0)];

            // Check if we are start working with new object or performing different action with it.
            // Note, that command is uninitialized when lastCmdIndex equals -1. (see 'initBatchCommand()') 
            // in that case we are done, command we were looking for is already set
	    if (this.lastCmdIndex >= 0 && (command.data.id !== cell.id || command.action !== cmdName)) {

                // trying to find command first, which was performing same action with the object
                // as we are doing now with cell
                command = _.find(this.batchCommand, function(cmd, index) {
                    this.lastCmdIndex = index;
                    return cmd.data.id === cell.id && cmd.action === cmdName;
                }, this);

		if (!command) {
                    // command with such an id and action was not found. Let's create new one
		    this.lastCmdIndex = this.batchCommand.push(this.createCommand({ batch:  true })) - 1;
		    command = _.last(this.batchCommand);
                }
	    }
	    
	} else {
	    
            // single command
	    command = this.createCommand();
	    command.batch = false;
	    
	}

        if (cmdName === 'add' || cmdName === 'remove') {

            command.action = cmdName;
            command.data.id = cell.id;
	    command.data.type = cell.attributes.type;
            command.data.attributes = _.merge({}, cell.toJSON());
	    command.options = options || {};
	    
	    return push(command);
	}

        // `changedAttribute` holds the attribute name corresponding
	// to the change event triggered on the model.
        var changedAttribute = cmdName.substr(this.PREFIX_LENGTH);
	
	if (!command.batch || !command.action) {
	    // Do this only once. Set previous box and action (also serves as a flag so that
	    // we don't repeat this branche).
	    command.action = cmdName;
	    command.data.id = cell.id;
	    command.data.type = cell.attributes.type;
	    command.data.previous[changedAttribute] = _.clone(cell.previous(changedAttribute));
	    command.options = options || {};
	}

	command.data.next[changedAttribute] = _.clone(cell.get(changedAttribute));

	return push(command);
    },

    // Batch commands are those that merge certain commands applied in a row (1) and those that 
    // hold multiple commands where one action consists of more than one command (2)
    // (1) This is useful for e.g. when the user is dragging an object in the paper which would
    // normally lead to 1px translation commands. Applying undo() on such commands separately is
    // most likely undesirable.
    // (2) e.g When you are removing an element, you don't want all links connected to that element, which
    // are also being removed to be part of different command

    initBatchCommand: function() {

	if (!this.batchCommand) {

            this.batchCommand = [this.createCommand({ batch:  true})];
            this.lastCmdIndex = -1;

	    // batch level counts how many times has been initBatchCommand executed.
	    // It is useful when we doing an operation recursively.
	    this.batchLevel = 0;

	} else {

	    // batch command is already active
	    this.batchLevel++;
	}
    },

    storeBatchCommand: function() {

	// In order to store batch command it is necesary to run storeBatchCommand as many times as 
	// initBatchCommand was executed
        if (this.batchCommand && this.batchLevel <= 0) {

	    // checking if there is any valid command in batch
	    // for example: calling `initBatchCommand` immediately followed by `storeBatchCommand`
	    if (this.lastCmdIndex >= 0) {

		this.redoStack = [];

		this.undoStack.push(this.batchCommand);
		this.trigger('add', this.batchCommand);
	    }

            delete this.batchCommand;
            delete this.lastCmdIndex;
	    delete this.batchLevel;

        } else if (this.batchCommand && this.batchLevel > 0) {

	    // low down batch command level, but not store it yet
	    this.batchLevel--;
	}
    },

    revertCommand: function(command) {
	
        this.stopListening();

	var batchCommand;

	if (_.isArray(command)) {
	    batchCommand = command;
	} else {
	    batchCommand = [command];
	}
	
	for (var i = batchCommand.length - 1; i >= 0; i--)  {

            var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);
        
            switch (cmd.action) {
		
            case 'add':
		cell.remove();
		break;

            case 'remove':
		this.graph.addCell(cmd.data.attributes);
		break;

            default:
                var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                cell.set(attribute, cmd.data.previous[attribute]);
                break;
            }

	}

        this.listen();
    },

    applyCommand: function(command) {

        this.stopListening();

	var batchCommand;

	if (_.isArray(command)) {
	    batchCommand = command;
	} else {
	    batchCommand = [command];
	}
	
	for (var i = 0; i < batchCommand.length; i++)  {

            var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);
        
            switch (cmd.action) {
            
            case 'add':
		this.graph.addCell(cmd.data.attributes);
		break;

            case 'remove':
		cell.remove();
		break;

            default:
                var attribute = cmd.action.substr(this.PREFIX_LENGTH);
                cell.set(attribute, cmd.data.next[attribute]);
                break;

	    }
	    
	}
	    
        this.listen();
    },

    undo: function() {

        var command = this.undoStack.pop();

        if (command) {

            this.revertCommand(command);
            this.redoStack.push(command);
        }
    },


    redo: function() {

        var command = this.redoStack.pop();

        if (command) {

            this.applyCommand(command);
            this.undoStack.push(command);
        }
    },

    cancel: function() {

	if (this.hasUndo()) {

	    this.revertCommand(this.undoStack.pop());
	    this.redoStack = [];
	}
    },

    reset: function() {

        this.undoStack = [];
        this.redoStack = [];
    },

    hasUndo: function() {

        return this.undoStack.length > 0;
    },

    hasRedo: function() {

        return this.redoStack.length > 0;
    }
});


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
       joint.shapes.devs.SendDigitsModel,
       joint.shapes.devs.WaitModel,
       joint.shapes.devs.HangupModel,
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


function adjustVertices(graph, cell) {

    // if `cell` is a view, find its model
    cell = cell.model || cell;

    if (cell instanceof joint.dia.Element) {
        // `cell` is an element

        _.chain(graph.getConnectedLinks(cell))
            .groupBy(function(link) {

                // the key of the group is the model id of the link's source or target
                // cell id is omitted
                return _.omit([link.source().id, link.target().id], cell.id)[0];
            })
            .each(function(group, key) {

                // if the member of the group has both source and target model
                // then adjust vertices
                if (key !== 'undefined') adjustVertices(graph, _.first(group));
            })
            .value();

        return;
    }

    // `cell` is a link
    // get its source and target model IDs
    var sourceId = cell.get('source').id || cell.previous('source').id;
    var targetId = cell.get('target').id || cell.previous('target').id;

    // if one of the ends is not a model
    // (if the link is pinned to paper at a point)
    // the link is interpreted as having no siblings
    if (!sourceId || !targetId) {
        // no vertices needed
        cell.unset('vertices');
        return;
    }

    // identify link siblings
    var siblings = graph.getLinks().filter(function(sibling) {

        var siblingSourceId = sibling.source().id;
        var siblingTargetId = sibling.target().id;

        // if source and target are the same
        // or if source and target are reversed
        return ((siblingSourceId === sourceId) && (siblingTargetId === targetId))
            || ((siblingSourceId === targetId) && (siblingTargetId === sourceId));
    });

    var numSiblings = siblings.length;
    switch (numSiblings) {

        case 0: {
            // the link has no siblings
            break;
        }
        default: {

            if (numSiblings === 1) {
                // there is only one link
                // no vertices needed
                cell.unset('vertices');
            }

            // there are multiple siblings
            // we need to create vertices

            // find the middle point of the link
            var sourceCenter = graph.getCell(sourceId).getBBox().center();
            var targetCenter = graph.getCell(targetId).getBBox().center();
            var midPoint = g.Line(sourceCenter, targetCenter).midpoint();

            // find the angle of the link
            var theta = sourceCenter.theta(targetCenter);

            // constant
            // the maximum distance between two sibling links
            var GAP = 20;

            _.each(siblings, function(sibling, index) {

                // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
                var offset = GAP * Math.ceil(index / 2);

                // place the vertices at points which are `offset` pixels perpendicularly away
                // from the first link
                //
                // as index goes up, alternate left and right
                //
                //  ^  odd indices
                //  |
                //  |---->  index 0 sibling - centerline (between source and target centers)
                //  |
                //  v  even indices
                var sign = ((index % 2) ? 1 : -1);

                // to assure symmetry, if there is an even number of siblings
                // shift all vertices leftward perpendicularly away from the centerline
                if ((numSiblings % 2) === 0) {
                    offset -= ((GAP / 2) * sign);
                }

                // make reverse links count the same as non-reverse
                var reverse = ((theta < 180) ? 1 : -1);

                // we found the vertex
                var angle = g.toRad(theta + (sign * reverse * 90));
                var vertex = g.Point.fromPolar(offset, angle, midPoint).toJSON();

                // replace vertices array with `vertex`
                sibling.vertices([vertex]);
            });
        }
    }
}

function bindInteractionEvents(adjustVertices, graph, paper) {

    // bind `graph` to the `adjustVertices` function
    var adjustGraphVertices = _.partial(adjustVertices, graph);

    // adjust vertices when a cell is removed or its source/target was changed
    graph.on('add remove change:source change:target', adjustGraphVertices);

    // adjust vertices when the user stops interacting with an element
    paper.on('cell:pointerup', adjustGraphVertices);
}

function addTools(paper, link) {

    var toolsView = new joint.dia.ToolsView({
        tools: [
            new joint.linkTools.SourceArrowhead(),
            new joint.linkTools.TargetArrowhead()
        ]
    });
    link.findView(paper).addTools(toolsView);
}

function bindToolEvents(paper) {

    // show link tools
    paper.on('link:mouseover', function(linkView) {
        linkView.showTools();
    });

    // hide link tools
    paper.on('link:mouseout', function(linkView) {
        linkView.hideTools();
    });
    paper.on('blank:mouseover cell:mouseover', function() {
        paper.hideTools();
    });
}
// svg-pan-zoom v3.6.0
// https://github.com/ariutta/svg-pan-zoom
!function t(e,o,n){function i(r,a){if(!o[r]){if(!e[r]){var l="function"==typeof require&&require;if(!a&&l)return l(r,!0);if(s)return s(r,!0);var u=new Error("Cannot find module '"+r+"'");throw u.code="MODULE_NOT_FOUND",u}var h=o[r]={exports:{}};e[r][0].call(h.exports,function(t){var o=e[r][1][t];return i(o?o:t)},h,h.exports,t,e,o,n)}return o[r].exports}for(var s="function"==typeof require&&require,r=0;r<n.length;r++)i(n[r]);return i}({1:[function(t,e,o){var n=t("./svg-pan-zoom.js");!function(t,o){"function"==typeof define&&define.amd?define("svg-pan-zoom",function(){return n}):"undefined"!=typeof e&&e.exports&&(e.exports=n,t.svgPanZoom=n)}(window,document)},{"./svg-pan-zoom.js":4}],2:[function(t,e,o){var n=t("./svg-utilities");e.exports={enable:function(t){var e=t.svg.querySelector("defs");e||(e=document.createElementNS(n.svgNS,"defs"),t.svg.appendChild(e));var o=e.querySelector("style#svg-pan-zoom-controls-styles");if(!o){var i=document.createElementNS(n.svgNS,"style");i.setAttribute("id","svg-pan-zoom-controls-styles"),i.setAttribute("type","text/css"),i.textContent=".svg-pan-zoom-control { cursor: pointer; fill: black; fill-opacity: 0.333; } .svg-pan-zoom-control:hover { fill-opacity: 0.8; } .svg-pan-zoom-control-background { fill: white; fill-opacity: 0.5; } .svg-pan-zoom-control-background { fill-opacity: 0.8; }",e.appendChild(i)}var s=document.createElementNS(n.svgNS,"g");s.setAttribute("id","svg-pan-zoom-controls"),s.setAttribute("transform","translate("+(t.width-70)+" "+(t.height-76)+") scale(0.75)"),s.setAttribute("class","svg-pan-zoom-control"),s.appendChild(this._createZoomIn(t)),s.appendChild(this._createZoomReset(t)),s.appendChild(this._createZoomOut(t)),t.svg.appendChild(s),t.controlIcons=s},_createZoomIn:function(t){var e=document.createElementNS(n.svgNS,"g");e.setAttribute("id","svg-pan-zoom-zoom-in"),e.setAttribute("transform","translate(30.5 5) scale(0.015)"),e.setAttribute("class","svg-pan-zoom-control"),e.addEventListener("click",function(){t.getPublicInstance().zoomIn()},!1),e.addEventListener("touchstart",function(){t.getPublicInstance().zoomIn()},!1);var o=document.createElementNS(n.svgNS,"rect");o.setAttribute("x","0"),o.setAttribute("y","0"),o.setAttribute("width","1500"),o.setAttribute("height","1400"),o.setAttribute("class","svg-pan-zoom-control-background"),e.appendChild(o);var i=document.createElementNS(n.svgNS,"path");return i.setAttribute("d","M1280 576v128q0 26 -19 45t-45 19h-320v320q0 26 -19 45t-45 19h-128q-26 0 -45 -19t-19 -45v-320h-320q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h320v-320q0 -26 19 -45t45 -19h128q26 0 45 19t19 45v320h320q26 0 45 19t19 45zM1536 1120v-960 q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5t84.5 -203.5z"),i.setAttribute("class","svg-pan-zoom-control-element"),e.appendChild(i),e},_createZoomReset:function(t){var e=document.createElementNS(n.svgNS,"g");e.setAttribute("id","svg-pan-zoom-reset-pan-zoom"),e.setAttribute("transform","translate(5 35) scale(0.4)"),e.setAttribute("class","svg-pan-zoom-control"),e.addEventListener("click",function(){t.getPublicInstance().reset()},!1),e.addEventListener("touchstart",function(){t.getPublicInstance().reset()},!1);var o=document.createElementNS(n.svgNS,"rect");o.setAttribute("x","2"),o.setAttribute("y","2"),o.setAttribute("width","182"),o.setAttribute("height","58"),o.setAttribute("class","svg-pan-zoom-control-background"),e.appendChild(o);var i=document.createElementNS(n.svgNS,"path");i.setAttribute("d","M33.051,20.632c-0.742-0.406-1.854-0.609-3.338-0.609h-7.969v9.281h7.769c1.543,0,2.701-0.188,3.473-0.562c1.365-0.656,2.048-1.953,2.048-3.891C35.032,22.757,34.372,21.351,33.051,20.632z"),i.setAttribute("class","svg-pan-zoom-control-element"),e.appendChild(i);var s=document.createElementNS(n.svgNS,"path");return s.setAttribute("d","M170.231,0.5H15.847C7.102,0.5,0.5,5.708,0.5,11.84v38.861C0.5,56.833,7.102,61.5,15.847,61.5h154.384c8.745,0,15.269-4.667,15.269-10.798V11.84C185.5,5.708,178.976,0.5,170.231,0.5z M42.837,48.569h-7.969c-0.219-0.766-0.375-1.383-0.469-1.852c-0.188-0.969-0.289-1.961-0.305-2.977l-0.047-3.211c-0.03-2.203-0.41-3.672-1.142-4.406c-0.732-0.734-2.103-1.102-4.113-1.102h-7.05v13.547h-7.055V14.022h16.524c2.361,0.047,4.178,0.344,5.45,0.891c1.272,0.547,2.351,1.352,3.234,2.414c0.731,0.875,1.31,1.844,1.737,2.906s0.64,2.273,0.64,3.633c0,1.641-0.414,3.254-1.242,4.84s-2.195,2.707-4.102,3.363c1.594,0.641,2.723,1.551,3.387,2.73s0.996,2.98,0.996,5.402v2.32c0,1.578,0.063,2.648,0.19,3.211c0.19,0.891,0.635,1.547,1.333,1.969V48.569z M75.579,48.569h-26.18V14.022h25.336v6.117H56.454v7.336h16.781v6H56.454v8.883h19.125V48.569z M104.497,46.331c-2.44,2.086-5.887,3.129-10.34,3.129c-4.548,0-8.125-1.027-10.731-3.082s-3.909-4.879-3.909-8.473h6.891c0.224,1.578,0.662,2.758,1.316,3.539c1.196,1.422,3.246,2.133,6.15,2.133c1.739,0,3.151-0.188,4.236-0.562c2.058-0.719,3.087-2.055,3.087-4.008c0-1.141-0.504-2.023-1.512-2.648c-1.008-0.609-2.607-1.148-4.796-1.617l-3.74-0.82c-3.676-0.812-6.201-1.695-7.576-2.648c-2.328-1.594-3.492-4.086-3.492-7.477c0-3.094,1.139-5.664,3.417-7.711s5.623-3.07,10.036-3.07c3.685,0,6.829,0.965,9.431,2.895c2.602,1.93,3.966,4.73,4.093,8.402h-6.938c-0.128-2.078-1.057-3.555-2.787-4.43c-1.154-0.578-2.587-0.867-4.301-0.867c-1.907,0-3.428,0.375-4.565,1.125c-1.138,0.75-1.706,1.797-1.706,3.141c0,1.234,0.561,2.156,1.682,2.766c0.721,0.406,2.25,0.883,4.589,1.43l6.063,1.43c2.657,0.625,4.648,1.461,5.975,2.508c2.059,1.625,3.089,3.977,3.089,7.055C108.157,41.624,106.937,44.245,104.497,46.331z M139.61,48.569h-26.18V14.022h25.336v6.117h-18.281v7.336h16.781v6h-16.781v8.883h19.125V48.569z M170.337,20.14h-10.336v28.43h-7.266V20.14h-10.383v-6.117h27.984V20.14z"),s.setAttribute("class","svg-pan-zoom-control-element"),e.appendChild(s),e},_createZoomOut:function(t){var e=document.createElementNS(n.svgNS,"g");e.setAttribute("id","svg-pan-zoom-zoom-out"),e.setAttribute("transform","translate(30.5 70) scale(0.015)"),e.setAttribute("class","svg-pan-zoom-control"),e.addEventListener("click",function(){t.getPublicInstance().zoomOut()},!1),e.addEventListener("touchstart",function(){t.getPublicInstance().zoomOut()},!1);var o=document.createElementNS(n.svgNS,"rect");o.setAttribute("x","0"),o.setAttribute("y","0"),o.setAttribute("width","1500"),o.setAttribute("height","1400"),o.setAttribute("class","svg-pan-zoom-control-background"),e.appendChild(o);var i=document.createElementNS(n.svgNS,"path");return i.setAttribute("d","M1280 576v128q0 26 -19 45t-45 19h-896q-26 0 -45 -19t-19 -45v-128q0 -26 19 -45t45 -19h896q26 0 45 19t19 45zM1536 1120v-960q0 -119 -84.5 -203.5t-203.5 -84.5h-960q-119 0 -203.5 84.5t-84.5 203.5v960q0 119 84.5 203.5t203.5 84.5h960q119 0 203.5 -84.5 t84.5 -203.5z"),i.setAttribute("class","svg-pan-zoom-control-element"),e.appendChild(i),e},disable:function(t){t.controlIcons&&(t.controlIcons.parentNode.removeChild(t.controlIcons),t.controlIcons=null)}}},{"./svg-utilities":5}],3:[function(t,e,o){var n=t("./svg-utilities"),i=t("./utilities"),s=function(t,e){this.init(t,e)};s.prototype.init=function(t,e){this.viewport=t,this.options=e,this.originalState={zoom:1,x:0,y:0},this.activeState={zoom:1,x:0,y:0},this.updateCTMCached=i.proxy(this.updateCTM,this),this.requestAnimationFrame=i.createRequestAnimationFrame(this.options.refreshRate),this.viewBox={x:0,y:0,width:0,height:0},this.cacheViewBox();var o=this.processCTM();this.setCTM(o),this.updateCTM()},s.prototype.cacheViewBox=function(){var t=this.options.svg.getAttribute("viewBox");if(t){var e=t.split(/[\s\,]/).filter(function(t){return t}).map(parseFloat);this.viewBox.x=e[0],this.viewBox.y=e[1],this.viewBox.width=e[2],this.viewBox.height=e[3];var o=Math.min(this.options.width/this.viewBox.width,this.options.height/this.viewBox.height);this.activeState.zoom=o,this.activeState.x=(this.options.width-this.viewBox.width*o)/2,this.activeState.y=(this.options.height-this.viewBox.height*o)/2,this.updateCTMOnNextFrame(),this.options.svg.removeAttribute("viewBox")}else this.simpleViewBoxCache()},s.prototype.simpleViewBoxCache=function(){var t=this.viewport.getBBox();this.viewBox.x=t.x,this.viewBox.y=t.y,this.viewBox.width=t.width,this.viewBox.height=t.height},s.prototype.getViewBox=function(){return i.extend({},this.viewBox)},s.prototype.processCTM=function(){var t=this.getCTM();if(this.options.fit||this.options.contain){var e;e=this.options.fit?Math.min(this.options.width/this.viewBox.width,this.options.height/this.viewBox.height):Math.max(this.options.width/this.viewBox.width,this.options.height/this.viewBox.height),t.a=e,t.d=e,t.e=-this.viewBox.x*e,t.f=-this.viewBox.y*e}if(this.options.center){var o=.5*(this.options.width-(this.viewBox.width+2*this.viewBox.x)*t.a),n=.5*(this.options.height-(this.viewBox.height+2*this.viewBox.y)*t.a);t.e=o,t.f=n}return this.originalState.zoom=t.a,this.originalState.x=t.e,this.originalState.y=t.f,t},s.prototype.getOriginalState=function(){return i.extend({},this.originalState)},s.prototype.getState=function(){return i.extend({},this.activeState)},s.prototype.getZoom=function(){return this.activeState.zoom},s.prototype.getRelativeZoom=function(){return this.activeState.zoom/this.originalState.zoom},s.prototype.computeRelativeZoom=function(t){return t/this.originalState.zoom},s.prototype.getPan=function(){return{x:this.activeState.x,y:this.activeState.y}},s.prototype.getCTM=function(){var t=this.options.svg.createSVGMatrix();return t.a=this.activeState.zoom,t.b=0,t.c=0,t.d=this.activeState.zoom,t.e=this.activeState.x,t.f=this.activeState.y,t},s.prototype.setCTM=function(t){var e=this.isZoomDifferent(t),o=this.isPanDifferent(t);if(e||o){if(e&&(this.options.beforeZoom(this.getRelativeZoom(),this.computeRelativeZoom(t.a))===!1?(t.a=t.d=this.activeState.zoom,e=!1):(this.updateCache(t),this.options.onZoom(this.getRelativeZoom()))),o){var n=this.options.beforePan(this.getPan(),{x:t.e,y:t.f}),s=!1,r=!1;n===!1?(t.e=this.getPan().x,t.f=this.getPan().y,s=r=!0):i.isObject(n)&&(n.x===!1?(t.e=this.getPan().x,s=!0):i.isNumber(n.x)&&(t.e=n.x),n.y===!1?(t.f=this.getPan().y,r=!0):i.isNumber(n.y)&&(t.f=n.y)),s&&r||!this.isPanDifferent(t)?o=!1:(this.updateCache(t),this.options.onPan(this.getPan()))}(e||o)&&this.updateCTMOnNextFrame()}},s.prototype.isZoomDifferent=function(t){return this.activeState.zoom!==t.a},s.prototype.isPanDifferent=function(t){return this.activeState.x!==t.e||this.activeState.y!==t.f},s.prototype.updateCache=function(t){this.activeState.zoom=t.a,this.activeState.x=t.e,this.activeState.y=t.f},s.prototype.pendingUpdate=!1,s.prototype.updateCTMOnNextFrame=function(){this.pendingUpdate||(this.pendingUpdate=!0,this.requestAnimationFrame.call(window,this.updateCTMCached))},s.prototype.updateCTM=function(){var t=this.getCTM();n.setCTM(this.viewport,t,this.defs),this.pendingUpdate=!1,this.options.onUpdatedCTM&&this.options.onUpdatedCTM(t)},e.exports=function(t,e){return new s(t,e)}},{"./svg-utilities":5,"./utilities":7}],4:[function(t,e,o){var n=t("./uniwheel"),i=t("./control-icons"),s=t("./utilities"),r=t("./svg-utilities"),a=t("./shadow-viewport"),l=function(t,e){this.init(t,e)},u={viewportSelector:".svg-pan-zoom_viewport",panEnabled:!0,controlIconsEnabled:!1,zoomEnabled:!0,dblClickZoomEnabled:!0,mouseWheelZoomEnabled:!0,preventMouseEventsDefault:!0,zoomScaleSensitivity:.1,minZoom:.5,maxZoom:10,fit:!0,contain:!1,center:!0,refreshRate:"auto",beforeZoom:null,onZoom:null,beforePan:null,onPan:null,customEventsHandler:null,eventsListenerElement:null,onUpdatedCTM:null},h={passive:!0};l.prototype.init=function(t,e){var o=this;this.svg=t,this.defs=t.querySelector("defs"),r.setupSvgAttributes(this.svg),this.options=s.extend(s.extend({},u),e),this.state="none";var n=r.getBoundingClientRectNormalized(t);this.width=n.width,this.height=n.height,this.viewport=a(r.getOrCreateViewport(this.svg,this.options.viewportSelector),{svg:this.svg,width:this.width,height:this.height,fit:this.options.fit,contain:this.options.contain,center:this.options.center,refreshRate:this.options.refreshRate,beforeZoom:function(t,e){if(o.viewport&&o.options.beforeZoom)return o.options.beforeZoom(t,e)},onZoom:function(t){if(o.viewport&&o.options.onZoom)return o.options.onZoom(t)},beforePan:function(t,e){if(o.viewport&&o.options.beforePan)return o.options.beforePan(t,e)},onPan:function(t){if(o.viewport&&o.options.onPan)return o.options.onPan(t)},onUpdatedCTM:function(t){if(o.viewport&&o.options.onUpdatedCTM)return o.options.onUpdatedCTM(t)}});var l=this.getPublicInstance();l.setBeforeZoom(this.options.beforeZoom),l.setOnZoom(this.options.onZoom),l.setBeforePan(this.options.beforePan),l.setOnPan(this.options.onPan),l.setOnUpdatedCTM(this.options.onUpdatedCTM),this.options.controlIconsEnabled&&i.enable(this),this.lastMouseWheelEventTime=Date.now(),this.setupHandlers()},l.prototype.setupHandlers=function(){var t=this,e=null;if(this.eventListeners={mousedown:function(o){var n=t.handleMouseDown(o,e);return e=o,n},touchstart:function(o){var n=t.handleMouseDown(o,e);return e=o,n},mouseup:function(e){return t.handleMouseUp(e)},touchend:function(e){return t.handleMouseUp(e)},mousemove:function(e){return t.handleMouseMove(e)},touchmove:function(e){return t.handleMouseMove(e)},mouseleave:function(e){return t.handleMouseUp(e)},touchleave:function(e){return t.handleMouseUp(e)},touchcancel:function(e){return t.handleMouseUp(e)}},null!=this.options.customEventsHandler){this.options.customEventsHandler.init({svgElement:this.svg,eventsListenerElement:this.options.eventsListenerElement,instance:this.getPublicInstance()});var o=this.options.customEventsHandler.haltEventListeners;if(o&&o.length)for(var n=o.length-1;n>=0;n--)this.eventListeners.hasOwnProperty(o[n])&&delete this.eventListeners[o[n]]}for(var i in this.eventListeners)(this.options.eventsListenerElement||this.svg).addEventListener(i,this.eventListeners[i],!this.options.preventMouseEventsDefault&&h);this.options.mouseWheelZoomEnabled&&(this.options.mouseWheelZoomEnabled=!1,this.enableMouseWheelZoom())},l.prototype.enableMouseWheelZoom=function(){if(!this.options.mouseWheelZoomEnabled){var t=this;this.wheelListener=function(e){return t.handleMouseWheel(e)};var e=!this.options.preventMouseEventsDefault;n.on(this.options.eventsListenerElement||this.svg,this.wheelListener,e),this.options.mouseWheelZoomEnabled=!0}},l.prototype.disableMouseWheelZoom=function(){if(this.options.mouseWheelZoomEnabled){var t=!this.options.preventMouseEventsDefault;n.off(this.options.eventsListenerElement||this.svg,this.wheelListener,t),this.options.mouseWheelZoomEnabled=!1}},l.prototype.handleMouseWheel=function(t){if(this.options.zoomEnabled&&"none"===this.state){this.options.preventMouseEventsDefault&&(t.preventDefault?t.preventDefault():t.returnValue=!1);var e=t.deltaY||1,o=Date.now()-this.lastMouseWheelEventTime,n=3+Math.max(0,30-o);this.lastMouseWheelEventTime=Date.now(),"deltaMode"in t&&0===t.deltaMode&&t.wheelDelta&&(e=0===t.deltaY?0:Math.abs(t.wheelDelta)/t.deltaY),e=-.3<e&&e<.3?e:(e>0?1:-1)*Math.log(Math.abs(e)+10)/n;var i=this.svg.getScreenCTM().inverse(),s=r.getEventPoint(t,this.svg).matrixTransform(i),a=Math.pow(1+this.options.zoomScaleSensitivity,-1*e);this.zoomAtPoint(a,s)}},l.prototype.zoomAtPoint=function(t,e,o){var n=this.viewport.getOriginalState();o?(t=Math.max(this.options.minZoom*n.zoom,Math.min(this.options.maxZoom*n.zoom,t)),t/=this.getZoom()):this.getZoom()*t<this.options.minZoom*n.zoom?t=this.options.minZoom*n.zoom/this.getZoom():this.getZoom()*t>this.options.maxZoom*n.zoom&&(t=this.options.maxZoom*n.zoom/this.getZoom());var i=this.viewport.getCTM(),s=e.matrixTransform(i.inverse()),r=this.svg.createSVGMatrix().translate(s.x,s.y).scale(t).translate(-s.x,-s.y),a=i.multiply(r);a.a!==i.a&&this.viewport.setCTM(a)},l.prototype.zoom=function(t,e){this.zoomAtPoint(t,r.getSvgCenterPoint(this.svg,this.width,this.height),e)},l.prototype.publicZoom=function(t,e){e&&(t=this.computeFromRelativeZoom(t)),this.zoom(t,e)},l.prototype.publicZoomAtPoint=function(t,e,o){if(o&&(t=this.computeFromRelativeZoom(t)),"SVGPoint"!==s.getType(e)){if(!("x"in e&&"y"in e))throw new Error("Given point is invalid");e=r.createSVGPoint(this.svg,e.x,e.y)}this.zoomAtPoint(t,e,o)},l.prototype.getZoom=function(){return this.viewport.getZoom()},l.prototype.getRelativeZoom=function(){return this.viewport.getRelativeZoom()},l.prototype.computeFromRelativeZoom=function(t){return t*this.viewport.getOriginalState().zoom},l.prototype.resetZoom=function(){var t=this.viewport.getOriginalState();this.zoom(t.zoom,!0)},l.prototype.resetPan=function(){this.pan(this.viewport.getOriginalState())},l.prototype.reset=function(){this.resetZoom(),this.resetPan()},l.prototype.handleDblClick=function(t){if(this.options.preventMouseEventsDefault&&(t.preventDefault?t.preventDefault():t.returnValue=!1),this.options.controlIconsEnabled){var e=t.target.getAttribute("class")||"";if(e.indexOf("svg-pan-zoom-control")>-1)return!1}var o;o=t.shiftKey?1/(2*(1+this.options.zoomScaleSensitivity)):2*(1+this.options.zoomScaleSensitivity);var n=r.getEventPoint(t,this.svg).matrixTransform(this.svg.getScreenCTM().inverse());this.zoomAtPoint(o,n)},l.prototype.handleMouseDown=function(t,e){this.options.preventMouseEventsDefault&&(t.preventDefault?t.preventDefault():t.returnValue=!1),s.mouseAndTouchNormalize(t,this.svg),this.options.dblClickZoomEnabled&&s.isDblClick(t,e)?this.handleDblClick(t):(this.state="pan",this.firstEventCTM=this.viewport.getCTM(),this.stateOrigin=r.getEventPoint(t,this.svg).matrixTransform(this.firstEventCTM.inverse()))},l.prototype.handleMouseMove=function(t){if(this.options.preventMouseEventsDefault&&(t.preventDefault?t.preventDefault():t.returnValue=!1),"pan"===this.state&&this.options.panEnabled){var e=r.getEventPoint(t,this.svg).matrixTransform(this.firstEventCTM.inverse()),o=this.firstEventCTM.translate(e.x-this.stateOrigin.x,e.y-this.stateOrigin.y);this.viewport.setCTM(o)}},l.prototype.handleMouseUp=function(t){this.options.preventMouseEventsDefault&&(t.preventDefault?t.preventDefault():t.returnValue=!1),"pan"===this.state&&(this.state="none")},l.prototype.fit=function(){var t=this.viewport.getViewBox(),e=Math.min(this.width/t.width,this.height/t.height);this.zoom(e,!0)},l.prototype.contain=function(){var t=this.viewport.getViewBox(),e=Math.max(this.width/t.width,this.height/t.height);this.zoom(e,!0)},l.prototype.center=function(){var t=this.viewport.getViewBox(),e=.5*(this.width-(t.width+2*t.x)*this.getZoom()),o=.5*(this.height-(t.height+2*t.y)*this.getZoom());this.getPublicInstance().pan({x:e,y:o})},l.prototype.updateBBox=function(){this.viewport.simpleViewBoxCache()},l.prototype.pan=function(t){var e=this.viewport.getCTM();e.e=t.x,e.f=t.y,this.viewport.setCTM(e)},l.prototype.panBy=function(t){var e=this.viewport.getCTM();e.e+=t.x,e.f+=t.y,this.viewport.setCTM(e)},l.prototype.getPan=function(){var t=this.viewport.getState();return{x:t.x,y:t.y}},l.prototype.resize=function(){var t=r.getBoundingClientRectNormalized(this.svg);this.width=t.width,this.height=t.height;var e=this.viewport;e.options.width=this.width,e.options.height=this.height,e.processCTM(),this.options.controlIconsEnabled&&(this.getPublicInstance().disableControlIcons(),this.getPublicInstance().enableControlIcons())},l.prototype.destroy=function(){var t=this;this.beforeZoom=null,this.onZoom=null,this.beforePan=null,this.onPan=null,this.onUpdatedCTM=null,null!=this.options.customEventsHandler&&this.options.customEventsHandler.destroy({svgElement:this.svg,eventsListenerElement:this.options.eventsListenerElement,instance:this.getPublicInstance()});for(var e in this.eventListeners)(this.options.eventsListenerElement||this.svg).removeEventListener(e,this.eventListeners[e],!this.options.preventMouseEventsDefault&&h);this.disableMouseWheelZoom(),this.getPublicInstance().disableControlIcons(),this.reset(),c=c.filter(function(e){return e.svg!==t.svg}),delete this.options,delete this.viewport,delete this.publicInstance,delete this.pi,this.getPublicInstance=function(){return null}},l.prototype.getPublicInstance=function(){var t=this;return this.publicInstance||(this.publicInstance=this.pi={enablePan:function(){return t.options.panEnabled=!0,t.pi},disablePan:function(){return t.options.panEnabled=!1,t.pi},isPanEnabled:function(){return!!t.options.panEnabled},pan:function(e){return t.pan(e),t.pi},panBy:function(e){return t.panBy(e),t.pi},getPan:function(){return t.getPan()},setBeforePan:function(e){return t.options.beforePan=null===e?null:s.proxy(e,t.publicInstance),t.pi},setOnPan:function(e){return t.options.onPan=null===e?null:s.proxy(e,t.publicInstance),t.pi},enableZoom:function(){return t.options.zoomEnabled=!0,t.pi},disableZoom:function(){return t.options.zoomEnabled=!1,t.pi},isZoomEnabled:function(){return!!t.options.zoomEnabled},enableControlIcons:function(){return t.options.controlIconsEnabled||(t.options.controlIconsEnabled=!0,i.enable(t)),t.pi},disableControlIcons:function(){return t.options.controlIconsEnabled&&(t.options.controlIconsEnabled=!1,i.disable(t)),t.pi},isControlIconsEnabled:function(){return!!t.options.controlIconsEnabled},enableDblClickZoom:function(){return t.options.dblClickZoomEnabled=!0,t.pi},disableDblClickZoom:function(){return t.options.dblClickZoomEnabled=!1,t.pi},isDblClickZoomEnabled:function(){return!!t.options.dblClickZoomEnabled},enableMouseWheelZoom:function(){return t.enableMouseWheelZoom(),t.pi},disableMouseWheelZoom:function(){return t.disableMouseWheelZoom(),t.pi},isMouseWheelZoomEnabled:function(){return!!t.options.mouseWheelZoomEnabled},setZoomScaleSensitivity:function(e){return t.options.zoomScaleSensitivity=e,t.pi},setMinZoom:function(e){return t.options.minZoom=e,t.pi},setMaxZoom:function(e){return t.options.maxZoom=e,t.pi},setBeforeZoom:function(e){return t.options.beforeZoom=null===e?null:s.proxy(e,t.publicInstance),t.pi},setOnZoom:function(e){return t.options.onZoom=null===e?null:s.proxy(e,t.publicInstance),t.pi},zoom:function(e){return t.publicZoom(e,!0),t.pi},zoomBy:function(e){return t.publicZoom(e,!1),t.pi},zoomAtPoint:function(e,o){return t.publicZoomAtPoint(e,o,!0),t.pi},zoomAtPointBy:function(e,o){return t.publicZoomAtPoint(e,o,!1),t.pi},zoomIn:function(){return this.zoomBy(1+t.options.zoomScaleSensitivity),t.pi},zoomOut:function(){return this.zoomBy(1/(1+t.options.zoomScaleSensitivity)),t.pi},getZoom:function(){return t.getRelativeZoom()},setOnUpdatedCTM:function(e){return t.options.onUpdatedCTM=null===e?null:s.proxy(e,t.publicInstance),t.pi},resetZoom:function(){return t.resetZoom(),t.pi},resetPan:function(){return t.resetPan(),t.pi},reset:function(){return t.reset(),t.pi},fit:function(){return t.fit(),t.pi},contain:function(){return t.contain(),t.pi},center:function(){return t.center(),t.pi},updateBBox:function(){return t.updateBBox(),t.pi},resize:function(){return t.resize(),t.pi},getSizes:function(){return{width:t.width,height:t.height,realZoom:t.getZoom(),viewBox:t.viewport.getViewBox()}},destroy:function(){return t.destroy(),t.pi}}),this.publicInstance};var c=[],p=function(t,e){var o=s.getSvg(t);if(null===o)return null;for(var n=c.length-1;n>=0;n--)if(c[n].svg===o)return c[n].instance.getPublicInstance();return c.push({svg:o,instance:new l(o,e)}),c[c.length-1].instance.getPublicInstance()};e.exports=p},{"./control-icons":2,"./shadow-viewport":3,"./svg-utilities":5,"./uniwheel":6,"./utilities":7}],5:[function(t,e,o){var n=t("./utilities"),i="unknown";document.documentMode&&(i="ie"),e.exports={svgNS:"http://www.w3.org/2000/svg",xmlNS:"http://www.w3.org/XML/1998/namespace",xmlnsNS:"http://www.w3.org/2000/xmlns/",xlinkNS:"http://www.w3.org/1999/xlink",evNS:"http://www.w3.org/2001/xml-events",getBoundingClientRectNormalized:function(t){if(t.clientWidth&&t.clientHeight)return{width:t.clientWidth,height:t.clientHeight};if(t.getBoundingClientRect())return t.getBoundingClientRect();throw new Error("Cannot get BoundingClientRect for SVG.")},getOrCreateViewport:function(t,e){var o=null;if(o=n.isElement(e)?e:t.querySelector(e),!o){var i=Array.prototype.slice.call(t.childNodes||t.children).filter(function(t){return"defs"!==t.nodeName&&"#text"!==t.nodeName});1===i.length&&"g"===i[0].nodeName&&null===i[0].getAttribute("transform")&&(o=i[0])}if(!o){var s="viewport-"+(new Date).toISOString().replace(/\D/g,"");o=document.createElementNS(this.svgNS,"g"),o.setAttribute("id",s);var r=t.childNodes||t.children;if(r&&r.length>0)for(var a=r.length;a>0;a--)"defs"!==r[r.length-a].nodeName&&o.appendChild(r[r.length-a]);t.appendChild(o)}var l=[];return o.getAttribute("class")&&(l=o.getAttribute("class").split(" ")),~l.indexOf("svg-pan-zoom_viewport")||(l.push("svg-pan-zoom_viewport"),o.setAttribute("class",l.join(" "))),o},setupSvgAttributes:function(t){if(t.setAttribute("xmlns",this.svgNS),t.setAttributeNS(this.xmlnsNS,"xmlns:xlink",this.xlinkNS),t.setAttributeNS(this.xmlnsNS,"xmlns:ev",this.evNS),null!==t.parentNode){var e=t.getAttribute("style")||"";e.toLowerCase().indexOf("overflow")===-1&&t.setAttribute("style","overflow: hidden; "+e)}},internetExplorerRedisplayInterval:300,refreshDefsGlobal:n.throttle(function(){for(var t=document.querySelectorAll("defs"),e=t.length,o=0;o<e;o++){var n=t[o];n.parentNode.insertBefore(n,n)}},this?this.internetExplorerRedisplayInterval:null),setCTM:function(t,e,o){var n=this,s="matrix("+e.a+","+e.b+","+e.c+","+e.d+","+e.e+","+e.f+")";t.setAttributeNS(null,"transform",s),"transform"in t.style?t.style.transform=s:"-ms-transform"in t.style?t.style["-ms-transform"]=s:"-webkit-transform"in t.style&&(t.style["-webkit-transform"]=s),"ie"===i&&o&&(o.parentNode.insertBefore(o,o),window.setTimeout(function(){n.refreshDefsGlobal()},n.internetExplorerRedisplayInterval))},getEventPoint:function(t,e){var o=e.createSVGPoint();return n.mouseAndTouchNormalize(t,e),o.x=t.clientX,o.y=t.clientY,o},getSvgCenterPoint:function(t,e,o){return this.createSVGPoint(t,e/2,o/2)},createSVGPoint:function(t,e,o){var n=t.createSVGPoint();return n.x=e,n.y=o,n}}},{"./utilities":7}],6:[function(t,e,o){e.exports=function(){function t(t,e){var o=function(t){!t&&(t=window.event);var o={originalEvent:t,target:t.target||t.srcElement,type:"wheel",deltaMode:"MozMousePixelScroll"==t.type?0:1,deltaX:0,delatZ:0,preventDefault:function(){t.preventDefault?t.preventDefault():t.returnValue=!1}};return"mousewheel"==u?(o.deltaY=-.025*t.wheelDelta,t.wheelDeltaX&&(o.deltaX=-.025*t.wheelDeltaX)):o.deltaY=t.detail,e(o)};return c.push({element:t,fn:o}),o}function e(t){for(var e=0;e<c.length;e++)if(c[e].element===t)return c[e].fn;return function(){}}function o(t){for(var e=0;e<c.length;e++)if(c[e].element===t)return c.splice(e,1)}function n(e,o,n,i){var s;s="wheel"===u?n:t(e,n),e[a](h+o,s,!!i&&p)}function i(t,n,i,s){var r;r="wheel"===u?i:e(t),t[l](h+n,r,!!s&&p),o(t)}function s(t,e,o){n(t,u,e,o),"DOMMouseScroll"==u&&n(t,"MozMousePixelScroll",e,o)}function r(t,e,o){i(t,u,e,o),"DOMMouseScroll"==u&&i(t,"MozMousePixelScroll",e,o)}var a,l,u,h="",c=[],p={passive:!0};return window.addEventListener?(a="addEventListener",l="removeEventListener"):(a="attachEvent",l="detachEvent",h="on"),u="onwheel"in document.createElement("div")?"wheel":void 0!==document.onmousewheel?"mousewheel":"DOMMouseScroll",{on:s,off:r}}()},{}],7:[function(t,e,o){function n(t){return function(e){window.setTimeout(e,t)}}e.exports={extend:function(t,e){t=t||{};for(var o in e)this.isObject(e[o])?t[o]=this.extend(t[o],e[o]):t[o]=e[o];return t},isElement:function(t){return t instanceof HTMLElement||t instanceof SVGElement||t instanceof SVGSVGElement||t&&"object"==typeof t&&null!==t&&1===t.nodeType&&"string"==typeof t.nodeName},isObject:function(t){return"[object Object]"===Object.prototype.toString.call(t)},isNumber:function(t){return!isNaN(parseFloat(t))&&isFinite(t)},getSvg:function(t){var e,o;if(this.isElement(t))e=t;else{if(!("string"==typeof t||t instanceof String))throw new Error("Provided selector is not an HTML object nor String");if(e=document.querySelector(t),!e)throw new Error("Provided selector did not find any elements. Selector: "+t)}if("svg"===e.tagName.toLowerCase())o=e;else if("object"===e.tagName.toLowerCase())o=e.contentDocument.documentElement;else{if("embed"!==e.tagName.toLowerCase())throw"img"===e.tagName.toLowerCase()?new Error('Cannot script an SVG in an "img" element. Please use an "object" element or an in-line SVG.'):new Error("Cannot get SVG.");o=e.getSVGDocument().documentElement}return o},proxy:function(t,e){return function(){return t.apply(e,arguments)}},getType:function(t){return Object.prototype.toString.apply(t).replace(/^\[object\s/,"").replace(/\]$/,"")},mouseAndTouchNormalize:function(t,e){if(void 0===t.clientX||null===t.clientX)if(t.clientX=0,t.clientY=0,void 0!==t.touches&&t.touches.length){if(void 0!==t.touches[0].clientX)t.clientX=t.touches[0].clientX,t.clientY=t.touches[0].clientY;else if(void 0!==t.touches[0].pageX){var o=e.getBoundingClientRect();t.clientX=t.touches[0].pageX-o.left,t.clientY=t.touches[0].pageY-o.top}}else void 0!==t.originalEvent&&void 0!==t.originalEvent.clientX&&(t.clientX=t.originalEvent.clientX,t.clientY=t.originalEvent.clientY)},isDblClick:function(t,e){if(2===t.detail)return!0;if(void 0!==e&&null!==e){var o=t.timeStamp-e.timeStamp,n=Math.sqrt(Math.pow(t.clientX-e.clientX,2)+Math.pow(t.clientY-e.clientY,2));return o<250&&n<10}return!1},now:Date.now||function(){return(new Date).getTime()},throttle:function(t,e,o){var n,i,s,r=this,a=null,l=0;o||(o={});var u=function(){l=o.leading===!1?0:r.now(),a=null,s=t.apply(n,i),a||(n=i=null)};return function(){var h=r.now();l||o.leading!==!1||(l=h);var c=e-(h-l);return n=this,i=arguments,c<=0||c>e?(clearTimeout(a),a=null,l=h,s=t.apply(n,i),a||(n=i=null)):a||o.trailing===!1||(a=setTimeout(u,c)),s}},createRequestAnimationFrame:function(t){var e=null;return"auto"!==t&&t<60&&t>1&&(e=Math.floor(1e3/t)),null===e?window.requestAnimationFrame||n(33):n(e)}}},{}]},{},[1]);