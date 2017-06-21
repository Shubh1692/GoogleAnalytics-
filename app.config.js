module.exports = {
    GOOGLE_CLINET_CONFIG: {
        "type": "service_account",
        "project_id": "hip-hangout-165616",
        "private_key_id": "75e04fa70ca50ea7ed11be19a0108f94698dece6",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC/fTrxiIq9GzN/\nBrtMwADmNH4pbjqdKi/30z0rd0CroKbP4vVVq9uHroLdz0Wmi8YPN+JpxzAfCD+Q\nhi5cVBd7OzU86gv7PtkUHmD6uUXfrp6omizWFG5hC9ubeiM/HVkn+AuqmfgDXMBc\nK/OUg7Mmblh+yll9MemEdqbD0omfobU24yAoRo+aOgEGLYoLBUD0JiouQmE0nvSH\nvD5AL7mPkA3SXryZfcntQJIMUnBtwULwsY5v8eRzlZkadt+5MdE/OHToBINJDxqC\nDKA2DRxrSRQGixv9Gpt1H8UW6IyElLIM7eSOHWBDQ3GXoJ2+xWQBVdf3+wTkwC8M\nSVaM88ZBAgMBAAECggEABmSb7yxr1VxvH7KN1kYiwYzHGYMAmfaqm0+GH0lf81rt\ntssQ/cc7ERCWdelRnfnUpvVqrbVkueSAmsagDZ0RG6AiauI1fDHg9Xb+LeC5oHon\n+eEL1ingdYT70/kD7DuCmn8BhLSXPyV9lpYxD6hF9uaANdtzmWZtMWr0rlz9E0M3\n6ZkRYTD/udjD1z1k5aH5eSjgny0BuLMPVevTL4Xa4yR1aGos4t7hTXJKjU7QiSs5\n7cfIOIUHAUT3c+tSpPTF1dR+vMryDDQwFadu37wr1tbaL9KxL85vHNjSGfdbvEKP\n2OpasHx4/ZHVFXn6ckVtD/Y+T8Pu51vy0L5QvM0n8QKBgQD9yqVUGt3RoiP70xyW\nFs1dFsK70LOw3K95/d0N88If9OdGYXAZbpxAwvwcjC50TI3TY44QlSQ7SJW+b9CJ\nYcvaqy+zO3U7gt6x6fnl+cLsxPvMRXhJnosvsnyFlxWBviVHMHQVmra2ejxGKFd0\nAB1ohq0KmHKLGDP9GkzfkR3XCwKBgQDBJ8ww4KuPTayFbtOgwzWnl9kpGBoMzy+X\ncLKZNV++7ZK35Qv4OPLU8a+iAhYya6RUwdLCndD+E5o2Stn8c4wDYL+uVcgLgDHH\nYk8J5OJWnCin2cZrHY01Fms10CadxiqbmFtvJRub+V7YNdSjZb/tvpoHK8onC2UY\nl4dKKIr3YwKBgA0jrbWSAoP08gn6nxNCMPWt1P0mS/dPJaKaOxSa1yUSZ9rj9orK\niDpuHeFYfJs2z2zvTY6cOhj7pA0M+u3x6zzx+fE8ldAz8VWiuHZonOfnNuYXfqfJ\nFomsovfDn7Bs6L8rygbIUMdXwsEbG5P84Yjk2BahV+TNpvtmni5A9BuLAoGBAIg5\n1kP+oGCgKnWs9SqjoprBeJIIAo9YLDuFayCsyQsyKNDzhJ6bI4BVuEXtbNRAoJR6\nYneJsFURZCi4X8cxguT6/hUpQL4DupfhWNckixEEb5P5/nubSvTPC+vXEvUhRvmX\n2ZyosjEuDds1E/PtlhBJ5f36v0cMPU+7xtnhgCj7AoGAeU/3cNrzuofx9epq8i1l\nl8zjRjaHumjrpaIEsi9Vn8u02z4AkmHzKZCAea+prnG5c52jOeenP++6l5Dfc135\njB99xeoX8Oy0dUjf6dqnJ12zZZXlxr/0Ryda6F8vxAXrSSxKdw80/+TNeH+1qfRy\nhE6yJpJXPv9SUj0J5vjs56E=\n-----END PRIVATE KEY-----\n",
        "client_email": "googleanalytics1692@hip-hangout-165616.iam.gserviceaccount.com",
        "client_id": "112880960730733793641",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/googleanalytics1692%40hip-hangout-165616.iam.gserviceaccount.com"
    },
    GOOGLE_APP_VIEW_ID: 'ga:148848685',
    NODE_SERVER_PORT: 8081,
    REAL_TIME_API_SUCCESS_MESSAGE: 'Get Real Time Data',
    REAL_TIME_API_ERROR_MESSAGE: 'Error By Google Real Time API',
    ALL_TIME_API_SUCCESS_MESSAGE: 'Get All Data Data',
    ALL_TIME_API_ERROR_MESSAGE: 'Error By Google All Data API',
    ALL_TIME_GET_USER_API_ERROR_MESSAGE: 'Error By Google All Data API For Get User',
    REQUEST_HEADER: {
        'Access-Control-Allow-Origin': 'https://obscure-springs-26671.herokuapp.com',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
        'Access-Control-Allow-Credentials': true
    },
    GOOGLE_MENU_DATA_START_DATE: new Date('2007-01-01').toISOString().slice(0, 10),
    GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS_PART_ONE: ['rt:country', 'rt:browser', 'rt:deviceCategory', 'rt:userType'],
    GOOGLE_DEFAULT_REAL_TIME_DIMENSIONS_PART_TWO : ['rt:referralPath', 'rt:operatingSystem'],
    GOOGLE_DEFAULT_USER_DATA_DIMENSIONS_PRAT_ONE : 'ga:date,ga:eventCategory,ga:eventAction,ga:countryIsoCode,ga:browser,ga:deviceCategory,ga:userType',
    GOOGLE_DEFAULT_USER_DATA_DIMENSIONS_PRAT_TWO : 'ga:date,ga:eventCategory,ga:eventAction,ga:referralPath,ga:operatingSystem, ga:hour, ga:minute',
    GOOGLE_DEFAULT_ALL_TIME_DATA_METRICS : 'ga:users, ga:bounceRate, ga:avgSessionDuration, ga:newUsers, ga:percentNewSessions, ga:pageviewsPerSession, ga:goalCompletionsAll, ga:goalConversionRateAll, ga:goalValueAll, ga:sessions',    
    DUMMY_DATA_LIST: {
        DUMMY_BROWSER_LIST: ['Chrome', 'Firefox', 'Safari', 'Android Webview'],
        DUMMY_OS_LIST: ['Windows', 'Macintosh', 'iOS', 'Android'],
        MAX_COUNT: 10,
        GOAL_EVENT_NAME: 'login',
        DUMMY_USERS : {
            NAME: ['chocolate bunny', 'red penguin', 'blue otter', 'pink wombat', 'grey sloth', 'purple sloth', 'black koala', 'white panther', 'green shrimp', 'fast crab', 'slow tuna', 'sleepy salmon', 'cooked cod', 'silly python', 'yummy flamingo', 'running moose', 'flying hawk', 'sitting racoon',],
            EMAIL: ['bunny@demo.com', 'penguin@demo.com', 'otter@demo.com', 'wombat@demo.com', 'sloth@demo.com', 'koala@demo.com', 'panther@demo.com', 'shrimp@demo.com', 'crab@demo.com', 'tuna@demo.com', 'salmon@demo.com', 'cod@demo.com', 'python@demo.com', 'flamingo@demo.com', 'moose@demo.com', 'hawk@demo.com', 'eagle@demo.com', 'racoon@demo.com']
        }
    }
};