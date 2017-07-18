angular.module('googleAnalyticsModule')
    .component('gad3MainComponent', {
        templateUrl: 'views/gad3MainComponent.html',
        controller: 'googleAnalyticsController',
        controllerAs: 'googleAnalyticsCtrl',
        bindings: {
        }
    })
    .component('rightMenu', {
        templateUrl: 'views/rightMenu.html',
        controller: 'rightMenuController',
        controllerAs: 'rightMenuCtrl',
        bindings: {
            userData: '=',
            speed: '=',
            chargeRangeChange: '=',
            frictionRangeChange: '=',
            showUserNotification : '=',
            selectHost : '=',
            renderRightMenu: '='
        }
    })
    .component('d3control', {
        templateUrl: 'views/d3control.html',
        controller: 'd3Controller',
        controllerAs: 'd3Ctrl',
        bindings: {
        }
    })
    .component('adminSiteConfigureComponent', {
        templateUrl: 'views/adminSiteConfigureComponent.html',
        controller: 'adminSiteConfigureController',
        controllerAs: 'adminSiteConfigureCtrl',
        bindings: {
        }
    });
