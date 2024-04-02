
module.exports = {
    server: {
        port: 80  //此端口号会被环境变量PORT覆盖
    },

    cacheConfig: {
        viewCache: false  //是否缓存视图引擎，正式环境必须开启
    },

    siteConfig: {
        name: '微信管理系统-开发环境'
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

    hostConfig: {
        wxapi: 'http://wechat.anchel.cn'
    },

    permConfig: {
        protocol: 'http',
        host: 'perm.anchel.cn',
        port: 80,
        bid: 100,
        open: false
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