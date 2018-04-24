var riipenapp = angular.module('riipenapp', ['ngRoute', 'ui.bootstrap',  'ngSanitize']);

riipenapp.controller('mainController', mainController);
riipenapp.controller('portalsController', portalsController);
riipenapp.controller('assignmentsController', assignmentsController);
riipenapp.controller('detailsController', detailsController);

var configFunction = function ($routeProvider, $httpProvider) {
    $routeProvider
        // default route
        
        .when('/assignments', {
            templateUrl : 'views/assignlist.html',
            controller  : 'assignmentsController'
        })
        
        .when('/portals', {
            templateUrl : 'views/portallist.html',
            controller  : 'portalsController'
        })
        
        .when('/assigndetails/:id', {
            templateUrl : 'views/assigndetails.html',
            controller  : 'detailsController'
        });
}
configFunction.$inject = ['$routeProvider', '$httpProvider'];

riipenapp.config(configFunction);