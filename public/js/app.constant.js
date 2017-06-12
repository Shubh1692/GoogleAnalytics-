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
            gaValue : 'ga:country',
        },
        {
            name: 'Browser',
            value: 'rt:browser',
            gaValue : 'ga:browser',
        },
        {
            name: 'OS',
            value: 'rt:operatingSystem',
            gaValue : 'ga:operatingSystem',
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
    .constant('BROWSER_LOGOS_PATH',  {
        'BASE_PATH' : '/lib/browser-logos/src/',
        'IMAGE_CONSTRAINT' : '_16x16.png'
    })
     .constant('VISITOR_ICONS_PATH',  {
        'BASE_PATH' : '/images/visitor_analytics_icons/',
        'IMAGE_CONSTRAINT' : '.svg'
    })
    .constant('NODE_WEB_API_DEMO', {
        'REAL_TIME_DATA_API': 'getRealTimeDataDemoAPI',
        'ALL_TIME_DATA_API': 'getGoogleAnalyticsAllData',
        'ALL_TIME_USER_DATA_API': 'getGoogleAnalyticsUserData',
        'DUMMY_API_DEFAULT_FLAG' : false
    })
    .constant('SPEED_ARRAY', [{
        'textField' : 'Slow',
        'value' : 0.00000000000000000001
    },{
        'textField' : 'Medium',
        'value' : 0.00001
    },{
        'textField' : 'Fast',
        'value' : 2
    }]);
