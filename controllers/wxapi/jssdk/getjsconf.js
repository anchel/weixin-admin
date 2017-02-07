'use strict';

var utilLibrary = require('../../../lib/utilLibrary');
var wechatApi = require('../../../lib/wechat/wechat-api');
var ResponseError = require('../../../errors/ResponseError');
var Logger = require('../../../lib/logger');
var log = Logger.getLogger();

module.exports = function (router) {

    /**
     * 获取jssdk.config所需的参数
     */
    router.get('/', function(req, res){
        var url = req.query.url;
        var debug = req.query.debug === '1';
        var jsApiListStr = req.query.jsapilist || 'onMenuShareTimeline,onMenuShareAppMessage,onMenuShareQQ'; // 给几个默认值吧
        var jsApiList = jsApiListStr.split(',');

        wechatApi.getJsConfig({
            url: url,
            debug: debug,
            jsApiList: jsApiList
        }, function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(ResponseError.WECHAT_REQUEST_ERR));
            } else {
                utilLibrary.outputJsonResult(req, res, ret);
            }
        });
    });

};
