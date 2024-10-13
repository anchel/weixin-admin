
module.exports = {
  server: {
    port: 80, //此端口号会被环境变量PORT覆盖
  },

  siteConfig: {
    name: "微信管理系统-开发环境",
  },

  wechatConfig: {
    appid: "wx03dd82dd396494c2",
    appsecret: "d2c078095faf997494785d3ce4c9c6e0",
    token: "webqdnxs666",
    encodingAESKey: "YCWJGTpDK3vK9VwC1LZL8S9F9fovpkwuvj1vus7FvEa",
  },

  mysqlConfig: {
    host: "192.168.1.4",
    port: 3306,
    username: "root",
    password: "123456",
    database: "wechat",
  },

  hostConfig: {
    wxapi: "http://wechat.anchel.cn",
  },

  logConfig: {
    accessLogPath: "logs/access.log",
    normalLogPath: "logs/normal.log",
  },

  permConfig:{
    open:false,
  },
  webui:{}
};