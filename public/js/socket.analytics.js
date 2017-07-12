angular.module('googleAnalyticsModule')
    .factory('socketAalytics', _socketAnalytics);
_socketAnalytics.$inject = ['socketFactory', 'SOCKET_CONFIG', 'dataPassingService'];
function _socketAnalytics(socketFactory, SOCKET_CONFIG, dataPassingService) {
    var myIoSocket = io.connect(SOCKET_CONFIG.serverPath);
    mySocket = socketFactory({
        ioSocket: myIoSocket
    });
    mySocket.on('connect', function (data) {
        dataPassingService.socketId = myIoSocket.id;
        if (angular.isFunction(dataPassingService.socketReadyEvent))
            dataPassingService.socketReadyEvent();
    });
    return mySocket;
}