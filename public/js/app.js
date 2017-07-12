angular.module('googleAnalyticsModule', [
    'ui-notification',
    'btford.socket-io',
    'ui.router'
])
    .config(['NOTIFICATION_CONSTANT', 'NotificationProvider', '$sceProvider', '$stateProvider', '$urlRouterProvider', function (NOTIFICATION_CONSTANT, NotificationProvider, $sceProvider, $stateProvider, $urlRouterProvider) {
        NotificationProvider.setOptions(NOTIFICATION_CONSTANT);
        $sceProvider.enabled(false);
        $urlRouterProvider.otherwise("/dahsboard");
        $stateProvider
            .state('dahsboard', {
                url: "/dahsboard",
                template: "<gad3-main-component></gad3-main-component>"
            })
            .state('adminSiteConfiguration', {
                url: "/adminSiteConfiguration",
                template: "<admin-site-configure-component></admin-site-configure-component>"
            });
    }])
    .constant('_', window._)