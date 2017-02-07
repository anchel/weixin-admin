'use strict';

var async = require('async');
var filter = require('../../lib/filter');
var utilLibrary = require('../../lib/utilLibrary');
var wechatApi = require('../../lib/wechat/wechat-api');
var ResponseError = require('../../errors/ResponseError');
var Logger = require('../../lib/logger');
var operatelogService = require('../../services/operatelogService');
var log = Logger.getLogger();
var autoreply_conf = require('../../models/autoreply_conf');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['zdhf']
    });

    router.get('/', fns, function (req, res) {
        var type = req.query.type || 1; //1-被添加 2-消息 3-关键词
        var tplPath = 'autoreply/index';
        if(type == 2){
            tplPath = 'autoreply/msgreply';
        }else if(type == 3){
            tplPath = 'autoreply/wordsreply';
        }
        res.render(tplPath);
    });

    router.post('/savedata', fns, function(req, res){
        var id = req.body.id;
        if(id != undefined){
            id = parseInt(id, 10);
        }
        var type = req.body.type;
        var reply_content = req.body.reply_content;
        var reply_rule_name = req.body.reply_rule_name;
        var reply_rule_keywords = req.body.reply_rule_keywords;
        var reply_rule_keywords_def = req.body.reply_rule_keywords_def;

        savedata({
            id: id,
            type: type,
            reply_content: reply_content,
            reply_rule_name: reply_rule_name,
            reply_rule_keywords: reply_rule_keywords,
            reply_rule_keywords_def: reply_rule_keywords_def
        }, function(err){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, null);
            }
            operatelogService.addLog(req, res, {
                status: err ? 1 : 0
            });
        });
    });

    router.get('/getdata', fns, function(req, res){
        var type = req.query.type;

        getdata(type, function(err, d){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, d);
            }
        });
    });

    router.post('/deldata', fns, function(req, res){
        var type = req.body.type;
        var id = req.body.id;

        deldata(type, id, function(err, d){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, d);
            }
            operatelogService.addLog(req, res, {
                status: err ? 1 : 0
            });
        });
    });

    router.get('/getlistdata', fns, function(req, res){
        var type = req.query.type;
        var count = req.query.count || 20;
        var page = req.query.page || 0;
        count = parseInt(count, 10);
        page = parseInt(page, 10);
        var offset = page * count;

        getlistdata(type, offset, count,function(err, d){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, d);
            }
        });
    });

    function getdata(type, callback){
        autoreply_conf.findOne({
            where: {
                type: type
            }
        }).then(function(row){
            if(row){
                callback(null, {
                    id: row.get('id'),
                    type: row.get('type'),
                    keyid: row.get('keyid'),
                    keyname: row.get('keyname'),
                    reply_content: row.get('reply_content'),
                    reply_media_id: row.get('reply_media_id'),
                    reply_rule_name: row.get('reply_rule_name'),
                    reply_rule_keywords: row.get('reply_rule_keywords'),
                    reply_rule_keywords_def: row.get('reply_rule_keywords_def')
                });
            } else {
                callback(null);
            }
        }).catch(function(err){
            callback(err);
        });
    }

    function savedata(values, callback){
        autoreply_conf.upsert(values, {
            id: values.id
        }).then(function(){
            callback(null);
        }).catch(function(err){
            callback(err);
        });
    }

    function deldata(type, id, callback){
        autoreply_conf.destroy({
            where: {
                type: type,
                id: id
            }
        }).then(function(){
            callback(null);
        }).catch(function(err){
            callback(err);
        });
    }

    function getlistdata(type, offset, limit, callback){
        autoreply_conf.findAndCountAll({
            where: {
                type: type
            },
            order: [
                ['ctime', 'desc']
            ],
            offset: offset,
            limit: limit
        }).then(function(ret){
            var rows = ret.rows;
            var count = ret.count;
            var rs = [];
            if(rows){
                rows.forEach(function(r){
                    var ro = {
                        id: r.get('id'),
                        type: r.get('type'),
                        keyid: r.get('keyid'),
                        keyname: r.get('keyname'),
                        reply_content: r.get('reply_content'),
                        reply_media_id: r.get('reply_media_id'),
                        reply_rule_name: r.get('reply_rule_name'),
                        reply_rule_keywords: r.get('reply_rule_keywords'),
                        reply_rule_keywords_def: r.get('reply_rule_keywords_def')
                    };
                    rs.push(ro);
                });
            }
            callback(null, {
                total_count: count,
                list: rs
            })
        }).catch(function(err){
            callback(err);
        });
    }
};
