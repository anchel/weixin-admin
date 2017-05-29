
module.exports = {
    server: {
        port: 80  //此端口号会被环境变量PORT覆盖
    },

    cacheConfig: {
        viewCache: false  //是否缓存视图引擎，正式环境必须开启
    },

    siteConfig: {
        name: '微信管理系统-开发环境',
        host: 'http://wechat.anchel.cn/'
    },

    loginConfig: {
        host: 'oalogin.anchel.com',
        port: 80
    },

    permConfig: {
        protocol: 'http',
        host: 'perm.anchel.com',
        port: 80,
        bid: 100,
        open: false
    },

    hostConfig: {
        cmsweb: 'http://cms-web.anchel.com',
        portalapi: 'http://portal-api.anchel.com',
        wxapi: 'http://wxapi-test.anchel.com'
    },

    wechatConfig: {
        appid: 'wx03dd82dd396494c2',
        appsecret: 'd2c078095faf997494785d3ce4c9c6e0',
        token: 'webqdnxs666',
        encodingAESKey: 'YCWJGTpDK3vK9VwC1LZL8S9F9fovpkwuvj1vus7FvEa'
    },

    mysqlConfig: {
        host: '192.168.202.90',
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'wechat'
    },

    imageFtpConfig: {
        host: '115.29.190.31',
        username: 'web',
        password: '',
        basedir: '/data/image/upload/wechat',
        httpprefix: 'http://115.29.190.31/image/upload/wechat'
    },

    sessionConfig: {
        redis: {
            host: '192.168.1.207',
            port: 6379,
            prefix: 'nodesess:'
        }
    },

    securityConfig: {
        s_token: '4d23bd16e32666c470074456898cbe30ce2e2f01aeb9c57ef116633eaa9288d9',
        signApiKey: '40287ae447680a6b0147680a6b580000'
    },

    logConfig: {
        accessLogPath: 'logs/access.log',
        normalLogPath: 'logs/normal.log'
    },

    webui: {
        manifestJsFile: 'public/rev/manifest-js.json',
        manifestCssFile: 'public/rev/manifest-css.json',
        jsPrefix: '',
        cssPrefix: ''
    }
};