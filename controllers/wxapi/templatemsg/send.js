'use strict';

var urllib = require('url');
var qs = require('qs');
var config = require('config');
var async = require('async');
var validator_lib = require('../../../lib/validator_lib');
var utilLibrary = require('../../../lib/utilLibrary');
var wechatService = require('../../../services/wechatService');
var templateService = require('../../../services/templateService');
var operatelogService = require('../../../services/operatelogService');
var ResponseError = require('../../../errors/ResponseError');
var Logger = require('../../../lib/logger');
var Filter = require('../../../lib/filter');
var _ = require('lodash');
var t_template_list = require('../../../models/template_list');
var log = Logger.getLogger();

module.exports = function (router) {
    
    var fns = Filter(['checksign']);

    /**
     * 发送模板消息
     */
    router.get('/', fns, function(req, res){
        var platform = 'MALL';
        var type = req.query.type;
        if (!type) {
            utilLibrary.outputJsonResult(req, res, new ResponseError('参数type不能为空'));
            return;
        }
        
        function getTemplate (cb) {
            t_template_list.findOne({
                where: {
                    type: type
                }
            }).then(function (row) {
                if (row) {
                    var retobj = {
                        id: row.get('id'),
                        type: row.get('type'),
                        title: row.get('title'),
                        rel_template_id: row.get('rel_template_id'),
                        data_desc: row.get('data_desc')
                    };
                    if (retobj.data_desc) {
                        try{
                            retobj.data_desc = JSON.parse(retobj.data_desc);
                        } catch (e) {
                            retobj.data_desc = [];
                        }
                    }
                    cb(null, retobj);
                } else {
                    cb('type ' + type + ' 未能查到数据')
                }
            }).catch(function(e){
                cb(e);
            })
        }
        
        function sendMsg (templateobj, cb) {
            var errmsg = '';
            var openid = req.query.openid;
            var url    = req.query.url;
            var template_id = templateobj.rel_template_id;
            if (!openid) {
                errmsg += 'openid can not be empty; ';
            }
            if (!url) {
                errmsg += 'url can not be empty;';
            }
            if (errmsg) {
                cb(errmsg);
                return;
            }
            
            var params = {};
            templateobj.data_desc.forEach(function (item) {
                var keyword = item.keyword;
                var param_name = item.param_name || keyword;
                if (req.query[param_name] === undefined || req.query[param_name] === '') {
                    errmsg += 'param ' + param_name + ' can not be empty;';
                }
                params[keyword] = {
                    value: req.query[param_name],
                    color: item.color
                }
            });
            
            if (errmsg) {
                cb(errmsg);
                return;
            }
    
            templateService.sendTemplateMsg({
                platform: platform,
                touser: openid,
                template_id: template_id,
                url: url,
                data: params
            }, function (err, ret) {
                var flowparams = {
                    platform: platform,
                    touser: openid,
                    template_id: template_id,
                    url: url,
                    data: params,
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
                
                cb(err, ret);
            })
        }
        
        async.waterfall([getTemplate, sendMsg], function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            } else {
                if (ret.errcode === 0) {
                    utilLibrary.outputJsonResult(req, res, {
                        msgid: ret.msgid
                    });
                } else {
                    utilLibrary.outputJsonResult(req, res, new ResponseError({code: ret.errcode, msg: ret.errmsg}));
                }
            }
        })
        
    });

};
