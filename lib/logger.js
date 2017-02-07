'use strict';

var config = require('config');
var log4js = require('log4js');

var logConfig = config.get('logConfig');

log4js.configure({
    appenders: [
        {
            type: 'console'
        },{
            type: 'file',
            filename: logConfig.accessLogPath,
            maxLogSize: 1024000000,
            backups:4,
            category: 'access'
        },{
            type: 'file',
            filename: logConfig.normalLogPath,
            maxLogSize: 1024000000,
            backups:4,
            category: 'normal'
        }
    ],
    replaceConsole: false
});

module.exports = {
    getLogger: function() {
        var logger = log4js.getLogger('normal');
        logger.setLevel('DEBUG');
        return logger;
    },
    
    getExpressLogger: function() {
        return log4js.connectLogger(log4js.getLogger('access'), {level:'auto'});
    }
};
