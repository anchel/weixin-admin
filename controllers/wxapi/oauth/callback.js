'use strict';

var config = require('config');
var _ = require('lodash');

var utilLibrary = require('../../../lib/utilLibrary');
var wechatUtil = require('../../../lib/wechat/wechat_util');
var wechatService = require('../../../services/wechatService');
var portalService = {
    wechatLogin: function () {},

};
var tbl_state_url_map = require('../../../models/state_url_map');

module.exports = function (router) {

    /**
     * oauth授权回调接口
     * rurl 回去的URL地址
     * forlogin 1-带注册登录 0-普通授权
     * scope snsapi_base，snsapi_userinfo
     * code
     * state
     */
    router.get('/', function(req, res){
        var rurl = req.query.rurl;
        var forlogin = req.query.forlogin;
        var scope = req.query.scope;

        var code = req.query.code;
        var state = req.query.state;

        var errmsg = wechatUtil.checkValidUrl(rurl);
        if (errmsg) {
            res.send(errmsg);
            return false;
        }

        wechatService.get_access_token_openid({code: code}, function(err, oauthuserinfo){
            if(err){
                res.send(err.toString());
                return false;
            }else{

                if(forlogin){  //需要登录

                    portalService.wechatLogin(oauthuserinfo, function(pterr, retobj) {

                        if (!pterr) {
                            var toUrl = utilLibrary.fillUrl(rurl, {
                                userid: retobj.userId,
                                token: retobj.token,
                                appid: config.get('wechatConfig.appid'),
                                openid: oauthuserinfo.openid,
                                unionid: oauthuserinfo.unionid,
                                access_token: oauthuserinfo.access_token,
                                nickname: oauthuserinfo.nickname,
                                headimgurl: oauthuserinfo.headimgurl,
                                sex: oauthuserinfo.sex,
                                country: oauthuserinfo.country,
                                province: oauthuserinfo.province,
                                city: oauthuserinfo.city,
                                language: 'zh_CN'
                            });
                            res.cookie('userid', retobj.userId, {domain: '.anchel.com'});
                            res.cookie('skey', retobj.token, {domain: '.anchel.com'});
                            res.redirect(toUrl);
                        } else {
                            if(retobj && retobj.status === 500 && retobj.code === '100'){  //跳转到绑定手机号
                                getUrlByState(state, function(err2, rowurl) {
                                    if(err2){
                                        res.send(err2.toString());
                                        return false;
                                    }else{
                                        var toUrl = utilLibrary.fillUrl(rowurl, {
                                            rurl: rurl,
                                            appid: config.get('wechatConfig.appid'),
                                            openid: oauthuserinfo.openid,
                                            unionid: oauthuserinfo.unionid,
                                            access_token: oauthuserinfo.access_token,
                                            nickname: oauthuserinfo.nickname,
                                            headimgurl: oauthuserinfo.headimgurl,
                                            sex: oauthuserinfo.sex,
                                            country: oauthuserinfo.country,
                                            province: oauthuserinfo.province,
                                            city: oauthuserinfo.city,
                                            language: 'zh_CN'
                                        });
                                        res.redirect(toUrl);
                                    }
                                });
                            } else {
                                res.send(pterr.toString() + retobj ? '('+retobj.toString()+')' : '');
                                return false;
                            }
                        }
                    });

                } else {
                    var toUrl = utilLibrary.fillUrl(rurl, {
                        appid: config.get('wechatConfig.appid'),
                        openid: oauthuserinfo.openid,
                        unionid: oauthuserinfo.unionid,
                        access_token: oauthuserinfo.access_token,
                        nickname: oauthuserinfo.nickname,
                        headimgurl: oauthuserinfo.headimgurl,
                        sex: oauthuserinfo.sex,
                        country: oauthuserinfo.country,
                        province: oauthuserinfo.province,
                        city: oauthuserinfo.city,
                        language: 'zh_CN'
                    });

                    res.redirect(toUrl);
                }
            }
        });

    });

    function getUrlByState(state, callback){
        var inArr = ['default'];
        if(state){
            inArr.push(state);
        }
        tbl_state_url_map.findAll({
            where: {
                state: {
                    $in: inArr
                }
            }
        }).then(function(rows){
            if(rows && rows.length > 0){
                var dataMap = {};
                rows.forEach(function(row){
                    dataMap[row.get('state')] = row;
                });
                var curObj = dataMap[state] || dataMap['default'];

                callback(null, curObj.get('url'));
            } else {
                callback('can not find row in state_url_map');
            }
        }).catch(function(err){
            callback(err);
        });
    }
};
