angular.module('googleAnalyticsModule')
    .factory('socketAalytics', _socketAnalytics);
_socketAnalytics.$inject = ['socketFactory'];
function _socketAnalytics(socketFactory) {
    var myIoSocket = io.connect('http://192.168.88.245:8081');

    mySocket = socketFactory({
        ioSocket: myIoSocket
    });
    mySocket.on('connect', function () {
       console.log('Socket Connected');
    });
    return mySocket;
}