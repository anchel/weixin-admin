var config = require('config');
var _ = require('lodash');
var async = require('async');
var utilLibrary = require('../lib/utilLibrary');
var requestLibrary = require('../lib/requestLibrary');
var wechatApi = require('../lib/wechat/wechat-api');
var Logger = require('../lib/logger');
var t_media_local_url = require('../models/media_local_url');
var log = Logger.getLogger();

module.exports = {

    getMediaDetailByIds: function(ids, callback) {
        t_media_local_url.findAll({
            where: {
                media_id: {
                    $in: ids
                }
            }
        }).then(function(rs){
            var rsd = [];
            rs.forEach(function(r){
                rsd.push({
                    id: r.get('id'),
                    media_id: r.get('media_id'),
                    media_name: r.get('media_name'),
                    media_url: r.get('media_url'),
                    update_time: r.get('update_time'),
                    local_url: r.get('local_url')
                });
            });
            callback(null, rsd);
        }).catch(function(err){
            callback(err);
        });
    },

    /**
     * 上传图片，语音，缩略图
     * @param localPath
     * @param type
     */
    uploadMaterialCommon: function(localPath, extname, type, callback){
        console.log(localPath, extname, type);
        var _self = this;
        wechatApi.uploadMaterial(localPath, type, function(err, ret){
            if(err){
                callback(err);
            } else {
                var media_id = ret.media_id;
                var url = ret.url;

                var filename = media_id + extname;
                _self.uploadMaterialCDN(localPath, filename, media_id, callback)
            }
        });
    },

    uploadMaterialCDN: function(filepath, filename, media_id, callback){
        var remotePath = [config.get('imageFtpConfig.basedir'), 'material/media', filename].join('/');
        var httpPath = [config.get('imageFtpConfig.httpprefix'), 'material/media', filename].join('/');

        utilLibrary.uploadImageFile(filepath, remotePath, function(err) {
            if(err){
                callback(err);
            }else{
                t_media_local_url.upsert({
                    media_id: media_id,
                    local_url: httpPath
                }, {
                    media_id: media_id
                }).then(function(){
                    callback(null, {
                        media_id: media_id,
                        url: httpPath
                    });
                }).catch(function(err){
                    callback(err);
                });

            }
        });
    }
};
