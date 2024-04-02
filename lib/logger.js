'use strict';

var config = require('config');
var log4js = require('log4js');

var logConfig = config.get('logConfig');

log4js.configure({
    appenders: {
        console: { type: "console" },
        access: { type: "file", filename: logConfig.accessLogPath },
        normal: { type: "file", filename: logConfig.normalLogPath },
    },
    categories: {
        default: { appenders: ["console"], level: "info" },
        access: { appenders: ["access"], level: "info" },
        normal: { appenders: ["normal"], level: "info" }
    },
    replaceConsole: false
});

module.exports = {
    getLogger: function() {
        var logger = log4js.getLogger('normal');
        return logger;
    },
    
    getExpressLogger: function() {
        return log4js.connectLogger(log4js.getLogger('access'), {level:'auto'});
    }
};
