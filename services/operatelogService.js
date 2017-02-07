var config = require('config');
var _ = require('lodash');
var config = require('config');
var utilLibrary = require('../lib/utilLibrary');
var wechatApi = require('../lib/wechat/wechat-api');
var requestLibrary = require('../lib/requestLibrary');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');
var t_operate_log = require('../models/operate_log');
var log = Logger.getLogger();

module.exports = {

    addLog: function (req, res, params, callback) {
        params = params || {};
        params.userid = req.cookies.oa_user_id;
        params.url = req.baseUrl + req.path;
        params.url_params = JSON.stringify({
            query: req.query,
            body: req.body
        });
        if (params.interface_params && typeof(params.interface_params) !== 'string') {
            params.interface_params = JSON.stringify(params.interface_params);
        }

        t_operate_log.create(params).then(function () {
            callback && callback(null);
        }).catch(function (e) {
            callback && callback(e);
        });
    }
};
