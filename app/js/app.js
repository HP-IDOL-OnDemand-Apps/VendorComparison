angular.module('havenApp', [
    'ui.router',
    'angular-jqcloud',
    'ngSanitize',
    'havenApp.controllers',
    'havenApp.services'
])
    .config(['$stateProvider', '$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('app', {
                abstract: true,
                template: "<ui-view />"
            })
            .state('app.initial', {
                url: '/',
                templateUrl: 'app/partials/initial.html',
                controller: 'InitialCtrl'
            })
            .state('app.error', {
                url: '/404',
                templateUrl: 'app/partials/error.html'
            })

        $urlRouterProvider.otherwise('/404');
        $locationProvider.html5Mode(true);
    }]);