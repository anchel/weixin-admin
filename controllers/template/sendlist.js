/**
 * Created by Anchel on 2016/11/27.
 */

var async = require('async');
var _ = require('lodash');
var filter = require('../../lib/filter');
var utilLibrary = require('../../lib/utilLibrary');
var ResponseError = require('../../errors/ResponseError');
var wechatApi = require('../../lib/wechat/wechat-api');
var operatelogService = require('../../services/operatelogService');
var t_template_msg_send_flow = require('../../models/template_msg_send_flow');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['templatemsg']
    });

    router.get('/', fns, function (req, res) {
        res.render('template/msg/sendlist');
    });

    router.get('/getdata', fns, function(req, res){
        var actionName = req.query.action_name;
        var count = req.query.count || 20;
        var page = req.query.page || 0;
        count = parseInt(count, 10);
        page = parseInt(page, 10);
        var offset = page * count;

        getlistdata(offset, count,function(err, d){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, d);
            }
        });

    });

    function getlistdata(offset, limit, callback){
        t_template_msg_send_flow.findAndCountAll({
            where: {

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
                        platform: r.get('platform'),
                        touser: r.get('touser'),
                        template_id: r.get('template_id'),
                        url: r.get('url'),
                        data: r.get('data'),
                        msgid: r.get('msgid'),
                        status: r.get('status'),
                        ctime: r.get('ctime')
                    };

                    if(ro.ctime){
                        ro.ctime = ro.ctime.format('yyyy-MM-dd hh:mm:ss')
                    }
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