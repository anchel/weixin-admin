var config = require('config');
var _ = require('lodash');
var urllib = require('url');
var utilLibrary = require('../lib/utilLibrary');
var requestLibrary = require('../lib/requestLibrary');
var cmsBaseUrl = config.get('hostConfig.cmsweb');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');

var log = Logger.getLogger();

var userService = {

    checkLogin: function(req, res, cb){
        var loginhost = config.get('loginConfig.host');
        var loginport = config.get('loginConfig.port');
        var path = '/api/checklogin';
        var url = urllib.format({
            protocol: 'http',
            hostname: loginhost,
            port: loginport,
            pathname: path
        });
        var cookieStr = req.get('cookie');
        requestLibrary.request({
            url: url,
            method: 'get',
            headers: {
                cookie: cookieStr
            },
            qs: {},
            //proxy: 'http://127.0.0.1:8888',
            json: true,
            timeout: 5000
        }, function(err, body, res){
            if(!err && res.statusCode == 200){
                cb(null, body);
            }else{
                cb(err);
            }
        });
    },

    getUserInfo: function(req, res, cb){
        var loginhost = config.get('loginConfig.host');
        var loginport = config.get('loginConfig.port');
        var path = '/api/userinfo/' + req.cookies.oa_user_id;
        var url = urllib.format({
            protocol: 'http',
            hostname: loginhost,
            port: loginport,
            pathname: path
        });
        var cookieStr = req.get('cookie');
        requestLibrary.request({
            url: url,
            method: 'get',
            headers: {
                cookie: cookieStr
            },
            qs: {},
            //proxy: 'http://127.0.0.1:8888',
            json: true,
            timeout: 5000
        }, function(err, body, res){
            if(!err && res.statusCode == 200){
                cb(null, body);
            }else{
                cb(err);
            }
        });
    },

    /**
     * 权限检查
     * @param params
     * @param req
     * @param res
     * @param cb
     */
    checkPerm: function (params, req, res, cb) {
        var iprotocol = config.get('permConfig.protocol');
        var ihost = config.get('permConfig.host');
        var iport = config.get('permConfig.port');
        var bid = config.get('permConfig.bid');
        var userid = req.cookies.oa_user_id; // 因为事先会检查登录态，所以可以认为userid一定存在，且不会是伪造的

        var path = '/api/check/' + userid + '/' + bid + '/';
        var url = urllib.format({
            protocol: iprotocol,
            hostname: ihost,
            port: iport,
            pathname: path
        });
        var cookieStr = req.get('cookie');
        requestLibrary.request({
            url: url,
            method: 'get',
            headers: {
                cookie: cookieStr
            },
            qs: params,
            //proxy: 'http://127.0.0.1:8888',
            json: true,
            timeout: 5000
        }, function(err, body, res){
            if(!err && res.statusCode == 200){
                cb(null, body);
            }else{
                cb(err);
            }
        });
    }
};

module.exports = userService;








