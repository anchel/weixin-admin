'use strict';

var config = require('config');
var _ = require('lodash');
var qs = require('qs');
var utilLibrary = require('../../../lib/utilLibrary');
var requestLibrary = require('../../../lib/requestLibrary');
var wechatApi = require('../../../lib/wechat/wechat-api');
var wechatUtil = require('../../../lib/wechat/wechat_util');
var wechatService = require('../../../services/wechatService');
var portalService = {
    wechatLogin: function () {},

};
var tbl_state_url_map = require('../../../models/state_url_map');
var ResponseError = require('../../../errors/ResponseError');
var Logger = require('../../../lib/logger');
var log = Logger.getLogger();

var APIKEY = config.get('securityConfig.signApiKey');

module.exports = function (router) {

    /**
     * oauth授权回调接口
     * rurl 回去的URL地址
     * forlogin 1-带注册登录 0-普通授权
     * scope snsapi_base，snsapi_userinfo
     * pay_redirect 1-来自pay-app的跳转
     * code
     * state
     */
    router.get('/', function(req, res){
        var rurl = req.query.rurl;
        var forlogin = req.query.forlogin;
        var scope = req.query.scope;
        var pay_redirect = req.query.pay_redirect;

        var code = req.query.code;
        var state = req.query.state;

        var errmsg = wechatUtil.checkTeshehuiUrl(rurl);
        if (errmsg) {
            res.send(errmsg);
            return false;
        }

        // if (pay_redirect === '1') {
        //     var params = qs.stringify({
        //         returnUrl: rurl,
        //         code: code,
        //         state: state
        //     });
        //     var oldbackurl = 'http://pay-app.anchel.com/wxOAuth/wxUserAuthCallback.action?' + params;
        //     res.redirect(oldbackurl);
        //     return;
        // }

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

                    // 兼容pay-app的跳转
                    if (pay_redirect === '1') {
                        var wxuserdata = getWxUserData(oauthuserinfo);
                        var commparam = getCommonParam(wxuserdata);
                        var params = {};
                        _.extend(params, commparam, wxuserdata);
                        toUrl = utilLibrary.fillUrl(rurl, params);
                    }

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

    function getWxUserData (oauthuserinfo) {
        return {
            wx: {
                open_id: oauthuserinfo.openid,
                union_id: oauthuserinfo.unionid,
                head_image_url: oauthuserinfo.headimgurl,
                nick_name: oauthuserinfo.nickname,
                sex: oauthuserinfo.sex,
                language: 'zh_CN',
                country: oauthuserinfo.country,
                province: oauthuserinfo.province,
                city: oauthuserinfo.city
            }
        };
    }

    function getCommonParam (wxuserdata) {
        var ts = Math.round(Date.now() / 1000);
        //ts = 1477300531;
        var sign = getSign(wxuserdata, APIKEY, ts);
        return {
            sign: sign,
            timestamp: ts,
            encoding: 'UTF-8'
        }
    }

    function getSign (wxuserdata, apikey, timestamp) {
        var wxdata = wxuserdata.wx;
        // wxdata.open_id = 'ouxvejsBpdBzvPmdMsi0s0DyD8Kw';
        // wxdata.head_image_url = 'http://wx.qlogo.cn/mmopen/weUGTW26mH2d1PAKlQKg4VCpPXPYxg4HD0Fa6ZKM0ic08rTT9hxPmIGr0N6Y9HbrsQ4ruJicV197ML9vZ0wu6RuE7zqSKpw8Uj/0';
        // wxdata.country = 'CN';
        var valArr = [];
        for(var p in wxdata){
            if (wxdata.hasOwnProperty(p)) {
                var v = wxdata[p];
                if( !(v === null || v === undefined || v === '') ){
                    valArr.push(v);
                }
            }
        }

        valArr.sort(function (a, b) {
            if(!isNaN(a) && !isNaN(b)){
                if(a.indexOf('0') == 0 || b.indexOf('0') == 0){
                    return comp(a, b);
                } else {
                    return parseFloat(a) - parseFloat(b);
                }
            } else if (!isNaN(a)) {
                return -1;
            } else if (!isNaN(b)) {
                return 1;
            } else {
                return comp(a, b);
            }
        });
        var cstr = apikey + valArr.join('') + timestamp;
        return utilLibrary.md5(cstr);
    }

    function comp(a, b){
        if(a > b){
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    }
};
