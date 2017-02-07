'use strict';

var urllib = require('url');
var qs = require('qs');
var config = require('config');
var validator_lib = require('../../../lib/validator_lib');
var utilLibrary = require('../../../lib/utilLibrary');
var wechatService = require('../../../services/wechatService');
var ResponseError = require('../../../errors/ResponseError');
var Logger = require('../../../lib/logger');
var log = Logger.getLogger();

module.exports = function (router) {

    /**
     * 检查oauth授权后的access_token和openid是否合法
     */
    router.get('/', function(req, res){
        var access_token = req.query.access_token;
        var openid = req.query.openid;
        wechatService.checkAccessToken({
            access_token: access_token,
            openid: openid
        }, function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            } else {
                utilLibrary.outputJsonResult(req, res, null);
            }
        })
    });

};
