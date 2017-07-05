angular.module('googleAnalyticsModule')
    .constant('NODE_WEB_API', {
        'REAL_TIME_DATA_API': 'getGoogleAnalyticsRealTimeData',
        'ALL_TIME_DATA_API': 'getGoogleAnalyticsAllData',
        'ALL_TIME_USER_DATA_API': 'getGoogleAnalyticsUserData'
    })
    .constant('REAL_TIME_API_TIME_INTERVAL', 10000)
    .constant('SCALING_INDEX', 10)
    .constant('VIEWING_BY_SOURCE', [
        {
            name: 'Country',
            value: 'rt:country',
            gaValue: 'ga:country',
        },
        {
            name: 'Browser',
            value: 'rt:browser',
            gaValue: 'ga:browser',
        },
        {
            name: 'OS',
            value: 'rt:operatingSystem',
            gaValue: 'ga:operatingSystem',
        }
    ])
    .constant('VIEWING_BY_TIME', [
        {
            name: 'Past 24 Hours',
            time: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 10),
                endDate: new Date().toISOString().slice(0, 10)
            }
        },
        {
            name: 'Past Week',
            time: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().slice(0, 10),
                endDate: new Date().toISOString().slice(0, 10)
            }
        },
        {
            name: 'Past Month',
            time: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
                endDate: new Date().toISOString().slice(0, 10)
            }
        },
        {
            name: 'Past Year',
            time: {
                startDate: new Date(new Date().setDate(new Date().getDate() - 365)).toISOString().slice(0, 10),
                endDate: new Date().toISOString().slice(0, 10)
            }
        }
    ])
    .constant('MAX_MENU_COUNT', 10)
    .constant('GOAL_EVENT_NAME', ['login'])
    .constant('GOAL_COMPLETE_ICON_PATH', '/images/Star.svg')
    .constant('BROWSER_LOGOS_PATH', {
        'BASE_PATH': '/lib/browser-logos/src/',
        'IMAGE_CONSTRAINT': '_16x16.png'
    })
    .constant('VISITOR_ICONS_PATH', {
        'BASE_PATH': '/images/visitor_analytics_icons/',
        'IMAGE_CONSTRAINT': '.svg'
    })
    .constant('NODE_WEB_API_DEMO', {
        'REAL_TIME_DATA_API': 'getRealTimeDataDemoAPI',
        'DUMMY_API_DEFAULT_FLAG': false
    })
    .constant('SPEED_ARRAY', [{
        'textField': 'Fast',
        'value': 0
    }, {
        'textField': 'Medium',
        'value': 1000
    }, {
        'textField': 'Slow',
        'value': 5000
    }])
    .constant('DEFAULT_D3CIRCLE_CONSTRAINT', {
        'gravity': 0.2,
        'charge': -30,
        'friction': 0.0002,
        'speed': 0
    })
    .constant('NOTIFICATION_CONSTANT', {
        delay: 2000,
        startTop: 20,
        startRight: 10,
        verticalSpacing: 20,
        horizontalSpacing: 20,
        positionX: 'right',
        positionY: 'bottom'
    })
    .constant('SOCKET_CONFIG', {
        serverPath : 'http://192.168.88.245:8080'
    })
