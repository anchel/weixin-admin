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
var t_operate_log = require('../../models/operate_log');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['admin']
    });

    router.get('/', fns, function (req, res) {
        res.render('admin/operatelog');
    });

    router.get('/getdata', fns, function(req, res){
        var actionName = req.query.action_name;
        var count = req.query.count || 20;
        var page = req.query.page || 0;
        count = parseInt(count, 10);
        page = parseInt(page, 10);
        var offset = page * count;

        getlistdata(offset, count,function(err, d){
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            } else {
                utilLibrary.outputJsonResult(req, res, d);
            }
        });

    });

    function getlistdata(offset, limit, callback){
        t_operate_log.findAndCountAll({
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
                        userid: r.get('userid'),
                        email: r.get('email'),
                        url: r.get('url'),
                        url_params: r.get('url_params'),
                        interface: r.get('interface'),
                        interface_params: r.get('interface_params'),
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