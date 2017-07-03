angular.module('googleAnalyticsModule')
    .factory('socketAalytics', _socketAnalytics);
_socketAnalytics.$inject = ['socketFactory'];
function _socketAnalytics(socketFactory) {
    return socketFactory();
}