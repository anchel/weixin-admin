'use strict';

var urllib = require('url');
var qs = require('qs');
var config = require('config');
var validator_lib = require('../../../lib/validator_lib');
var utilLibrary = require('../../../lib/utilLibrary');
var wechatApi = require('../../../lib/wechat/wechat-api');
var wechatUtil = require('../../../lib/wechat/wechat_util');
var ResponseError = require('../../../errors/ResponseError');
var Logger = require('../../../lib/logger');
var log = Logger.getLogger();

var WX_OAUTH_START = 'https://open.weixin.qq.com/connect/oauth2/authorize';
var OAUTH_CALLBACK = config.get('hostConfig.wxapi') + '/wxapi/oauth/callback';

module.exports = function (router) {

    /**
     * oauth授权开始入口
     * rurl 回去的URL地址
     * scope snsapi_base，snsapi_userinfo
     * state  根据这个来决定回到哪个绑定页
     * forlogin 1-带注册登录 0-普通授权
     * pay_redirect 1-来自pay-app的跳转
     */
    router.get('/', function(req, res){
        var rurl = req.query.rurl;
        var scope = req.query.scope || 'snsapi_base';
        var state = req.query.state;
        var forlogin = req.query.forlogin;
        var pay_redirect = req.query.pay_redirect;

        var errmsg = wechatUtil.checkTeshehuiUrl(rurl);
        if (errmsg) {
            res.send(errmsg);
            return false;
        }

        var rurl_callback = OAUTH_CALLBACK + '?' + qs.stringify({rurl: rurl, forlogin: forlogin, scope: scope, pay_redirect: pay_redirect});
        // if (pay_redirect === '1') {
        //     rurl_callback = 'http://pay-app.teshehui.com/wxOAuth/wxUserAuthCallback.action?' + qs.stringify({
        //             returnUrl: rurl
        //         });
        // }

        var paramsStr = qs.stringify({
            appid: config.get('wechatConfig.appid'),
            redirect_uri: rurl_callback,
            response_type: 'code',
            scope: scope,
            state: state
        });

        var toUrl = WX_OAUTH_START + '?' + paramsStr + '#wechat_redirect';
        res.redirect(toUrl);
    });

};
