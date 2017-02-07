'use strict';

var path = require('path');
var fs = require('fs');
var filter = require('../../../lib/filter');
var utilLibrary = require('../../../lib/utilLibrary');
var wechatApi = require('../../../lib/wechat/wechat-api');
var ResponseError = require('../../../errors/ResponseError');
var Logger = require('../../../lib/logger');
var materialService = require('../../../services/materialService');
var log = Logger.getLogger();

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['material']
    });

    router.post('/common', fns, function (req, res) {
        if(!req.files || !req.files.length){
            utilLibrary.outputJsonResult(req, res, new ResponseError('参数不正确'));
            return;
        }
        var type = req.query.type;
        var fileobj = req.files[0];
        console.log(fileobj);
        var oriName = fileobj.originalname;
        var extName = path.extname(oriName);
        var filepath = fileobj.path;
        var filename = fileobj.filename;
        var filepath_new = path.join(path.dirname(filepath), path.basename(oriName, extName) + '-' + filename.substring(0, 5) + extName);

        fs.rename(filepath, filepath_new, function(err){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()))
            } else {
                var localPath = path.resolve(filepath_new);

                materialService.uploadMaterialCommon(localPath, extName, type, function(err, upret){
                    if(err){
                        utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()))
                    }else{
                        utilLibrary.outputJsonResult(req, res, upret)
                    }
                })
            }
        });

    });
};
