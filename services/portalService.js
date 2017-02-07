var config = require('config');
var _ = require('lodash');
var utilLibrary = require('../lib/utilLibrary');
var requestLibrary = require('../lib/requestLibrary');
var portalHost = config.get('hostConfig.portalapi');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');

var log = Logger.getLogger();

var APPID = config.get('wechatConfig.appid');
var BASE_URL_PATH = portalHost + '/client';

var _Service = {

    /**
     *
     * @param params
     * {
     *     openid: '',
     *     unionid: '',
     *     access_token: '',
     *     appid: '',
     *     ...
     * }
     * @param callback
     */
	wechatLogin: function (params, callback) {
        var defaultParams = {
            clientType: 'WAP',
            version: '1.0.0',
            url: '/thirdparty/userLogin',
            requestClassName: 'com.teshehui.portal.client.user.request.PortalThirdpartyUserLoginRequest',
            clientVersion: '',
            timestamp: Date.now(),
            businessType: '01',
            thirdpartyType: '02',
            appId: APPID,
            thirdpartyToken: params.access_token,
            thirdpartyOpenId: params.openid,
            unionId: params.unionid,
            nickName: params.nickname,
            figureUrl: params.headimgurl,
            gender: params.sex
        };

        requestLibrary.request({
            url: BASE_URL_PATH,
            method: 'post',
            form: {
                requestObj: JSON.stringify(defaultParams)
            },
            json: true,
            timeout: 10000
        }, function(err, body, res){
            if(err || !body || body.status !== 200){
                callback('portal error', body);
            } else {
                callback(null, body);
            }
        });
    }

};


module.exports = _Service;








