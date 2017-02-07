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
var t_template_list = require('../../models/template_list');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['templatemsg']
    });

    router.get('/', fns, function (req, res) {
        res.render('template/templatelist/main');
    });
    
    router.get('/getdata', fns, function(req, res){
        
        getlistdata(function(err, d){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, d);
            }
        });
        
    });
    
    router.post('/deldata', fns, function(req, res){
        var id = req.body.id;
        
        deldata(id, function(err, d){
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
    
    router.post('/savedata', fns, function(req, res){
        var id = req.body.id;
        if(id != undefined && id !== '' && !isNaN(id)){
            id = parseInt(id, 10);
        }
        var type            = req.body.type;
        var title           = req.body.title;
        var rel_template_id = req.body.rel_template_id;
        var data_desc       = req.body.data_desc;
        
        function savedb(callback){
            var data = {
                id: id,
                type: type,
                title: title,
                rel_template_id: rel_template_id,
                data_desc: data_desc
            };
            savedata(data, callback);
        }
        
        var fns = [savedb];
        
        async.waterfall(fns, function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            } else {
                utilLibrary.outputJsonResult(req, res, ret);
            }
            operatelogService.addLog(req, res, {
                status: err ? 1 : 0
            });
        })
    });
    
    function savedata(values, callback){
        t_template_list.upsert(values, {
            id: values.id
        }).then(function(){
            callback(null);
        }).catch(function(err){
            callback(err);
        });
    }
    
    function deldata(id, callback){
        t_template_list.destroy({
            where: {
                id: id
            }
        }).then(function(){
            callback(null);
        }).catch(function(err){
            callback(err);
        });
    }
    
    function getlistdata(callback){
        t_template_list.findAndCountAll({
            order: [
                ['ctime', 'desc']
            ]
        }).then(function(ret){
            var rows = ret.rows;
            var count = ret.count;
            var rs = [];
            if(rows){
                rows.forEach(function(r){
                    var ro = {
                        id: r.get('id'),
                        type: r.get('type'),
                        title: r.get('title'),
                        rel_template_id: r.get('rel_template_id'),
                        data_desc: r.get('data_desc'),
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