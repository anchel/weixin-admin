var config = require('config');
var _ = require('lodash');
var config = require('config');
var utilLibrary = require('../lib/utilLibrary');
var wechatApi = require('../lib/wechat/wechat-api');
var requestLibrary = require('../lib/requestLibrary');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');

var log = Logger.getLogger();

module.exports = {

    /**
     * 获取公众号上用户的信息，如果没关注公众号，只能获取到unionid
     * @param params
     * {
     *     openid: ''
     * }
     * @param callback
     */
    get_gzh_userinfo: function (params, callback) {
        /** https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
         *
         {
           "subscribe": 1,
           "openid": "o6_bmjrPTlm6_2sgVt7hMZOPfL2M",
           "nickname": "Band",
           "sex": 1,
           "language": "zh_CN",
           "city": "广州",
           "province": "广东",
           "country": "中国",
           "headimgurl":  "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
          "subscribe_time": 1382694957,
          "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"
          "remark": "",
          "groupid": 0,
          "tagid_list":[128,2]
        }
         */
        wechatApi.getUser({
            openid: params.openid,
            lang: 'zh_CN'
        }, callback);
    },

    /**
     * 用户通过网页收取后，根据code去获取access_token和openid
     * params = {
     *     code: ''
     * }
     */
    get_access_token_openid: function (params, callback) {
        var me = this;
        requestLibrary.request({
            url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
            method: 'get',
            json: true,
            timeout: 10000,
            qs: {
                appid: config.get('wechatConfig.appid'),
                secret: config.get('wechatConfig.appsecret'),
                code: params.code,
                grant_type: 'authorization_code'
            }
        }, function(err, body) {
            if(err){
                callback(err);
            } else {
                if(body.errcode){
                    callback(body);
                } else {
                    if(body.scope === 'snsapi_userinfo') {
                        me.get_oauth_userinfo({
                            access_token: body.access_token,
                            openid: body.openid
                        }, function(err2, body2){
                            if(err2){
                                callback(err2);
                            } else {
                                _.extend(body, body2);
                                callback(null, body);
                            }
                        });
                    } else {
                        me.get_gzh_userinfo({
                            openid: body.openid
                        }, function(err3, body3){
                            if(err3){
                                callback(err3);
                            } else {
                                _.extend(body, body3);
                                callback(null, body);
                            }
                        });
                    }
                }
            }
        });
    },

    /**
     * 用户通过网页授权后，根据access_token和openid来获取用户信息
     * @param params
     * {
     *     access_token: '',
     *     openid: ''
     * }
     * @param callback
     */
    get_oauth_userinfo: function (params, callback) {
        /** https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
         *
         * {
         "openid":" OPENID",
         "nickname": NICKNAME,
         "sex":"1",
         "province":"PROVINCE"
         "city":"CITY",
         "country":"COUNTRY",
         "headimgurl":    "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
        "privilege":[ "PRIVILEGE1" "PRIVILEGE2"     ],
         "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"
        }
         */
        requestLibrary.request({
            url: 'https://api.weixin.qq.com/sns/userinfo',
            method: 'get',
            json: true,
            timeout: 10000,
            qs: {
                access_token: params.access_token,
                openid: params.openid,
                lang: 'en'
            }
        }, function(err, body) {
            if(err){
                callback(err);
            } else {
                if(body.errcode){
                    callback(body);
                } else {
                    callback(null, body);
                }
            }
        });
    },

    /**
     * 检查access_token和openid是否合法
     * @param params
     */
    checkAccessToken: function (params, callback) {
        requestLibrary.request({
            url: 'https://api.weixin.qq.com/sns/auth',
            method: 'get',
            json: true,
            timeout: 5000,
            qs: params
        }, function(err, body) {
            if(err){
                callback(err);
            } else {
                if(body.errcode){
                    callback(body);
                } else {
                    callback(null, body);
                }
            }
        });
    }
};
