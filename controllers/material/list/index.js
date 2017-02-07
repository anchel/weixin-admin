/**
 * Created by Anchel on 2016/11/2.
 */
var path = require('path');
var fs = require('fs');
var os = require('os');
var config = require('config');
var filter = require('../../../lib/filter');
var utilLibrary = require('../../../lib/utilLibrary');
var wechatApi = require('../../../lib/wechat/wechat-api');
var ResponseError = require('../../../errors/ResponseError');
var materialService = require('../../../services/materialService');

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['material']
    });

    /**
     * 图文
     */
    router.get('/news', fns, function (req, res) {
        res.render('material/list/news', {

        });
    });

    /**
     * 图片
     */
    router.get('/image', fns, function (req, res) {
        res.render('material/list/image', {

        });
    });

    /**
     * 获取素材列表
     */
    router.get('/getdata', fns, function (req, res) {
        var type = req.query.type;
        var offset = req.query.offset || 0;
        var count = req.query.count || 30;

        wechatApi.getMaterials(type, offset, count, function (err, ret) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError({code: -1, msg: err.toString()}))
            } else {
                if (ret && ret.item) {
                    var ids = [];
                    ret.item.forEach(function(fi){
                        if(type === 'image'){
                            ids.push(fi.media_id);
                        } else if (type === 'news') {
                            if(fi.content && fi.content.news_item) {
                                fi.content.news_item.forEach(function(sfi){
                                    ids.push(sfi.thumb_media_id);
                                });
                            }
                        }
                    });
                    if(ids.length > 0){
                        materialService.getMediaDetailByIds(ids, function(err, rsd) {
                            if(err){
                                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
                            }else{
                                mergeMaterial(type, ret, rsd);
                                utilLibrary.outputJsonResult(req, res, ret);
                            }
                        })
                    } else {
                        utilLibrary.outputJsonResult(req, res, ret);
                    }
                } else {
                    utilLibrary.outputJsonResult(req, res, new ResponseError('返回的数据结构不完整'));
                }
            }
        });
    });

    /**
     * 获取素材，并上传到自己的CDN
     */
    router.get('/getmaterial', fns, function (req, res) {
        var media_id = req.query.media_id;
        wechatApi.getMaterial(media_id, function (err, buf, wres) {
            if (err) {
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
                return;
            }

            var contentType = wres.headers['content-type'];
            if (contentType === 'application/json' || contentType === 'text/plain') { //图文和错误情况的返回
                var retjson = {};
                try {
                    retjson = JSON.parse(buf);
                } catch (e) {
                    retjson = {errcode: -1, errmsg: ''}
                }
                if (retjson.errcode) {
                    utilLibrary.outputJsonResult(req, res, new ResponseError(buf.toString()))
                } else {
                    utilLibrary.outputJsonResult(req, res, retjson);
                }
            } else {
                var contentDisposition = wres.headers['content-disposition'];
                var extname = contentDisposition.substring(contentDisposition.indexOf('.'), contentDisposition.length - 1);

                var filename = media_id + extname;
                saveFileFromBuffer(buf, filename, function(er, filepath) {
                    if(er) {
                        utilLibrary.outputJsonResult(req, res, new ResponseError(er.toString()))
                    } else {
                        materialService.uploadMaterialCDN(filepath, filename, media_id, function(err, upret){

                            if(err){
                                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()))
                            }else{
                                utilLibrary.outputJsonResult(req, res, upret)
                            }
                        })
                    }

                });
            }

        });
    });

    /**
     * 删除永久素材
     */
    router.get('/delmaterial', fns, function(req, res) {
        var media_id = req.query.media_id;
        wechatApi.removeMaterial(media_id, function(err, ret){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()))
            } else {
                utilLibrary.outputJsonResult(req, res, ret)
            }
        });
    });

    function saveFileFromBuffer(buf, filename, callback){
        var tmpDirPath = os.tmpdir();
        var dirpath = path.resolve(tmpDirPath, 'wechat');
        var filepath = path.resolve(dirpath, filename);

        utilLibrary.mkdirParents(dirpath, function (err) {
            if(err){
                callback(err);
            } else {
                fs.writeFile(filepath, buf, function(err) {
                    callback(err, filepath);
                });
            }
        });
    }

    function mergeMaterial(type, wret, rsd){
        var mediaidMap = {};
        rsd.forEach(function(r){
            mediaidMap[r.media_id] = r;
        });
        if(wret && wret.item){
            wret.item.forEach(function(si){
                if(type === 'image'){
                    var mmo = mediaidMap[si.media_id] || {};
                    si.image_url = mmo.local_url || '';
                } else if (type === 'news') {
                    if(si.content && si.content.news_item) {
                        si.content.news_item.forEach(function(sfi){
                            var mmo = mediaidMap[sfi.thumb_media_id] || {};
                            sfi.image_url = mmo.local_url || '';
                        });
                    }
                }
            });
        }
    }
};