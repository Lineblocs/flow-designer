
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

// NODE - Label pole
function changeLabel(cell, text, refY) {
  console.log("change label called ", arguments);
  refY = refY || labelRefY;
  cell.attr('.label', {
    text: text,
    // fill: '#FFFFFF', // def value
    fill: '#385374',
    'font-size': '18',
    'ref-y': refY
  });
  labelAlign();
}

// NODe- Description pole
function changeDescription(cell, text, refY) {
  refY = refY || descriptionRefY;
  refX = .5;
  cell.attr('.description', {
    text: text,
    // fill: '#FFFFFF', // def value
    fill: '#385374',
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
  var baseUrl = "https://lineblocs.com/api";
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
            "stroke-width": 2
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
        labelAlign("#stencil #v-8");
      }, 0);
    }
    factory.openAvailable = function () {
      console.log("openAvailable");
      angular.element("#stencilLibrary").hide();
      angular.element("#stencil").show();
      factory.selectorContext = 'AVAILABLE';
      $timeout(function() {
        labelAlign("#stencil #v-8");
      }, 0);

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
      'Follow Me',
      'Merge Calls'
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
          },

        },
      };
      console.log("adding port ", port);
      cellModel.cell.addPort(port);
      var link = new Link(cellModel, null, label, type, null, null, null);
      link.ports.push(port);
      cellModel.links.push(link);
    }

    $scope.nextName = function(cell, custom) {
      custom = custom || false;
       var name = cell.attributes.name;
       var type = cell.attributes.type;
       var customType = cell.attributes.customType;
        var graph = diagram['graph'];
        var cells = graph.getCells();
        var count = 0;
        for (var index in cells) {
          var target = cells[index];
          if ( custom ) {
            if (target.attributes.customType === customType && target !== cell) {
              count += 1;
            }
          } else {
            if (target.attributes.type === type && target !== cell) {
              count += 1;
            }


          }
        }
        if (count > 0) {
          name += " (" + count + ")";
        }
        return name;
      }

    $scope.createModel = function (cell, name, links, data) {
      console.log("creating model for cell ", cell);
      links = links || [];

      /*
      if (cell.attributes.type === 'devs.SwitchModel') {
        $scope.addLink("No Condition Matches", $const.LINK_NO_CONDITION_MATCHES, model);
      }
      */

      if (typeof name === 'undefined') {
        var name = $scope.nextName( cell );
      }
      var model = new Model(cell, name, links, data);
      changeLabel(cell, name);
      $shared.models.push(model);
      return model;
    }
    $scope.isOpenRight = function () {
      return $mdSidenav('right').isOpen();
    };
    $scope.createLibraryModel = function (cell, pickerCell) {
      console.log("createLibraryModel ", arguments);
      console.log("createLibraryModel ", $shared.widgetTemplates);
      var model = $scope.createModel(cell);
      var name = $scope.nextName( pickerCell, true /* custom */ );
      console.log("library name is ", name);
      model.name = name;
      changeLabel(cell, name);
      /*
      for (var index in $shared.widgetTemplates) {
        var item = $shared.widgetTemplates[ index ];
        if ( item.title === find ) {
          model.data = item.data.saved;
        }
      }
      */
     model.data = pickerCell.attributes.data;
     model.data = pickerCell.attributes.data;
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
      console.log("changed cellView to ", $shared.cellView);
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

                labelAlign();

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
var ICON_PHONE = `<path 
        id="icon-phone" 
        class="node_icon" 
        fill="none" stroke="#36D576"  stroke-miterlimit="10"
        transform="matrix(1 0 0 1 160 43)"
        d="M18.4-3.5L22-7.1l-4.8-4.8L15-9.7L6.7-18l2.2-2.2L4.1-25l-3.6,3.6C2.7-12.8,9.7-5.8,18.4-3.5z"/>`;
        
var ICON_DIAL = `
      <g transform="matrix(1 0 0 1 80 18)" class="node_icon">
        <path  id="phone" d="M19.37865,22.09712l2.6162-2.61147a1.03808,1.03808,0,0,0,0-1.47l-3.50592-3.49958a1.04261,1.04261,0,0,0-1.4726,0l-.84061.83908a1.04262,1.04262,0,0,1-1.4726,0L7.57642,8.24139a1.03808,1.03808,0,0,1,0-1.47l.8406-.83908a1.03808,1.03808,0,0,0,0-1.46995L4.9111.96283a1.04264,1.04264,0,0,0-1.47261,0L.81079,3.58577A1.04352,1.04352,0,0,0,.53732,4.60121,26.50658,26.50658,0,0,0,18.33706,22.36566,1.05438,1.05438,0,0,0,19.37865,22.09712Z" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
        <g>
          <g>
            <path d="M13.75249,2.793a6.87439,6.87439,0,0,1,6.57066,6.54046" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
            <path d="M22.61316,9.20509c-.013-.2258-.02421-.45147-.054-.67933A9.23719,9.23719,0,0,0,13.87031.5" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
            <path d="M20.32315,9.33341a6.98533,6.98533,0,0,0-.11265-.95371" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
            <path d="M13.63759,5.03087a4.60779,4.60779,0,0,1,4.43932,4.42847" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
            <path d="M13.53326,7.06305A2.64992,2.64992,0,0,1,16.06457,9.5721" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
            <path d="M18.07691,9.45934a4.60779,4.60779,0,0,0-4.43932-4.42847" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
            <path d="M16.06457,9.5721a2.64992,2.64992,0,0,0-2.53131-2.50905" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
          </g>
          <circle cx="13.39426" cy="9.72193" r="0.5" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-linejoin: round"/>
        </g>
      </g>
`;
var ICON_SWITCH = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon">
    <g id="Layer_2-2" data-name="Layer 2">
      <path d="M5.38034,21.95137a.93414.93414,0,0,1-1.36929,0L.78425,18.55294a1.02789,1.02789,0,0,1,.68466-1.74046H3.082V14.31527a.5229.5229,0,0,1,.15379-.37269l3.04977-2.99724,2.30533,2.2656L6.3094,15.4531v1.35938H7.92235A1.02788,1.02788,0,0,1,8.607,18.55294Zm7.384-20.94161V4.57812L10.48285,6.82028l2.30532,2.26561L15.838,6.08864a.52272.52272,0,0,0,.15379-.37268V1.00976A.49747.49747,0,0,0,15.50762.5H13.24841A.49746.49746,0,0,0,12.76429,1.00976Zm0,15.80272H11.15121a1.02791,1.02791,0,0,0-.68466,1.74046l3.2268,3.39843a.93414.93414,0,0,0,1.36929,0l3.22668-3.39843a1.02786,1.02786,0,0,0-.68463-1.74046h-1.613V14.31527a.523.523,0,0,0-.15379-.37269L6.3094,4.57812V1.00976A.49747.49747,0,0,0,5.82528.5H3.56607a.49746.49746,0,0,0-.48412.50976V5.716a.5229.5229,0,0,0,.15379.37268l9.52855,9.36446Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
    </g>
  </g>
`;

var ICON_SET = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <path d="M14.77637,12.375H10.01758a1.18876,1.18876,0,0,0-1.1897,1.1875v4.75A1.18876,1.18876,0,0,0,10.01758,19.5h4.75879a1.18875,1.18875,0,0,0,1.1897-1.1875v-4.75A1.18875,1.18875,0,0,0,14.77637,12.375ZM7.63819,1.6875A1.18875,1.18875,0,0,0,6.44849.5H1.6897A1.18875,1.18875,0,0,0,.5,1.6875v4.75A1.18875,1.18875,0,0,0,1.6897,7.625H5.24838l2.72,4.75148a2.37224,2.37224,0,0,1,2.04925-1.189H10.028L7.63819,7.01307V5.25h8.32788V2.875H7.63819ZM23.10426.5H18.34547a1.18875,1.18875,0,0,0-1.1897,1.1875v4.75a1.18875,1.18875,0,0,0,1.1897,1.1875h4.75879A1.18876,1.18876,0,0,0,24.294,6.4375v-4.75A1.18876,1.18876,0,0,0,23.10426.5Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
    </g>
  </g>
`;

var ICON_BRIDGE = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <g>
        <path d="M9.09617,10.437h-.265a4.973,4.973,0,0,1-4.37753,0h-.265a3.81288,3.81288,0,0,0-1.10241.16923A3.65678,3.65678,0,0,0,.5,14.10643v.92014a1.53618,1.53618,0,0,0,1.5369,1.5333h6.455a6.37337,6.37337,0,0,1,2.89394-5.298v-.02117A3.61091,3.61091,0,0,0,9.09617,10.437Zm.45571-4.40964a4.02221,4.02221,0,0,1,.34988-1.63916A3.535,3.535,0,0,0,6.64759,2.26264,3.57431,3.57431,0,1,0,9.58371,7.86737a3.4701,3.4701,0,0,1-.03183-.476Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <path d="M2.96686,3.5149H3.061a0,0,0,0,1,0,0v4.376a0,0,0,0,1,0,0H2.96686A1.57057,1.57057,0,0,1,1.39629,6.32034V5.08547A1.57057,1.57057,0,0,1,2.96686,3.5149Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <path d="M3.061,3.54192S2.87656.5,6.64292.5,10.224,3.51687,10.224,3.51687c0,.02117-.16976.53427-.16976.53427" style="fill: none;stroke: #36d576;stroke-linecap: round;stroke-miterlimit: 10"/>
        <path d="M3.00555,8.31853S2.3546,12.5321,5.33,12.5321" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="5.19047" y="12.32379" width="1.98844" height="0.89879" rx="0.42497" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <g>
          <path d="M17.84825,11.07976a4.21013,4.21013,0,1,0-4.22-4.21011A4.21293,4.21293,0,0,0,17.84825,11.07976Zm2.8937,1.2029h-.31273a5.8386,5.8386,0,0,1-5.16194,0h-.31274a4.33661,4.33661,0,0,0-4.34055,4.3304v1.0826A1.80691,1.80691,0,0,0,12.42255,19.5H23.274a1.80692,1.80692,0,0,0,1.80856-1.80434v-1.0826A4.33661,4.33661,0,0,0,20.742,12.28266Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M13.45562,4.132h.17264a0,0,0,0,1,0,0V9.28754a0,0,0,0,1,0,0h-.17264a1.78869,1.78869,0,0,1-1.78869-1.78869V5.92064A1.78869,1.78869,0,0,1,13.45562,4.132Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M23.85692,4.132h.17264a0,0,0,0,1,0,0V9.28754a0,0,0,0,1,0,0h-.17264a1.78869,1.78869,0,0,1-1.78869-1.78869V5.92064A1.78869,1.78869,0,0,1,23.85692,4.132Z" transform="translate(46.0978 13.4195) rotate(180)" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M13.62826,4.16379S13.41092.58,17.84825.58s4.22,3.58384,4.22,3.58384" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M13.56288,9.79134s-.76691,4.96423,2.73849,4.96423" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <rect x="16.13705" y="14.51014" width="2.34268" height="1.05891" rx="0.50067" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        </g>
      </g>
    </g>
  </g>
`;

var ICON_RECORD = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <path d="M14.73148,8.65625h-.67769a.67851.67851,0,0,0-.67769.67969V11.375a5.434,5.434,0,0,1-5.96324,5.41116,5.59727,5.59727,0,0,1-4.87979-5.6533V9.33594a.67851.67851,0,0,0-.67769-.67969H1.17769A.67851.67851,0,0,0,.5,9.33594v1.706a7.70423,7.70423,0,0,0,6.438,7.71828v1.45071H4.56614a.6785.6785,0,0,0-.67769.67969v.67968a.6785.6785,0,0,0,.67769.67969H11.343a.6785.6785,0,0,0,.67769-.67969v-.67968a.6785.6785,0,0,0-.67769-.67969H8.97112V18.77637a7.47653,7.47653,0,0,0,6.438-7.40137V9.33594A.67851.67851,0,0,0,14.73148,8.65625Zm-6.7769,6.79688A4.07211,4.07211,0,0,0,12.02072,11.375H8.40652c-.24948,0-.45194-.15208-.45194-.33984v-.67969c0-.18776.20246-.33984.45194-.33984h3.6142V8.65625H8.40652c-.24948,0-.45194-.15208-.45194-.33984V7.63672c0-.18776.20246-.33984.45194-.33984h3.6142V5.9375H8.40652c-.24948,0-.45194-.15208-.45194-.33984V4.918c0-.18776.20246-.33984.45194-.33984h3.6142a4.06615,4.06615,0,1,0-8.13227,0V11.375A4.07211,4.07211,0,0,0,7.95458,15.45313Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
    </g>
  </g>
`;

var ICON_CONF = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <g>
        <g>
          <path d="M28.25774,9.39613A3.00157,3.00157,0,1,0,25.25618,12.392,2.99721,2.99721,0,0,0,28.25774,9.39613Zm-8.14709,6.9333v.77036a1.2855,1.2855,0,0,0,1.28638,1.284h7.7183a1.2855,1.2855,0,0,0,1.28638-1.284v-.77036A3.08519,3.08519,0,0,0,27.31439,13.248H27.092a4.15119,4.15119,0,0,1-3.67156,0H23.198A3.08519,3.08519,0,0,0,20.11065,16.32943Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M29.42115,7.448h.23163a0,0,0,0,1,0,0v3.66865a0,0,0,0,1,0,0h-.23163a1.1634,1.1634,0,0,1-1.1634-1.1634V8.61143A1.1634,1.1634,0,0,1,29.42115,7.448Z" transform="translate(57.91052 18.5647) rotate(-180)" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M22.023,7.448h.23163a0,0,0,0,1,0,0v3.66865a0,0,0,0,1,0,0H22.023a1.1634,1.1634,0,0,1-1.1634-1.1634V8.61143A1.1634,1.1634,0,0,1,22.023,7.448Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M28.25774,7.47068s.15459-2.55022-3.00156-2.55022-3.00156,2.55022-3.00156,2.55022" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M28.30425,11.47517s.54548,3.53248-1.94782,3.53248" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <rect x="24.80703" y="14.83302" width="1.66628" height="0.75351" rx="0.31406" transform="translate(51.28034 30.41954) rotate(-180)" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        </g>
        <g>
          <path d="M5.87932,8.311A3.132,3.132,0,1,0,2.74138,5.179,3.13338,3.13338,0,0,0,5.87932,8.311ZM8.031,9.20586H7.7985a4.33983,4.33983,0,0,1-3.83837,0H3.72759A3.22537,3.22537,0,0,0,.5,12.42733v.80536A1.3439,1.3439,0,0,0,1.84483,14.575h8.069a1.3439,1.3439,0,0,0,1.34483-1.34228v-.80536A3.22537,3.22537,0,0,0,8.031,9.20586Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M2.43169,3.1424h.3097a0,0,0,0,1,0,0V6.97774a0,0,0,0,1,0,0h-.3097A1.14872,1.14872,0,0,1,1.283,5.829V4.29113A1.14872,1.14872,0,0,1,2.43169,3.1424Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M10.166,3.1424h.3097a0,0,0,0,1,0,0V6.97774a0,0,0,0,1,0,0H10.166A1.14872,1.14872,0,0,1,9.01725,5.829V4.29113A1.14872,1.14872,0,0,1,10.166,3.1424Z" transform="translate(19.49292 10.12014) rotate(180)" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M2.74138,3.16609S2.57977.5,5.87932.5,9.01725,3.16609,9.01725,3.16609" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M2.69276,7.35252s-.57026,3.693,2.03631,3.693" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <rect x="4.60689" y="10.86293" width="1.74199" height="0.78774" rx="0.31023" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        </g>
        <g>
          <path d="M16.19276,13.79753A4.15884,4.15884,0,1,0,12.026,9.6387,4.16069,4.16069,0,0,0,16.19276,13.79753ZM19.05,14.98577h-.30879a5.7626,5.7626,0,0,1-5.09681,0h-.30878a4.28284,4.28284,0,0,0-4.28579,4.27766v1.06941a1.78452,1.78452,0,0,0,1.78575,1.78236H21.55a1.78451,1.78451,0,0,0,1.78574-1.78236V19.26343A4.28283,4.28283,0,0,0,19.05,14.98577Z" style="fill: #fff;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M11.87813,6.93436H12.026a0,0,0,0,1,0,0v5.09278a0,0,0,0,1,0,0h-.14789a1.78869,1.78869,0,0,1-1.78869-1.78869V8.723A1.78869,1.78869,0,0,1,11.87813,6.93436Z" style="fill: #fff;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M22.14818,6.93436h.14789a0,0,0,0,1,0,0v5.09278a0,0,0,0,1,0,0h-.14789a1.78869,1.78869,0,0,1-1.78869-1.78869V8.723A1.78869,1.78869,0,0,1,22.14818,6.93436Z" transform="translate(42.65556 18.96151) rotate(180)" style="fill: #fff;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M12.026,6.96581s-.2146-3.54019,4.16674-3.54019,4.16673,3.54019,4.16673,3.54019" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <path d="M11.96146,12.52481s-.75723,4.90375,2.70394,4.90375" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
          <rect x="14.50315" y="17.18613" width="2.31311" height="1.04601" rx="0.50067" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        </g>
      </g>
    </g>
  </g>
`;

var ICON_WAIT = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <path d="M15.75176.5H1.51678A1.01815,1.01815,0,0,0,.5,1.51953v.67969A1.01815,1.01815,0,0,0,1.51678,3.21875c0,3.86424,2.16135,7.12542,5.1196,8.15625-2.95825,1.03083-5.1196,4.292-5.1196,8.15625A1.01815,1.01815,0,0,0,.5,20.55078v.67969A1.01815,1.01815,0,0,0,1.51678,22.25h14.235a1.01815,1.01815,0,0,0,1.01678-1.01953v-.67969a1.01815,1.01815,0,0,0-1.01678-1.01953c0-3.86424-2.16134-7.12542-5.11959-8.15625,2.95825-1.03083,5.11959-4.292,5.11959-8.15625a1.01815,1.01815,0,0,0,1.01678-1.01953V1.51953A1.01815,1.01815,0,0,0,15.75176.5ZM12.571,16.8125H4.69762c.72272-1.988,2.2071-3.39844,3.93665-3.39844S11.84824,14.82424,12.571,16.8125Zm.0008-10.875H4.69754a7.98908,7.98908,0,0,1-.46933-2.71875h8.81213A7.9901,7.9901,0,0,1,12.57181,5.9375Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
    </g>
  </g>
`;

var ICON_MACRO = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <path d="M9.98152,10.20967a.59564.59564,0,0,0,.84134,0L11.24334,9.79a.593.593,0,0,0,0-.83978L9.91534,7.625,11.243,6.29945a.593.593,0,0,0,0-.83978L10.82249,5.04a.59564.59564,0,0,0-.84134,0l-2.169,2.165a.593.593,0,0,0,0,.83979ZM13.551,9.79033l.42048.41971a.59564.59564,0,0,0,.84134,0l2.169-2.165a.593.593,0,0,0,0-.83979l-2.169-2.165a.59564.59564,0,0,0-.84134,0L13.551,5.46a.593.593,0,0,0,0,.83978L14.87861,7.625,13.551,8.95055a.593.593,0,0,0,0,.83978ZM23.69911,15.9375H14.68492a1.171,1.171,0,0,1-1.21721,1.1875H11.20728A1.26133,1.26133,0,0,1,9.989,15.9375H1.09485A.596.596,0,0,0,.5,16.53125V17.125A2.38419,2.38419,0,0,0,2.8794,19.5H21.91456a2.38419,2.38419,0,0,0,2.3794-2.375v-.59375A.59605.59605,0,0,0,23.69911,15.9375ZM21.91456,2.28125A1.78814,1.78814,0,0,0,20.13.5H4.66394A1.78814,1.78814,0,0,0,2.8794,2.28125V14.75H21.91456ZM19.53516,12.375H5.25879v-9.5H19.53516Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
    </g>
  </g>
`;

var ICON_INPUT = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <g>
        <rect x="0.5" y="0.5" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="7.75081" y="0.5" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="15.00162" y="0.5" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="0.5" y="6.34701" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="7.75081" y="6.34701" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="15.00162" y="6.34701" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="0.5" y="12.19403" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="7.75081" y="12.19403" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="15.00162" y="12.19403" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="0.5" y="18.04104" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="7.75081" y="18.04104" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <rect x="15.00162" y="18.04104" width="6.01507" height="4.20896" rx="1" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <path d="M3.81432,3.36625H3.38705V1.99734l-.41969.12383V1.79548l.80819-.28158h.03877Z" style="fill: #36d576"/>
        <path d="M11.40578,3.36625H10.12144V3.08636l.5916-.62593a.71443.71443,0,0,0,.21827-.39863.28342.28342,0,0,0-.0514-.1815.19994.19994,0,0,0-.30845.0212.34251.34251,0,0,0-.06068.2078h-.42811a.60976.60976,0,0,1,.08512-.31467.6.6,0,0,1,.23512-.22645.70444.70444,0,0,1,.33626-.08143.68281.68281,0,0,1,.4593.1391.49657.49657,0,0,1,.1618.39863.6.6,0,0,1-.04045.21289.95333.95333,0,0,1-.12641.21712,3.0703,3.0703,0,0,1-.27474.30449l-.23765.27649h.72476Z" style="fill: #36d576"/>
        <path d="M17.76178,2.26027h.20057a.20962.20962,0,0,0,.23934-.23494.20334.20334,0,0,0-.05731-.14928.21386.21386,0,0,0-.16012-.05852.2285.2285,0,0,0-.14748.05.15159.15159,0,0,0-.0632.123H17.348a.44145.44145,0,0,1,.0809-.26038.54067.54067,0,0,1,.22417-.179.77161.77161,0,0,1,.316-.06446.74951.74951,0,0,1,.482.14165.47126.47126,0,0,1,.17614.3876.39675.39675,0,0,1-.07248.22645.52964.52964,0,0,1-.21153.17218.49931.49931,0,0,1,.22923.162.42978.42978,0,0,1,.08428.26887.47761.47761,0,0,1-.19047.39693.77782.77782,0,0,1-.49722.14928.80672.80672,0,0,1-.33625-.06955.52754.52754,0,0,1-.23429-.19168.50324.50324,0,0,1-.08006-.27989h.429a.191.191,0,0,0,.06826.14757.2363.2363,0,0,0,.16855.06277.25252.25252,0,0,0,.17867-.06277.21259.21259,0,0,0,.06742-.16114.24973.24973,0,0,0-.06911-.19847A.29244.29244,0,0,0,17.96909,2.58h-.20731Z" style="fill: #36d576"/>
        <path d="M3.99551,8.48907H4.1826v.33077H3.99551v.39354H3.56992V8.81984H2.8578l-.02528-.26123.7374-1.19419V7.361h.42559Zm-.75679,0h.3312v-.57l-.02612.0441Z" style="fill: #36d576"/>
        <path d="M10.14672,8.30841,10.2588,7.361H11.335v.33332h-.72982l-.04214.3681a.51052.51052,0,0,1,.11967-.0475.548.548,0,0,1,.145-.02035.53578.53578,0,0,1,.42137.16369.74772.74772,0,0,1,.06826.78114.53773.53773,0,0,1-.22164.22137.68807.68807,0,0,1-.3371.078.74251.74251,0,0,1-.3253-.07209A.583.583,0,0,1,10.1956,8.97a.47438.47438,0,0,1-.08428-.28244h.42643a.24578.24578,0,0,0,.06489.16115.20378.20378,0,0,0,.15254.05937c.14327,0,.21574-.10687.21574-.31975,0-.19762-.08848-.296-.26293-.296a.25934.25934,0,0,0-.22249.09668Z" style="fill: #36d576"/>
        <path d="M18.40058,7.33389v.33756H18.382a.63553.63553,0,0,0-.39272.11535.48662.48662,0,0,0-.18878.31975.49648.49648,0,0,1,.36407-.14249.46539.46539,0,0,1,.38092.17557.716.716,0,0,1,.14158.46054.64937.64937,0,0,1-.08343.32484.59388.59388,0,0,1-.23091.2307.66765.66765,0,0,1-.32951.08312.68114.68114,0,0,1-.35059-.08991.605.605,0,0,1-.23934-.25614.838.838,0,0,1-.08933-.38421V8.3364a1.07855,1.07855,0,0,1,.1222-.514.88642.88642,0,0,1,.34805-.35792.993.993,0,0,1,.50228-.13061Zm-.38429.95841a.25077.25077,0,0,0-.14158.039.26907.26907,0,0,0-.08428.09669v.12892q0,.35114.241.35113a.19373.19373,0,0,0,.16265-.08821.40634.40634,0,0,0-.00085-.44188A.21331.21331,0,0,0,18.01629,8.2923Z" style="fill: #36d576"/>
        <path d="M4.15057,13.43716l-.68768,1.62336h-.45l.68852-1.52158h-.8773v-.33078H4.15057Z" style="fill: #36d576"/>
        <path d="M11.362,13.70263a.43123.43123,0,0,1-.06574.23748.48822.48822,0,0,1-.18287.16539.5346.5346,0,0,1,.20816.17727.46253.46253,0,0,1,.07753.26631.48272.48272,0,0,1-.17024.39185.69842.69842,0,0,1-.46856.14418.71567.71567,0,0,1-.47194-.14418.48123.48123,0,0,1-.17361-.39185.46647.46647,0,0,1,.07585-.26292.51672.51672,0,0,1,.2149-.18066.48714.48714,0,0,1-.18456-.16539.42547.42547,0,0,1-.06742-.23748A.477.477,0,0,1,10.317,13.321a.76159.76159,0,0,1,.88236,0A.47636.47636,0,0,1,11.362,13.70263Zm-.39019.81253a.245.245,0,0,0-.059-.17642.2043.2043,0,0,0-.15422-.06106.20687.20687,0,0,0-.15591.06106.28591.28591,0,0,0,.00085.35114.20213.20213,0,0,0,.15675.06446.19712.19712,0,0,0,.15338-.06361A.25051.25051,0,0,0,10.97177,14.51516Zm-.2149-1.00421a.15736.15736,0,0,0-.13063.05683.246.246,0,0,0-.04466.1569.26428.26428,0,0,0,.0455.16115.15505.15505,0,0,0,.13316.06107.1509.1509,0,0,0,.13147-.06107.27577.27577,0,0,0,.04382-.16115.2436.2436,0,0,0-.04551-.156A.1584.1584,0,0,0,10.75687,13.511Z" style="fill: #36d576"/>
        <path d="M11.399,20.15025a.88476.88476,0,0,1-.16771.57844.65091.65091,0,0,1-.94724-.00169.88292.88292,0,0,1-.16771-.57675V19.811a.89112.89112,0,0,1,.16686-.57844.65092.65092,0,0,1,.94725.00169.888.888,0,0,1,.16855.57844Zm-.42643-.39354a.66742.66742,0,0,0-.05141-.29854.1736.1736,0,0,0-.16433-.09839.16968.16968,0,0,0-.16013.0916.64385.64385,0,0,0-.05393.27735V20.202a.67075.67075,0,0,0,.05225.30364.18716.18716,0,0,0,.3253.00254.65441.65441,0,0,0,.05225-.29346Z" style="fill: #36d576"/>
        <path d="M3.33688,20.21168l-.41211-.1145.08175-.24.40368.16624-.03119-.447h.26968l-.032.45631.391-.16285.08259.24257-.41716.1145.27727.33757-.21912.15012-.23091-.374-.2326.36132-.21911-.14419Z" style="fill: #36d576"/>
        <path d="M18.03061,20.386h-.20394l-.08428.52161h-.25113l.08427-.52161H17.2949V20.1528h.31855l.05563-.33587h-.279v-.23239H17.707l.08765-.52924h.24945l-.086.52924h.20394l.08765-.52924h.25114l-.08765.52924h.29243v.23239h-.32951l-.05562.33587h.28906V20.386h-.32783l-.08427.52161h-.25114Zm-.16517-.23324h.2031l.05562-.33587h-.2031Z" style="fill: #36d576"/>
        <path d="M18.2118,14.34468a.45046.45046,0,0,1-.30844.12383.49772.49772,0,0,1-.39778-.16963.67524.67524,0,0,1-.14664-.4563.6899.6899,0,0,1,.08259-.33078.6141.6141,0,0,1,.23092-.24087.6247.6247,0,0,1,.32783-.08991.61324.61324,0,0,1,.32951.09245.62331.62331,0,0,1,.22923.26123.89827.89827,0,0,1,.08427.38845v.16369a1.1278,1.1278,0,0,1-.11883.53264.83632.83632,0,0,1-.34131.346,1.05893,1.05893,0,0,1-.51576.12043h-.02612v-.3435l.0809-.00085C18.01544,14.7272,18.17809,14.59488,18.2118,14.34468Zm-.19383-.1849a.20689.20689,0,0,0,.19973-.12043v-.17811a.46674.46674,0,0,0-.05983-.26378.18571.18571,0,0,0-.16012-.08566.17713.17713,0,0,0-.15.09669.43372.43372,0,0,0-.06068.23409.38994.38994,0,0,0,.06152.23154A.19856.19856,0,0,0,18.018,14.15978Z" style="fill: #36d576"/>
      </g>
    </g>
  </g>
`;

var ICON_PLAYBACK = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <path d="M17.1818,11.0494,9.10922,6.14163a1.10279,1.10279,0,0,0-1.63745.96321v9.54032a1.10343,1.10343,0,0,0,1.63745.96321l8.07258-4.63256A1.10433,1.10433,0,0,0,17.1818,11.0494Zm6.0682.8256A11.375,11.375,0,1,0,11.875,23.25,11.373,11.373,0,0,0,23.25,11.875Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
    </g>
  </g>
`;

var ICON_SEND = `
  <g id="Layer_2" data-name="Layer 2" transform="matrix(1 0 0 1 80 18)" class="node_icon" >
    <g id="Layer_2-2" data-name="Layer 2">
      <g>
        <path d="M7.17831,13.85647v4.19665h4.1786V18.034h.00955V13.85647ZM21.66063,7.91031a10.50463,10.50463,0,0,0-6.85-6.87355A10.89958,10.89958,0,0,0,.5,11.37083H2.02633c.25761-3.07822,2.2994-4.57906,5.257-5.25788A6.59572,6.59572,0,0,1,12.53992,4.8224V2.81487a.88447.88447,0,0,1,1.45016-.64044l6.44935,5.29605a.81645.81645,0,0,1,0,1.27141l-2.46128,2.02679a6.66184,6.66184,0,0,1-6.61169,7.2653v.01914h-.00955V22.25A10.89373,10.89373,0,0,0,21.66063,7.91031ZM3.02812,15.34774H1.26328v2.70538H3.95352V16.52369A8.11857,8.11857,0,0,1,3.02812,15.34774Zm.9254,2.70538v3.22176H7.17831V18.05312Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
        <path d="M20.43943,8.74189l-2.46128,2.02679-3.98807,3.26937a.88144.88144,0,0,1-1.45016-.63086V10.33842c-5.68607.07643-8.12848,1.4244-6.46822,6.48157.18121.55442-.52477.99414-1.03044.64054a7.00406,7.00406,0,0,1-1.08774-.93684,8.11857,8.11857,0,0,1-.9254-1.17595,6.10649,6.10649,0,0,1-1.03976-3.25992,5.8499,5.8499,0,0,1,.038-.717c.25761-3.07822,2.2994-4.57906,5.257-5.25788a25.12483,25.12483,0,0,1,5.25656-.51615V2.81487a.88447.88447,0,0,1,1.45016-.64044l6.44935,5.29605A.81645.81645,0,0,1,20.43943,8.74189Z" style="fill: none;stroke: #36d576;stroke-miterlimit: 10"/>
      </g>
    </g>
  </g>
`;
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

var launchMarkup = `<defs>
	
		<style type="text/css">
			.shadow{filter:url(#call-shadow);}
			.st0{fill:#FFFFFF;}
			.st1{fill:#36D576;}
			.st2{fill:#385374;}
			.st3{font-family:'Roboto-Regular', Arial, Helvetica, sans-serif;}
			.st4{font-size:38.3335px;}
			.st5{font-size:14px;}
			.st6{fill:none;stroke:#385374;stroke-miterlimit:10;}
		</style>

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

	</defs>

	<g class="rotatable">

		<path 
			class="st0 shadow" 
			d="M319.5,3.5v94c0,1.7-1.3,3-3,3H3.5c-1.7,0-3-1.3-3-3v-94c0-1.7,1.3-3,3-3h313C318.2,0.5,319.5,1.8,319.5,3.5z"
			/>

		<g>
			<path 
				class="st1" 
				d="M86.8,25.2c-0.1-0.6-0.6-1.3-1.1-1.5c-3.3-1.2-6-1.5-8.7-1.8c-11-1.3-18.3,3.8-24.2,11.1l-11.1-1.4
				c-1.7-0.2-3.9,0.8-4.9,2.3l-6.6,10c-0.2,0.3-0.3,0.7-0.4,1.1c-0.2,1.4,0.8,2.7,2.2,2.9l11.1,1.3l-2.7,2.1
				c-1.4,1.1-1.8,3.3-0.6,4.9l4.8,6.1c1,1.4,3.3,1.8,4.8,0.6l2.7-2.1l-1.4,11.2c-0.2,1.4,0.8,2.7,2.2,2.9c0.4,0,0.8,0,1.2-0.1l11.2-4
				c1.7-0.6,3.2-2.5,3.4-4.3L70,55.3c8.3-4.1,15.1-10,16.4-21.1C86.8,31.4,87.1,28.7,86.8,25.2z M71.9,39.6c-2.4-0.3-4-2.5-3.7-4.8
				c0.3-2.4,2.4-4.1,4.8-3.8c2.4,0.3,4,2.4,3.7,4.8C76.4,38.2,74.3,39.9,71.9,39.6z"/>
			<path 
				class="st1" 
				d="M37.2,72.1c3.6-2.8,4.2-8.1,1.4-11.7c-2.8-3.6-8-4.2-11.5-1.4S14.8,79.3,14.8,79.3S33.7,74.9,37.2,72.1z"/>
		</g>

		<g id="call-user_71_">
			<text 
				transform="matrix(1 0 0 1 97.5311 52.6903)" 
				class="st2 st3 st4 label">
					Launch
			</text>
		</g>
		<g id="dial_55_">
			<text 
				transform="matrix(1 0 0 1 100.1079 76.2095)" 
				class="st2 st3 st5 description">
					The flow entrypoint
			</text>
		</g>

		<path 
			class="st1" 
			d="M319.5,57.2v40.3c0,1.7-1.3,3-3,3h-92.1c12.5-27.5,40.3-46.6,72.5-46.6C304.7,53.9,312.3,55,319.5,57.2z"/>
		<path 
			class="st6" 
			d="M319.5,3.5v94c0,1.7-1.3,3-3,3H3.5c-1.7,0-3-1.3-3-3v-94c0-1.7,1.3-3,3-3h313C318.2,0.5,319.5,1.8,319.5,3.5z"
			/>
	</g>`;





function createMarkup(icon) {
  console.log("creating markup ", icon);
  var icon = icon || ICON_PHONE;
  var defaultMarkup = `<g class="rotatable">

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

            ` + icon + `

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

      <script>
      {/* Autoposition FIX for label text pole and Icon position for center Node */}
      {/* GET all .label's in page */}
      document.addEventListener("DOMContentLoaded", ()=> {
      
          console.log("onLoad align")
          alignUpdate() 
      })
  
      function alignUpdate() {
  
        const allLabels = document.querySelectorAll("svg .label")
        const allIcons = document.querySelectorAll("svg .node_icon")
  
        let newStartTextPoint, labelTextWidth;
        let newStartIconPoint;
  
        // console.log("allLabels"); 
        // console.log(allLabels); 
        for (const label of allLabels) {
          labelTextWidth = label.textLength.baseVal.value;
          // console.dir(labelTextWidth);
          // node width = 320;  40 = icon width + margin right
          newStartTextPoint = 320/2 - labelTextWidth / 2 + 20;
          console.dir(newStartTextPoint);
  
          label.transform.baseVal[0].matrix.e = newStartTextPoint
        }
  
        console.log(allIcons);
        for (const icon of allIcons) {
          // node width = 320;  40 = icon width + margin right
          newStartIconPoint = newStartTextPoint - 40;
          console.dir(newStartIconPoint);
  
          icon.transform.baseVal[0].matrix.e = newStartIconPoint
        }
  
      }
      </script>

    </g>`;
    return defaultMarkup;
}


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

// NODE Label and Description CSS rules - see in file helpers.js
// in this block - CSS rules for Node block
function createLaunchAttrs(name, text) {
  var defaultAttrs = {
    '.label': {
          text: "Launch"
    },
		'.shadow': {filter:"url(#call-shadow)"},
		'.st0': {fill:"#FFFFFF"},
		'.st1': {fill:"#36D576"},
		'.st2': {fill:"#385374"},
		".st3": {"font-family":"'Roboto-Regular', Arial, Helvetica, sans-serif"},
		".st4": {"font-size":"38.3335px"},
		".st5": {"font-size":"14px;"},
		".st6": {fill:"none",stroke:"#385374",strokeMiterlimit:"10"},
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


  
  var defaultMarkup = `<g class="rotatable">

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
        class="node_icon" 
        fill="none" stroke="#36D576"  stroke-miterlimit="10"
        transform="matrix(1 0 0 1 160 43)"
				d="M18.4-3.5L22-7.1l-4.8-4.8L15-9.7L6.7-18l2.2-2.2L4.1-25l-3.6,3.6C2.7-12.8,9.7-5.8,18.4-3.5z"/>

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

      <script>
      {/* Autoposition FIX for label text pole and Icon position for center Node */}
      {/* GET all .label's in page */}
      document.addEventListener("DOMContentLoaded", ()=> {
      
          console.log("onLoad align")
          alignUpdate() 
      })
  
      function alignUpdate() {
  
        const allLabels = document.querySelectorAll("svg .label")
        const allIcons = document.querySelectorAll("svg .node_icon")
  
        let newStartTextPoint, labelTextWidth;
        let newStartIconPoint;
  
        // console.log("allLabels"); 
        // console.log(allLabels); 
        for (const label of allLabels) {
          labelTextWidth = label.textLength.baseVal.value;
          // console.dir(labelTextWidth);
          // node width = 320;  40 = icon width + margin right
          newStartTextPoint = 320/2 - labelTextWidth / 2 + 20;
          console.dir(newStartTextPoint);
  
          label.transform.baseVal[0].matrix.e = newStartTextPoint
        }
  
        console.log(allIcons);
        for (const icon of allIcons) {
          // node width = 320;  40 = icon width + margin right
          newStartIconPoint = newStartTextPoint - 40;
          console.dir(newStartIconPoint);
  
          icon.transform.baseVal[0].matrix.e = newStartIconPoint
        }
  
      }
      </script>

    </g>`;

  

// Launch NODE  
joint.shapes.devs.LaunchModel = joint.shapes.devs.Model.extend({

  markup: launchMarkup,

  defaults: joint.util.deepSupplement({
    name: "Launch",
    type: 'devs.LaunchModel',
    size: widgetDimens,
    attrs: createLaunchAttrs(),
    inPorts: [],
    outPorts: ['Incoming Call'],
    ports: defaultPorts

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.LaunchView = joint.shapes.devs.ModelView;


// Switch NODE
joint.shapes.devs.SwitchModel = joint.shapes.devs.Model.extend({

  markup: createMarkup(ICON_SWITCH),

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

  markup: createMarkup(ICON_DIAL),
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

  markup: createMarkup(ICON_BRIDGE),
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

  markup: createMarkup(ICON_INPUT),
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

  markup: createMarkup(ICON_RECORD),
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

  markup: createMarkup(ICON_PLAYBACK),
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

  markup: createMarkup(ICON_MACRO),
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

  markup: createMarkup(ICON_SET),
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

  markup: createMarkup(ICON_CONF),
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

  markup: createMarkup(ICON_SEND),
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

  markup: createMarkup(ICON_WAIT),
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

  markup: createMarkup(),
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