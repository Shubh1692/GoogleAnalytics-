angular.module('googleAnalyticsModule')
    .component('rightMenu', {
        templateUrl: 'views/rightMenu.html',
        controller: 'rightMenuController',
        controllerAs: 'rightMenuCtrl',
        bindings: {
            userData : '='
        }
    })
    .component('d3control', {
        templateUrl: 'views/d3control.html',
        controller: 'd3Controller',
        controllerAs: 'd3Ctrl',
        bindings: {
        }
    });
