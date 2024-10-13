
module.exports = {
  server: {
    port: 80, //此端口号会被环境变量PORT覆盖
  },

  siteConfig: {
    name: "微信管理系统-开发环境",
  },

  wechatConfig: {
    appid: "wx03dd82dd396494c2",
    appsecret: "333",
    token: "11",
    encodingAESKey: "222",
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