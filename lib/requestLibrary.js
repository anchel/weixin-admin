'use strict';

var request = require('request');
var log = require('./logger').getLogger();

var _lib = {
    /**
     * 用于普通的请求
     * @param options
     * @param callback
     */
    request: function(options, callback) {
        var timeStart = new Date();
        request(options, function(err, httpResponse, body) {
            var timeEnd = new Date();
            log.info('requestLibray.request [%d] %s %d %s', timeEnd-timeStart, !err, httpResponse?httpResponse.statusCode:0, options.url);
            callback(err, body, httpResponse);
        });
    },

    /**
     * 专门用于调用后台api接口的请求方法
     * @param options
     * @param callback
     */
    portalWebRequest: function(options, callback) {
        var timeStart = new Date();
        request(options, function(err, httpResponse, body) {
            var timeEnd = new Date();
            log.info('requestLibray.portalWebRequest [%d] %s %d %s', timeEnd-timeStart, !err, httpResponse?httpResponse.statusCode:0, options.url);
            callback(err, body, httpResponse);
        });
    },

    /**
     * 用于调用微信api接口的请求方法
     * @param options
     * @param callback
     */
    wechatRequest: function(options, callback) {
        var timeStart = new Date();
        request(options, function(err, httpResponse, body) {
            var timeEnd = new Date();
            log.info('requestLibray.wechatRequest [%d] %s %d %s', timeEnd-timeStart, !err, httpResponse?httpResponse.statusCode:0, options.url);
            callback(err, body, httpResponse);
        });
    }
};
module.exports = _lib;