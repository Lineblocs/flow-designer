var ORIENTATION_VERTICAL = "vertical";
var ORIENTATION_HORIZONTAL = "horizontal";


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
  console.log("change label called", arguments);
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
var version = "v1";
if (href1 || href2) {
  var baseUrl = "https://" + DEPLOYMENT_DOMAIN + "/api/" + version
  isLocal = true;
} else {
  //var baseUrl = "/api";
  var baseUrl = "https://" + DEPLOYMENT_DOMAIN + "/api/" + version;
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
  .service('ThemeService', function($window) {
    this.setTheme = function(theme) {
      $window.localStorage.setItem('THEME', theme);
    };
    this.getTheme = function() {
      return $window.localStorage.getItem('THEME') || 'default';
    };
  
    this.addStyle = function(path) {
      if (!path) return;
      var link = document.createElement('link');
      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('type', 'text/css');
      link.setAttribute('href', path);
      document.head.appendChild(link);
    }
  
    this.removeStyle = function(selectedPath) {
      const allLinks = ['styles.css', 'styles.dark.css']
      const links = document.head.querySelectorAll('link[href]');
      for (var i = 0; i < links.length; i++) {
        const path = links[i].getAttribute('href');
        if (!allLinks.includes(path)) continue;
        if (path === selectedPath) continue;
        document.head.removeChild(links[i]);
      }
    }
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
  .factory("$shared", function ($mdDialog, $mdSidenav, $log, $const, $http, $timeout, $q, $mdToast, $window) {
    var factory = this;
    factory.models = [];
    factory.trash = [];
    factory.selectorContext = 'AVAILABLE';
    factory.orientation = ORIENTATION_VERTICAL;
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
    factory.getAppResource = function(path) {

    }
    factory.loadExtensions = function () {
      var url = createUrl("/extension/list");
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
      var url = createUrl("/function/list");
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
      var url = createUrl("/widgetTemplate/list");
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
        var url = createUrl("/widgetTemplate");
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

    function switchToHorizontal() {
      var graph = diagram['graph'];
      var cells = graph.getCells();
      angular.forEach(cells, function (cell) {
        console.log("updating cell ", cell);

        cell.attr({
          '.inPorts': {
          }
        });
      });
    }
    function switchToVertical() {

    }
    function recreateLinks(links) {
      var graph = diagram['graph'];
      angular.forEach( links, function( data ) {
        console.log("recreating link ", data );
        var link = new joint.shapes.devs.FlowLink({
          source: {
            id: data.source.id,
            port: data.source.port,
          },
          target: {
            id: data.target.id,
            port: data.target.port
          },
          attrs: {
            ".connection": {
              "stroke-width": 2
            }
          },
          connector: GRAPH_CONNECTOR,
          router: GRAPH_ROUTER,
        });
      // Assume graph has the srcModel and dstModel with in and out ports.
      graph.addCell(link)
      });
    }
    $scope.changeOrientation = function () {
      console.log("changing orientation");
      var graph = diagram['graph'];
      var data = graph.toJSON();
      if ( $shared.orientation === ORIENTATION_VERTICAL ) {
        $shared.orientation = ORIENTATION_HORIZONTAL;
        defaultPorts = horizontalPorts;
        redeclareGraphModels();
        graph.clear();
        var newCells = [];
        var links = [];
        angular.forEach( data['cells'], function( cell ) {
          if ( !cell ) {
            return;
          }
          if ( cell.type === 'devs.FlowLink' ) {
            links.push( cell );
            return;
          }
          cell['ports']['groups']['in']['position'] = 'left';
          cell['ports']['groups']['in']['label']['position']['args']['x'] = -20;
          //cell['ports']['groups']['in']['label']['position']['args']['y'] = 0;
          cell['ports']['groups']['in']['attrs']['.port-body']['ref-x'] = 0;
          cell['ports']['groups']['out']['position'] = 'right';
          newCells.push( cell );
        } );
        var newData = angular.copy( data );
        newData.cells = newCells;
        graph.fromJSON( newData );
        recreateLinks( links );
      } else if ( $shared.orientation === ORIENTATION_HORIZONTAL ) {
        $shared.orientation = ORIENTATION_VERTICAL;
        defaultPorts = verticalPorts;
        redeclareGraphModels();
        graph.clear();
        var newCells = [];
        var links = [];
        angular.forEach( data['cells'], function( cell ) {
          if ( !cell ) {
            return;
          }
          if ( cell.type === 'devs.FlowLink' ) {
            links.push( cell );
            return;
          }
          cell['ports']['groups']['in']['position'] = 'top';
          cell['ports']['groups']['in']['label']['position']['args']['x'] = -140;
          //cell['ports']['groups']['in']['label']['position']['args']['y'] = 0;
          cell['ports']['groups']['in']['attrs']['.port-body']['ref-x'] = -150;
          cell['ports']['groups']['out']['position'] = 'bottom';
          newCells.push( cell );
        } );
        var newData = angular.copy( data );
        newData.cells = newCells;
        graph.fromJSON( newData );
        recreateLinks( links );
      }
    }
    $scope.getOrientationIcon = function() {
      if ( $shared.orientation === ORIENTATION_VERTICAL ) {
        return "img/icons/change_orientation_horizontal.svg";
      } else if ( $shared.orientation === ORIENTATION_HORIZONTAL ) {
        return "img/icons/change_orientation_vertical.svg";
      }
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
        serverData['orientation'] = $shared.orientation;
        serverData['flow_json'] = JSON.stringify(params);
        $shared.isCreateLoading = true;
        $http.post(createUrl("/flow/" + flowId), serverData).then(function () {
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
  .controller('CreateCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, ThemeService, $location) {
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
      $http.post(createUrl("/flow"), data).then(function (res) {
        $shared.isCreateLoading = false;
        console.log("response arguments ", arguments);
        console.log("response headers ", res.headers('X-Flow-ID'));
        console.log("response body ", res.body);
        var id = res.headers('X-Flow-ID');
        var urlObj = URI(document.location.href);
        var query = urlObj.query(true);
        var token = query.auth;
        var search = $location.search();

        $http.get(createUrl("/getFlowPresets?templateId=" + data['template_id'])).then(function (res) {
          if ( !res.data.has_presets ) {
            var url = "/edit?flowId=" + id + "&auth=" + token + "&workspaceId=" + query.workspaceId;
            if (search.mode && search.mode === 'dark') url += "&mode=" + search.mode;
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
        console.log("flow templates are", res.data);
        if ($location.search().mode === 'dark') {
          ThemeService.addStyle('styles.dark.css');
          ThemeService.removeStyle('styles.dark.css');
        } else {
          ThemeService.addStyle('styles.css');
          ThemeService.removeStyle('styles.css');
        }
        var templates = res.data.data;
        $scope.templates = templates;
        var templatesByCategory = [{
          "name": "Simple Flows", 
          "templates": []
        }];
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
  })
  .controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, $timeout, $q, $window, ThemeService, $interval) {
    $scope.$shared = $shared;
    $scope.$const = $const;
    var graph;
    var previousSave;
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
    $scope.audioStreamDirections = [
      'in',
      'out',
      'both'
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
      $http.post(createUrl("/flow/" + $shared.flow.public_id), data).then(function (res) {
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

    function renderGraph(flow, templates) {
    }

    function autoSave(){
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
        serverData['orientation'] = $shared.orientation;
        serverData['flow_json'] = JSON.stringify(params);
        // $shared.isCreateLoading = true;
        $http.post(createUrl("/flow/" + flowId), serverData).then(function () {
          // $shared.isCreateLoading = false;
          stateActions.lastSave = Date.now();
          getFlowData();
        }, function (err) {
          // $shared.isCreateLoading = false;
          alert("An error occured", err);
        });
      }
    }
    
    function getFlowData(){
      // var dateTime = $window.localStorage.getItem('LASTSAVE') || 'default';
      // const date1 = new Date(dateTime);
      // const date2 = new Date();
      // const diffTime = Math.abs(date2 - date1);
      // if(diffTime <= 30000){
      //   save();
      //   // returnwait.then(function(result){
          
      //   // })
      // }else{
      //   fetchFlowData();
      // }

      var search = $location.search();
      $http.get(createUrl("/flow/" + search.flowId)).then(function (res) {
        if(res.data.flow_json){
          var data = JSON.parse(res.data.flow_json);
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
        }
      });
    }

    $scope.getAccountSetting = function(){
      $http.get(createUrl("/self")).then(function (res) {
        if(res){
          $scope.isChecked = res.auto_save_flows;
          if(res.auto_save_flows === true){
            $interval(getFlowData, 30000);
          }
        }
      }, function (err) {
        console.error(err);
      });
    }

    $scope.changeautosave = function(event){
      $http.post(createUrl("/updateSelf"), {"auto_save_flows": event}).then(function (res) {
        if(res){
          getAccountSetting();
        }
      }, function (err) {
        console.error(err);
      });
    }
    $scope.$on('grapshChangesBroadcast', function(event, data) {
      // setTimeout(autoSave, 10000)
      autoSave()
    });

    function load() {
      
      var search = $location.search();
      if (search.mode === 'dark') {
        ThemeService.addStyle('styles.dark.css');
        ThemeService.removeStyle('styles.dark.css');
      } else {
        ThemeService.addStyle('styles.css');
        ThemeService.removeStyle('styles.css');
      }
      $shared.flow = {
        "started": true
      };
      $shared.isLoading = true;
      var url = createUrl("/extension/list");
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
          // var graph;
          if (search.flowId) {
            $q.all([
              $http.get(createUrl("/flow/" + search.flowId)),
              $http.get(createUrl("/flow/listTemplates")),
              $http.get(createUrl("/self"))
            ]).then(function (res) {
              console.log("flow templates are ", res[1].data);
              $scope.templates = res[1].data.data;
              $scope.isChecked = res[2].data.auto_save_flows;
              if($scope.isChecked === true){
                $interval(getFlowData, 30000);
              }
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
                if ( $shared.flow.orientation !== ORIENTATION_VERTICAL ) {
                  defaultPorts = horizontalPorts;
                  redeclareGraphModels();
                }
                $shared.orientation = $shared.flow.orientation;

                if (res[0].data.flow_json) {
                  var data = JSON.parse(res[0].data.flow_json);
                  previousSave = res[0].data.flow_json;
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
          // $interval(getFlowData, 30000);
        }, 0);
      });
    }
    $scope.load = load;
    load();
    //$mdSidenav('rightWidgets').open();
  })
  .controller('AdjustCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, $timeout, $q, $mdDialog) {
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

  })
  .controller('PaperCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http, $mdDialog) {
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
        var url = createUrl("/function");
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
        var url = createUrl("/function");
        return $q(function (resolve, reject) {
          if (!$scope.params['title']) {
            saveNewFunction().then(function () {
              onSave($scope.params);
            });
            return;
          }
          var data = angular.copy($scope.params);
          data['code'] = editor.getValue();
          var url = createUrl("/function/" + $scope.params['public_id']);
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
