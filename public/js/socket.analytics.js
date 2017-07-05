angular.module('googleAnalyticsModule')
    .factory('socketAalytics', _socketAnalytics);
_socketAnalytics.$inject = ['socketFactory', 'SOCKET_CONFIG'];
function _socketAnalytics(socketFactory, SOCKET_CONFIG) {
    var myIoSocket = io.connect(SOCKET_CONFIG.serverPath);

    mySocket = socketFactory({
        ioSocket: myIoSocket
    });
    mySocket.on('connect', function () {
       console.log('Socket Connected');
    });
    return mySocket;
}