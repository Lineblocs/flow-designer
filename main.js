function Model(cell, name, links, data) {
  console.log("creating new model ", arguments);
  this.cell =cell;
  this.name = name;
  this.links = links || [];
  this.data = data || {};
  this.tempData = {};
  this.toJSON = function() {
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
    params['condition'] = this.condition;
    params['cell'] = this.cell;
    return params;
  }
}

function checkExpires(expiresIn) {
  return false;
}
function changeLabel(cell, text, refY)
{
  refY = refY || labelRefY;
  cell.attr('.label', {
        text: text,
        fill: '#FFFFFF',
        'font-size': '18',
        'ref-y': refY
      });
}
function changeDescription(cell, text, refY)
{
  refY = refY || descriptionRefY;
  refX= .5;
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
  if (model.cell.attributes.type==='devs.SwitchModel') {
    model.tempData.searchText = model.data.test;
    for (var index in model.links) {
      var link = model.links[ index ];
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
      .service('JWTHttpInterceptor', function() {
        return {
            // optional method
            'request': function(config) {
                try {                
                var urlObj = URI(document.location.href);
                var query = urlObj.query( true );


                  var token = query.auth;
                  var workspaceId = query.workspaceId;
                  if (token) {
                      config.headers['Authorization'] = "Bearer " + token;
                  }
                  if (workspaceId) {
                      config.headers['X-Workspace-ID'] = workspaceId;
                  }

                  console.log("request headers are ", config.headers);
                } catch (e) {
                }
                console.log("headers are ", config.headers);
                return config;
            }
        };
    })
  .config(function($routeProvider, $locationProvider, $httpProvider) {
      $routeProvider.when("/create", {
        templateUrl: "templates/create.html",
        controller: "CreateCtrl"
      });
     $routeProvider.when("/edit", {
        templateUrl: "templates/edit.html",
        controller: "AppCtrl",
        search: {flowId: null}
      });
      $routeProvider.otherwise("/create");
        $locationProvider.html5Mode(true);  
          $httpProvider.interceptors.push('JWTHttpInterceptor');
  })
  .run(function() {
    angular.element(document).ready(function () {
        angular.element(".loading").removeClass("dont-show");
        angular.element(".isnt-loading").removeClass("dont-show");
    });
  })
  .factory("$const", function() {
    var factory = this;
    factory.LINK_CONDITION_MATCHES = "LINK_CONDITION_MATCHES";
    factory.LINK_NO_CONDITION_MATCHES = "LINK_NO_CONDITION_MATCHES";
    factory.SERVER_REMOTE_URL = "http://lineblocs.com";
    factory.FLOW_REMOTE_URL = factory.SERVER_REMOTE_URL + "/api/flow";
    return factory;
  })
  .factory("$shared", function($mdDialog, $mdSidenav, $log, $const, $http, $timeout, $q) {
    var factory = this;
    factory.models = [];
    factory.trash = [];
    factory.voices = {"da-DK":[{"lang":"da-DK","name":"da-DK-Standard-A","gender":"FEMALE"},{"lang":"da-DK","name":"da-DK-Wavenet-A","gender":"FEMALE"}],"nl-NL":[{"lang":"nl-NL","name":"nl-NL-Standard-A","gender":"FEMALE"},{"lang":"nl-NL","name":"nl-NL-Wavenet-A","gender":"FEMALE"}],"en-AU":[{"lang":"en-AU","name":"en-AU-Standard-A","gender":"FEMALE"},{"lang":"en-AU","name":"en-AU-Standard-B","gender":"MALE"},{"lang":"en-AU","name":"en-AU-Standard-C","gender":"FEMALE"},{"lang":"en-AU","name":"en-AU-Standard-D","gender":"MALE"},{"lang":"en-AU","name":"en-AU-Wavenet-A","gender":"FEMALE"},{"lang":"en-AU","name":"en-AU-Wavenet-B","gender":"MALE"},{"lang":"en-AU","name":"en-AU-Wavenet-C","gender":"FEMALE"},{"lang":"en-AU","name":"en-AU-Wavenet-D","gender":"MALE"}],"en-GB":[{"lang":"en-GB","name":"en-GB-Standard-A","gender":"FEMALE"},{"lang":"en-GB","name":"en-GB-Standard-B","gender":"MALE"},{"lang":"en-GB","name":"en-GB-Standard-C","gender":"FEMALE"},{"lang":"en-GB","name":"en-GB-Standard-D","gender":"MALE"},{"lang":"en-GB","name":"en-GB-Wavenet-A","gender":"FEMALE"},{"lang":"en-GB","name":"en-GB-Wavenet-B","gender":"MALE"},{"lang":"en-GB","name":"en-GB-Wavenet-C","gender":"FEMALE"},{"lang":"en-GB","name":"en-GB-Wavenet-D","gender":"MALE"}],"en-US":[{"lang":"en-US","name":"en-US-Standard-B","gender":"MALE"},{"lang":"en-US","name":"en-US-Standard-C","gender":"FEMALE"},{"lang":"en-US","name":"en-US-Standard-D","gender":"MALE"},{"lang":"en-US","name":"en-US-Standard-E","gender":"FEMALE"},{"lang":"en-US","name":"en-US-Wavenet-A","gender":"MALE"},{"lang":"en-US","name":"en-US-Wavenet-B","gender":"MALE"},{"lang":"en-US","name":"en-US-Wavenet-C","gender":"FEMALE"},{"lang":"en-US","name":"en-US-Wavenet-D","gender":"MALE"},{"lang":"en-US","name":"en-US-Wavenet-E","gender":"FEMALE"},{"lang":"en-US","name":"en-US-Wavenet-F","gender":"FEMALE"}],"fr-CA":[{"lang":"fr-CA","name":"fr-CA-Standard-A","gender":"FEMALE"},{"lang":"fr-CA","name":"fr-CA-Standard-B","gender":"MALE"},{"lang":"fr-CA","name":"fr-CA-Standard-C","gender":"FEMALE"},{"lang":"fr-CA","name":"fr-CA-Standard-D","gender":"MALE"},{"lang":"fr-CA","name":"fr-CA-Wavenet-A","gender":"FEMALE"},{"lang":"fr-CA","name":"fr-CA-Wavenet-B","gender":"MALE"},{"lang":"fr-CA","name":"fr-CA-Wavenet-C","gender":"FEMALE"},{"lang":"fr-CA","name":"fr-CA-Wavenet-D","gender":"MALE"}],"fr-FR":[{"lang":"fr-FR","name":"fr-FR-Standard-A","gender":"FEMALE"},{"lang":"fr-FR","name":"fr-FR-Standard-B","gender":"MALE"},{"lang":"fr-FR","name":"fr-FR-Standard-C","gender":"FEMALE"},{"lang":"fr-FR","name":"fr-FR-Standard-D","gender":"MALE"},{"lang":"fr-FR","name":"fr-FR-Wavenet-A","gender":"FEMALE"},{"lang":"fr-FR","name":"fr-FR-Wavenet-B","gender":"MALE"},{"lang":"fr-FR","name":"fr-FR-Wavenet-C","gender":"FEMALE"},{"lang":"fr-FR","name":"fr-FR-Wavenet-D","gender":"MALE"}],"de-DE":[{"lang":"de-DE","name":"de-DE-Standard-A","gender":"FEMALE"},{"lang":"de-DE","name":"de-DE-Standard-B","gender":"MALE"},{"lang":"de-DE","name":"de-DE-Wavenet-A","gender":"FEMALE"},{"lang":"de-DE","name":"de-DE-Wavenet-B","gender":"MALE"},{"lang":"de-DE","name":"de-DE-Wavenet-C","gender":"FEMALE"},{"lang":"de-DE","name":"de-DE-Wavenet-D","gender":"MALE"}],"it-IT":[{"lang":"it-IT","name":"it-IT-Standard-A","gender":"FEMALE"},{"lang":"it-IT","name":"it-IT-Wavenet-A","gender":"FEMALE"}],"ja-JP":[{"lang":"ja-JP","name":"ja-JP-Standard-A","gender":"FEMALE"},{"lang":"ja-JP","name":"ja-JP-Wavenet-A","gender":"FEMALE"}],"ko-KR":[{"lang":"ko-KR","name":"ko-KR-Standard-A","gender":"FEMALE"},{"lang":"ko-KR","name":"ko-KR-Standard-B","gender":"FEMALE"},{"lang":"ko-KR","name":"ko-KR-Standard-C","gender":"MALE"},{"lang":"ko-KR","name":"ko-KR-Standard-D","gender":"MALE"},{"lang":"ko-KR","name":"ko-KR-Wavenet-A","gender":"FEMALE"},{"lang":"ko-KR","name":"ko-KR-Wavenet-B","gender":"FEMALE"},{"lang":"ko-KR","name":"ko-KR-Wavenet-C","gender":"MALE"},{"lang":"ko-KR","name":"ko-KR-Wavenet-D","gender":"MALE"}],"nb-NO":[{"lang":"nb-NO","name":"nb-no-Standard-E","gender":"FEMALE"},{"lang":"nb-NO","name":"nb-no-Wavenet-E","gender":"FEMALE"}],"pl-PL":[{"lang":"pl-PL","name":"pl-PL-Standard-A","gender":"FEMALE"},{"lang":"pl-PL","name":"pl-PL-Standard-B","gender":"MALE"},{"lang":"pl-PL","name":"pl-PL-Standard-C","gender":"MALE"},{"lang":"pl-PL","name":"pl-PL-Standard-D","gender":"FEMALE"},{"lang":"pl-PL","name":"pl-PL-Standard-E","gender":"FEMALE"},{"lang":"pl-PL","name":"pl-PL-Wavenet-A","gender":"FEMALE"},{"lang":"pl-PL","name":"pl-PL-Wavenet-B","gender":"MALE"},{"lang":"pl-PL","name":"pl-PL-Wavenet-C","gender":"MALE"},{"lang":"pl-PL","name":"pl-PL-Wavenet-D","gender":"FEMALE"},{"lang":"pl-PL","name":"pl-PL-Wavenet-E","gender":"FEMALE"}],"pt-BR":[{"lang":"pt-BR","name":"pt-BR-Standard-A","gender":"FEMALE"},{"lang":"pt-BR","name":"pt-BR-Wavenet-A","gender":"FEMALE"}],"pt-PT":[{"lang":"pt-PT","name":"pt-PT-Standard-A","gender":"FEMALE"},{"lang":"pt-PT","name":"pt-PT-Standard-B","gender":"MALE"},{"lang":"pt-PT","name":"pt-PT-Standard-C","gender":"MALE"},{"lang":"pt-PT","name":"pt-PT-Standard-D","gender":"FEMALE"},{"lang":"pt-PT","name":"pt-PT-Wavenet-A","gender":"FEMALE"},{"lang":"pt-PT","name":"pt-PT-Wavenet-B","gender":"MALE"},{"lang":"pt-PT","name":"pt-PT-Wavenet-C","gender":"MALE"},{"lang":"pt-PT","name":"pt-PT-Wavenet-D","gender":"FEMALE"}],"ru-RU":[{"lang":"ru-RU","name":"ru-RU-Standard-A","gender":"FEMALE"},{"lang":"ru-RU","name":"ru-RU-Standard-B","gender":"MALE"},{"lang":"ru-RU","name":"ru-RU-Standard-C","gender":"FEMALE"},{"lang":"ru-RU","name":"ru-RU-Standard-D","gender":"MALE"},{"lang":"ru-RU","name":"ru-RU-Wavenet-A","gender":"FEMALE"},{"lang":"ru-RU","name":"ru-RU-Wavenet-B","gender":"MALE"},{"lang":"ru-RU","name":"ru-RU-Wavenet-C","gender":"FEMALE"},{"lang":"ru-RU","name":"ru-RU-Wavenet-D","gender":"MALE"}],"sk-SK":[{"lang":"sk-SK","name":"sk-SK-Standard-A","gender":"FEMALE"},{"lang":"sk-SK","name":"sk-SK-Wavenet-A","gender":"FEMALE"}],"es-ES":[{"lang":"es-ES","name":"es-ES-Standard-A","gender":"FEMALE"}],"sv-SE":[{"lang":"sv-SE","name":"sv-SE-Standard-A","gender":"FEMALE"},{"lang":"sv-SE","name":"sv-SE-Wavenet-A","gender":"FEMALE"}],"tr-TR":[{"lang":"tr-TR","name":"tr-TR-Standard-A","gender":"FEMALE"},{"lang":"tr-TR","name":"tr-TR-Standard-B","gender":"MALE"},{"lang":"tr-TR","name":"tr-TR-Standard-C","gender":"FEMALE"},{"lang":"tr-TR","name":"tr-TR-Standard-D","gender":"FEMALE"},{"lang":"tr-TR","name":"tr-TR-Standard-E","gender":"MALE"},{"lang":"tr-TR","name":"tr-TR-Wavenet-A","gender":"FEMALE"},{"lang":"tr-TR","name":"tr-TR-Wavenet-B","gender":"MALE"},{"lang":"tr-TR","name":"tr-TR-Wavenet-C","gender":"FEMALE"},{"lang":"tr-TR","name":"tr-TR-Wavenet-D","gender":"FEMALE"},{"lang":"tr-TR","name":"tr-TR-Wavenet-E","gender":"MALE"}],"uk-UA":[{"lang":"uk-UA","name":"uk-UA-Standard-A","gender":"FEMALE"},{"lang":"uk-UA","name":"uk-UA-Wavenet-A","gender":"FEMALE"}]}
      factory.isLoading = false;
      factory.isCreateLoading = false;
    factory.voiceGenders = ['MALE', 'FEMALE'];
    factory.voiceLangs  = Object.keys( factory.voices );
    factory.searchText = "";

    function doReload() {
      var scope = getAngularScope();
      $timeout(function() {
        scope.$apply();
      }, 0)
    }
    factory.loadExtensions = function() {
       var url = createUrl( "/extension/listExtensions" );
       return $q(function(resolve, reject) {
        $http.get( url ).then(function(res) {
            console.log("extensions are ", res.data);
            var extensions = res.data.data.map(function(extension) {
              return extension.username;
            } );
            resolve( extensions );
          }, reject);
        });
      }

    factory.deleteWidget = function(ev) {
      var confirm = $mdDialog.confirm()
            .title('Are you sure you want to remove this widget ?')
            .content('removing this widget will permantely remove its data and all its links')
            .ariaLabel('Remove Widget')
            .targetEvent(ev)
            .ok('Yes')
            .cancel('No');
      $mdDialog.show(confirm).then(function() {
        var models = [];
        for (var index in factory.models) {
          var model = factory.models[ index ];
          if (model.cell.id === factory.cellModel.cell.id) {
            factory.trash.push(model);
            continue; 
          }
          models.push( model );
        }
        console.log("models are now ", models);
        factory.cellModel.cell.remove();
        factory.models = models;
        factory.cellModel = null;
        factory.cellView = null;
        doReload();
      }, function() {
      });
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
        scope.createModel(  newCell, name );
    }

    factory.duplicateWidget = function(ev) {
        console.log("duplicating widget ", factory.cellView);
        var graph = diagram['graph'];
        doDuplicate(factory.cellView, factory.cellModel);
    }
    factory.duplicateWidgetAlt = function(model, view) {
        doDuplicate(view, model);
    }
    factory.canDelete = function() {
      console.log("canDelete called ", arguments, factory.cellModel);
      if (factory.cellModel && factory.cellModel.cell && factory.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    factory.canDuplicate = function() {
      if (factory.cellModel && factory.cellModel.cell && factory.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    factory.hasCellModel = function() {
      console.log("hasCellModel ", factory.cellModel);
      if (factory.cellModel && factory.cellModel.cell) {
        return true;
      }
      return false;
    }
    function createOption(model, label) {
      var tag = model.name+"."+label;
      return {
        value: tag,
        display: tag
      };
    }
        // get widget auto complete options
    factory.loadACOptions = function() {
      var options = [];
      console.log("loadACOptions called. models are ", factory.models);
      for (var index in factory.models) {
        var model = factory.models[index];
        if ( model.cell.attributes.type === 'devs.LaunchModel' ) {
          options.push(createOption(model,'call.from'));
          options.push(createOption(model,'call.to'));
        } else if ( model.cell.attributes.type === 'devs.DialModel' ) {
          options.push(createOption(model,'from'));
          options.push(createOption(model,'to'));
          options.push(createOption(model,'call_id'));
          options.push(createOption(model,'dial_status'));
        } else if ( model.cell.attributes.type === 'devs.BridgeModel' ) {
          options.push(createOption(model,'from'));
          options.push(createOption(model,'to'));
          options.push(createOption(model,'call_id'));
          options.push(createOption(model,'dial_status'));
        } else if ( model.cell.attributes.type === 'devs.ProcessInputModel' ) {
          options.push(createOption(model,'from'));
          options.push(createOption(model,'to'));
          options.push(createOption(model,'digits'));
          options.push(createOption(model,'call_id'));
          options.push(createOption(model,'speech'));
        } else if ( model.cell.attributes.type === 'devs.RecordVoicemailModel' ) {
          options.push(createOption(model,'from'));
          options.push(createOption(model,'to'));
          options.push(createOption(model,'call_id'));
          options.push(createOption(model,'recording_id'));
          options.push(createOption(model,'recording_uri'));
        }

      }
      console.log("loadACOptions created ", options);
      return options;
    }

    factory.loadLinkACOptions = function() {
      var options = [];
      for (var index in factory.models) {
        var model = factory.models[ index ];
        options.push( { "display": model.name, "value": model.name });
      }
      return options;
    }
    factory.querySearch   = querySearch;
    factory.queryExtensionsSearch   = queryExtensionsSearch;
    factory.selectedItemChange = selectedItemChange;
    factory.searchTextChange   = searchTextChange;

    factory.queryLinkSearch   = queryLinkSearch;
    factory.selectedLinkItemChange = selectedLinkItemChange;
    factory.searchLinkTextChange   = searchLinkTextChange;

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
    function querySearch (query) {
      console.log("querySearch was called..");
      var data = factory.loadACOptions();
      var results = query ? data.filter(createFilterFor(query)) : data,
          deferred;
      if (factory.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        console.log("results are ", results);
        return results;
      }
    }
    function queryExtensionsSearch (query) {
      console.log("querySearch was called..");
      console.log("extensions are ", factory.extensions);
      return $q.resolve(factory.extensions.map(function(extension) {
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
      return { name: chip, type: 'new' };
    }
    function queryLinkSearch (query) {
      console.log("queryLinkSearch was called..");
      var data = factory.loadLinkACOptions();
      var results = query ? data.filter(createFilterFor(query)) : data,
          deferred;
      if (factory.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
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
      model.data[ key ] = item.value;
      console.log('model data is now ', model.data);
    }
    function selectedLinkItemChange(link, item) {
      $log.info('Item changed to ' + JSON.stringify(item));
      link.tempData.ACItem = item;
      link.cell = item.value;
      var linkLabel = link.label;
      console.log('link data is now ', link);
      var srcModel = factory.cellModel.cell, dstModel;
      var graph = diagram['graph'];
      for (var index in factory.models) {
        var model = factory.models[ index ];
        if ( link.cell === model.name ) {
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
         cells.forEach(function(cell) {
          var attrs = cell.attributes;
          if ( attrs.type === 'devs.FlowLink' ) {
            console.log("compare srcModel.id", srcModel.id);
            console.log("compare attrs.source.id", attrs.source.id);
            console.log("compare linkLabel", linkLabel);
            console.log("compare attrs.soure.port", attrs.source.port);

            if ( attrs.source.id === srcModel.id && attrs.source.port === linkLabel ) {
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

    factory.saveWidget = function() {
      var model = factory.cellModel;
      //model.cell.attr({ text: { text:  model.name } });
      changeLabel(model.cell, model.name);
      console.log("saveWidget model", model);
      var data = model.data;
      if (model.cell.attributes.type === 'devs.DialModel') {
        if (data.call_type === 'Phone Number') {
          changeDescription(model.cell, "Call " + data.number_to_call + " on new line");
        }  else if (data.call_type === "Extension") {
          changeDescription(model.cell, "Call ext " + data.extension + " on new line");
        }
      } else if (model.cell.attributes.type === 'devs.BridgeModel') {
        if (data.call_type === 'Phone Number') {
          changeDescription(model.cell, "Connect to " + data.number_to_call);
        }  else if (data.call_type === "Extension") {
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
      } else if (model.cell.attributes.type === 'devs.SwitchModel') {
      }
    }
    factory.getCellById = function( id ) {
      var found = null;
      var graph = diagram['graph'];
      graph.getCells().forEach(function( cell ) {
          if ( cell.id === id ) {
            factory.models.forEach( function( model ) {
                if ( model.cell.id === id ) {
                  found = { "cell": cell, "model": model };
                }

            })
          }
      });
      console.log("getCellById result ", found);
      return found;
    }
    factory.getVoiceLangs = function() {
      var langs = Object.keys( factory.voices );
      console.log("voice languages are ", langs);
      return langs;
    }
    factory.getVoices = function() {
      console.log("getVoices ", factory.cellModel);
      var cellModel = factory.cellModel;
      if (!cellModel || !cellModel.data || !cellModel.data.text_language) {
        return []; 
      }
      var options = factory.voices[ cellModel.data.text_language ];
      if ( cellModel.data.text_gender ) {
        options = options.filter( function( option ) {
          if ( option.gender === cellModel.data.text_gender ) {
            return true;
          }
          return false;
        })
      }
      options = options.map(function(option) {
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
          .content('Your flow has been saved and published. thanks')
          .ariaLabel('Saved Changes')
          .ok('ok')
          .targetEvent(ev)
      );

    }

    $scope.canDelete = function() {
      console.log("canDelete called ", arguments, $scope.cellModel);
      if ($shared.cellModel && $shared.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }
    $scope.canDuplicate = function() {
      if ($shared.cellModel && $shared.cellModel.cell.attributes.type !== "devs.LaunchModel") {
        return true;
      }
      return false;
    }



    $scope.centerFocus = function() {
      copyPosition = null;
      var paper = diagram['paper'];
      paper.translate(0, 0);
    }

    function changeCell(item) {
      var graph = diagram['graph'];
      var cells = graph.getCells();
      angular.forEach(cells, function(cell) {
        console.log("changeCell changing ", arguments);
        if (cell.id === item.cell.id) {
          item.cell = cell;
        }
      });
    }
    function syncTrash() {
      var newTrash = [];
      angular.forEach($shared.trash, function(item) {
        var id = item.cell.id;
        if ( $("g[model-id='" + id + "']").is(":visible") ) {
          changeCell(item);
          $shared.models.push( item );
        } else {
          newTrash.push(item);
        }
      });
      angular.forEach($shared.models, function(item) {
        var id = item.cell.id;
        if ( !$("g[model-id='" + id + "']").is(":visible") ) {
          newTrash.push(item);
        }
      });
      $shared.trash = newTrash;

    }

    $scope.undo = function() {
      var commandManager = diagram['commandManager'];
      commandManager.undo();
      syncTrash();
    }
    $scope.redo = function() {
      var commandManager = diagram['commandManager'];
      commandManager.redo();
      syncTrash();
    }
    $scope.zoomOut = function() {
      zoomOut();
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
      var graph = diagram['graph'];
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
        serverData['name'] = $shared.flow.name;
        serverData['flow_json'] = JSON.stringify( params );
        $shared.isCreateLoading = true;
        $http.post( createUrl(  "/flow/updateFlow/" + flowId ), serverData ).then(function() {
          $shared.isCreateLoading = false;
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
  .controller('CreateCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http) {
    $scope.values = {
      name: ""
    };
    $scope.templates = [];
    $scope.$shared = $shared;
    $scope.submit = function() {
      var data = angular.copy( $scope.values );
      data['flow_json'] = null;
      data['template_id'] = null;
      data['started'] = true;
      if ($scope.selectedTemplate) {
        data['template_id'] = $scope.selectedTemplate.id;
      }
      $shared.isCreateLoading = true;
      $http.post( createUrl( "/flow/saveFlow" ), data).then(function(res) {
        $shared.isCreateLoading = false;
        console.log("response arguments ", arguments);
        console.log("response headers ", res.headers('X-Flow-ID'));
        console.log("response body ", res.body);
        var id = res.headers('X-Flow-ID');
        var urlObj = URI(document.location.href);
       var query = urlObj.query( true );
        var token = query.auth;
        $location.url("/edit?flowId=" + id + "&auth=" + token + "&workspaceId=" + query.workspaceId);
        if (!isLocal) {
          //top.window.location.href = "https://app.lineblocs.com/#/dashboard/flows/" + id;
        }
      });
    }
    $scope.useTemplate = function(template) {
      $scope.selectedTemplate = template;
    };
    $scope.isSelected = function(template) {
      if ($scope.selectedTemplate && template.id === $scope.selectedTemplate.id) {
        return true;
      }
      return false;
    }
    function init() {
      $shared.isLoading =true;
      $http.get( createUrl( "/flow/listTemplates" ) ).then(function(res) {
        $shared.isLoading =false;
        console.log("flow templates are ", res.data);
        $scope.templates = res.data.data;
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
      'Phone Number',
      'Queue'
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
        attrs: { text: { text: label } },
      };
      console.log("adding port ", port);
      cellModel.cell.addPort(port);
      var link = new Link( cellModel, null, label, type, null, null, null );
      link.ports.push( port );
      cellModel.links.push( link );
    }

    $scope.createModel = function(cell, name) {
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
          var target = cells[ index ];
          if ( target.attributes.type === cell.attributes.type && target !== cell ) {
            count += 1;
          }
        }
        if ( count > 0 ) {
          name += " (" + count + ")";
        }
      }
      var model = new Model(cell, name);
      changeLabel(cell, name);
      $shared.models.push( model );
    }
    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

  
    $scope.loadWidget = function(cellView, openSidebar) {
      console.log("loadWidget cellView ", cellView);
      console.log("loadWidget models ", $shared.models);
      //openSidebar = openSidebar || false;
      $shared.cellView = cellView;
      $scope.cellView = cellView;
      for (var index in $shared.models) {
        if ($shared.models[ index ].cell.id === cellView.model.id ) {
          $shared.cellModel = $shared.models[ index ];
          $scope.cellModel = $shared.cellModel;
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
    $scope.changeTextLanguage = function(value) {
      console.log("changeTextLanguage ", value);
      $shared.cellModel.data.text_language = value;
    }
    $scope.changeTextGender = function(value) {
      console.log("changeTextGender ", value);
      $shared.cellModel.data.text_gender = value;
    }
    $scope.changeVoice = function(value) {
      console.log("changeVoice ", value);
      $shared.cellModel.data.voice = value;
    }
    $scope.changeConditionType = function(link, value) {
      console.log("changeConditionType ", value);
      link.condition = value;
    }
    $scope.changePlaybackType = function(value) {
      console.log("changePlaybackType ", value);
      $shared.cellModel.data.playback_type = value;
    }
    $scope.changeCallType = function(value) {
      console.log("changeCallType ", value);
      $shared.cellModel.data.call_type = value;
    }
    $scope.changeExtension =  function(value) {
      console.log("changeExtension ", value);
      $shared.cellModel.data.extension = value;
    }
    $scope.updateExtensions =  function() {
      console.log("updateExtensions ");
      $shared.loadExtensions().then(function(extensions) {
        $shared.extensions = extensions;
      });
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

    $scope.flowWasStarted = function() {
      console.log("flowWasStarted ", $shared.flow);
      if ($shared.flow && $shared.flow.started) {
        return true;
      }

      return false;
    }
    $scope.useTemplate = function(template) {
      $scope.selectedTemplate = template;
    };
    $scope.isSelected = function(template) {
      if ($scope.selectedTemplate && template.id === $scope.selectedTemplate.id) {
        return true;
      }
      return false;
    }
    $scope.addTemplate = function() {
      var data = {};
      data['flow_json'] = null;
      data['template_id'] = null;
      data['started'] = true;
      if ($scope.selectedTemplate) {
        data['template_id'] = $scope.selectedTemplate.id;
      }
      $http.post( createUrl(  "/flow/updateFlow/" + $shared.flow.id ), data).then(function(res) {
        $shared.flow.started = true;
        load();
      } );
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
      $shared.flow = { "started": true };
       $shared.isLoading =true;
       var url = createUrl( "/extension/listExtensions" );
       $shared.loadExtensions().then(function(extensions) {
          console.log("extensions are ", extensions);
          $shared.extensions = extensions;
          $timeout(function() {
            window['angularScope'] = angular.element(document.getElementById('scopeCtrl')).scope();
            var graph;
            if (search.flowId) {
              $q.all([
                $http.get( createUrl("/flow/flowData/" + search.flowId  )),
                $http.get( createUrl( "/flow/listTemplates"  ) )
              ]).then(function(res) {
                console.log("flow templates are ", res[1].data);
                $scope.templates = res[1].data.data;
                $shared.flow = { "started": true };
              $shared.isLoading = false;
                  console.log("fetch JSON is ", res[0]);
                $timeout(function() {
                    $shared.flow = res[0].data;
                    if (!$shared.flow.started) {
                      return;
                    }
                    initializeDiagram();
                    graph = diagram['graph'];

                    if (res[0].data.flow_json) {

                      var data = JSON.parse( res[0].data.flow_json );
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
                        $("#canvas").width()/2 - (size.width / 2), 
                        //($("#canvas").height()/2 - (size.height / 2)) - subtractPaddingTop
                        120
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
  }).controller('PaperCtrl', function ($scope, $timeout, $mdSidenav, $log, $const, $shared, $location, $http) {
    $scope.$shared = $shared;
  });

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


var offsetLeft, offsetTop, beforeInfo, launchCell, diagram;
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
          scope.unsetCellModel();
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
                if (source.id === undefined || target.id === undefined) {
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

  appendStencilModels(stencilGraph, [
       joint.shapes.devs.SwitchModel,
       joint.shapes.devs.DialModel,
       joint.shapes.devs.BridgeModel,
       joint.shapes.devs.ProcessInputModel,
       joint.shapes.devs.RecordVoicemailModel,
       joint.shapes.devs.PlaybackModel,
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
}

function bindHotkeys() {
    var ctrlDown = false,
        ctrlKey = 17,
        cmdKey = 91,
        vKey = 86,
        cKey = 67;
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
        if ( $( active ).is("input") || ( parent && $(parent).is("md-select")) || $(active).is("md-option")) {
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
        if (e.keyCode === 8) {
          console.log("backspace detected");
          if (scope.$shared.cellModel) {
            scope.$shared.deleteWidget();
          }
        }

    });
}

//initializeDiagram();
$.get("./templates.html", function(data) {
     console.log("data is ", data);
          $(data).appendTo('body');
          angular.bootstrap(document, ['basicUsageSidenavDemo']);

      bindHotkeys();

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
    name: 'ProcessInput',
    type: 'devs.ProcessInputModel',
    size: widgetDimens,
    attrs: createDefaultAttrs("ProcessInput", "Gather input on a call"),
  
  inPorts: ['In'],
  outPorts: ['Digits Received', 'Speech Received'],
  ports:defaultPorts,

  }, joint.shapes.devs.Model.prototype.defaults)
});

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

joint.shapes.devs.RecordVoicemailModel = joint.shapes.devs.Model.extend({

  markup: defaultMarkup,

  defaults: joint.util.deepSupplement({
    name: 'RecordVoicemail',
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

joint.shapes.devs.ProcessInputView = joint.shapes.devs.ModelView;

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