angular.module('googleAnalyticsModule')
    .constant('NODE_WEB_API', {
        'REAL_TIME_DATA_API': 'getGoogleAnalyticsRealTimeData',
        'ALL_TIME_DATA_API': 'getGoogleAnalyticsAllData'
    })
    .constant('REAL_TIME_API_TIME_INTERVAL', 10000)
    .constant('SCALING_INDEX', 10)
    .constant('VIEWING_BY_SOURCE', [
        {
            name: 'Country',
            value: 'rt:country'
        },
        {
            name: 'Browser',
            value: 'rt:browser'
        },
        {
            name: 'OS',
            value: 'rt:operatingSystem'
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
