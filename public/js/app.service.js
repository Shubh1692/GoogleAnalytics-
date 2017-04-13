angular.module('googleAnalyticsModule')
    .service('googleAnalyticsService', _googleAnalyticsService)
    .service('dataPassingService', _dataPassingService);
_googleAnalyticsService.$inject = ['$http', '$q'];
_dataPassingService.$inject = [];
function _googleAnalyticsService($http, $q) {
    var googleAnalyticsService = this;
    googleAnalyticsService.serverRequest = _serverRequest;
    googleAnalyticsService.serverError = _serverError;
    // Method for Do Server Request
    function _serverRequest(url, method, postData) {
        var defer = $q.defer();
        var data = postData || '';
        $http({
            method: method,
            url: url,
            data: data,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (res) {
            if(res.data.successMessage) {
                defer.resolve(res.data.data);
            } else {
                defer.reject(res);
                googleAnalyticsService.serverError(res);
            } 
        }, function (res, status, headers, config) {
            googleAnalyticsService.serverError(res);
            defer.reject(res);
        });
        return defer.promise;
    };

     function _serverError(res) {
         console.log('error', res.errorMessage)
     };
}

function _dataPassingService() {
    var dataPassingService = this;
    dataPassingService.menuObj = {};
}