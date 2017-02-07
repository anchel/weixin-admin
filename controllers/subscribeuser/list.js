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
var t_subscribe_user = require('../../models/subscribe_user');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['subscribeuser']
    });

    router.get('/', fns, function (req, res) {
        res.render('subscribeuser/list/main');
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
        t_subscribe_user.findAndCountAll({
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
                        subscribe: r.get('subscribe'),
                        openid: r.get('openid'),
                        unionid: r.get('unionid'),
                        nickname: r.get('nickname'),
                        sex: r.get('sex'),
                        headimgurl: r.get('headimgurl'),
                        subscribe_scene_id: r.get('subscribe_scene_id'),
                        mtime: r.get('mtime'),
                        ctime: r.get('ctime')
                    };
                    if(ro.mtime){
                        ro.mtime = ro.mtime.format('yyyy-MM-dd hh:mm:ss')
                    }
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