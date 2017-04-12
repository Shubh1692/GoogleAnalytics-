angular.module('googleAnalyticsModule')
    .constant('NODE_WEB_API', {
        'REAL_TIME_DATA_API' : 'getGoogleAnalyticsData'
    })
    .constant('VIEWING_SOURCE_ARRAY', [
        {
            name : 'Country',
            value : 'rt:country'
        },
        {
            name : 'Browser',
            value : 'rt:browser'
        }
    ])