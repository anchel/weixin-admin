var config = require('config');
var _ = require('lodash');
var config = require('config');
var utilLibrary = require('../lib/utilLibrary');
var wechatApi = require('../lib/wechat/wechat-api');
var requestLibrary = require('../lib/requestLibrary');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');
var t_template_msg_send_flow = require('../models/template_msg_send_flow');
var log = Logger.getLogger();

module.exports = {

    sendTemplateMsg: function (params, callback) {
        var me = this;
        var platform = params.platform;
        var touser = params.touser;
        var template_id = params.template_id;
        var url = params.url;
        var data = params.data;

        var errmsg = '';
        if (typeof (data) == 'string') {
            try{
                data = JSON.parse(data);
            }catch(e){
                errmsg = '参数data不是有效的json字符串';
            }
        }
        if (errmsg) {
            callback(errmsg);
        } else {
            wechatApi.sendTemplate(touser, template_id, url, data, callback);
        }
    },

    addSendFlow: function (params, callback) {
        if (typeof(params.data) !== 'string') {
            params.data = JSON.stringify(params.data);
        }
        t_template_msg_send_flow.create(params).then(function () {
            callback(null);
        }).catch(function (e) {
            callback(e);
        });
    }
};
