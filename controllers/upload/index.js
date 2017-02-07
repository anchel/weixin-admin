'use strict';

var config = require('config');
var path = require('path');
var utilLibrary = require('../../lib/utilLibrary');
var wechatApi = require('../../lib/wechat/wechat-api');
var ResponseError = require('../../errors/ResponseError');
var Logger = require('../../lib/logger');
var log = Logger.getLogger();


module.exports = function (router) {

    /**
     * 上传图片
     */
    router.post('/uploadimg', function (req, res) {
        if(!req.files || !req.files.length){
            utilLibrary.outputJsonResult(req, res, new ResponseError('参数不正确'));
            return;
        }
        var fileobj = req.files[0];
        var oriName = fileobj.originalname;
        var extName = oriName.substring(oriName.indexOf('.'));
        var filepath = fileobj.path;

        var localPath = path.resolve(filepath);
        var remotePath = [config.get('imageFtpConfig.basedir'), utilLibrary.getDateDirName(), fileobj.filename + extName].join('/');
        var httpPath = [config.get('imageFtpConfig.httpprefix'), utilLibrary.getDateDirName(), fileobj.filename + extName].join('/');

        utilLibrary.uploadImageFile(localPath, remotePath, function(err) {
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError('文件上传失败，请重试:' + err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, {
                    url: httpPath
                });
            }
        });
    });

};
