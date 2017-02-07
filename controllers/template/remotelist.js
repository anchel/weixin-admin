/**
 * Created by Anchel on 2016/11/27.
 */

var async = require('async');
var _ = require('lodash');
var filter = require('../../lib/filter');
var utilLibrary = require('../../lib/utilLibrary');
var ResponseError = require('../../errors/ResponseError');
var wechatApi = require('../../lib/wechat/wechat-api');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['templatemsg']
    });

    router.get('/', fns, function (req, res) {
        res.render('template/remotelist/main');
    });

    router.get('/getdata', fns, function (req, res) {
        wechatApi.getAllPrivateTemplate(function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            } else {
                utilLibrary.outputJsonResult(req, res, ret);
            }
        });
    });

    /**
     * 添加模板
     */
    router.post('/add', fns, function (req, res) {
        var templateIdShort = req.query.shorttid;
        wechatApi.addTemplate(templateIdShort, function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            } else {
                utilLibrary.outputJsonResult(req, res, ret);
            }
        });
    });

    /**
     * 删除模板
     */
    router.post('/delete', fns, function (req, res) {
        var tid = req.query.tid;
        wechatApi.delPrivateTemplate(tid, function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            } else {
                utilLibrary.outputJsonResult(req, res, ret);
            }
        });
    });
};