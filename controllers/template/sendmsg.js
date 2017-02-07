/**
 * Created by Anchel on 2016/11/27.
 */

var async = require('async');
var _ = require('lodash');
var filter = require('../../lib/filter');
var utilLibrary = require('../../lib/utilLibrary');
var ResponseError = require('../../errors/ResponseError');
var wechatApi = require('../../lib/wechat/wechat-api');
var templateService = require('../../services/templateService');
var operatelogService = require('../../services/operatelogService');
var Logger = require('../../lib/logger');
var log = Logger.getLogger();

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['templatemsg']
    });

    router.get('/', fns, function (req, res) {
        res.render('template/msg/sendmsg');
    });

    router.post('/send', fns, function (req, res) {
        var platform = 'WXADMIN';
        var touser = req.body.touser;
        var template_id = req.body.template_id;
        var url = req.body.url;
        var data = req.body.data;
        if (!touser || !template_id || !url || !data) {
            utilLibrary.outputJsonResult(req, res, new ResponseError('参数信息不完整'));
            return;
        }

        templateService.sendTemplateMsg({
            platform: platform,
            touser: touser,
            template_id: template_id,
            url: url,
            data: data
        }, function (err, ret) {
            var flowparams = {
                platform: platform,
                touser: touser,
                template_id: template_id,
                url: url,
                data: data,
                status: 0,
                msgid: 0
            };
            if (err) {
                flowparams.status = 1;
            } else {
                if (ret.errcode === 0) {
                    flowparams.msgid = ret.msgid;
                } else {
                    flowparams.status = 1;
                }
            }
            templateService.addSendFlow(flowparams, function (err) {
                if (err) {
                    log.error(__filename, 'templateService.addSendFlow', JSON.stringify(flowparams));
                } else {
                    log.info(__filename, 'templateService.addSendFlow', JSON.stringify(flowparams));
                }
            });

            operatelogService.addLog(req, res, {
                interface: 'templateService.addSendFlow',
                interface_params: flowparams,
                status: flowparams.status
            });

            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            } else {
                if (ret.errcode === 0) {
                    utilLibrary.outputJsonResult(req, res, ret);
                } else {
                    utilLibrary.outputJsonResult(req, res, new ResponseError({code: ret.errcode, msg: ret.errmsg}));
                }
            }
        })
    });
};