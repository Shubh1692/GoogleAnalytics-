angular.module('googleAnalyticsModule', [
    'ui-notification',
    'btford.socket-io'
])
    .config(['NOTIFICATION_CONSTANT','NotificationProvider', function (NOTIFICATION_CONSTANT,NotificationProvider) {
        NotificationProvider.setOptions(NOTIFICATION_CONSTANT);
    }])
    .constant('_', window._)