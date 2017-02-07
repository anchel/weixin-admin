'use strict';

var config = require('config');
var cors = require('cors');
var utilLibrary = require('./utilLibrary');
var userLibrary = require('./userLibrary');
var ResponseError = require('../errors/ResponseError');
var _ = require('lodash');

var filterMap = {
    cors: function(opt){
        return cors(opt);
    },

    csrf: function(opt) {
        return function(req, res, next){
            var csrf_token = req.query.csrf_token || req.body.csrf_token;
            var ser_token = utilLibrary.getCsrfToken(req);
            var flag = false;
            if(csrf_token && ser_token && csrf_token === ser_token){
                flag = true;
            }
            if(!flag){
                utilLibrary.outputJsonResult(req, res, new ResponseError(ResponseError.CSRF))
            }else{
                next();
            }
        };
    },

    /**
     * 判断登录
     * @param opt
     * @returns {Function}
     */
    checklogin: function(opt) {
        return function(req, res, next){
            if(utilLibrary.checkPathInArr(opt.exclude, req.originalUrl) || /options/i.test(req.method) || checkTokenAccess(req, res, opt)){  //排除掉
                next();
            }else{
                userLibrary.checkLogin(req, res, function(err) {
                    if(!err){
                        req._isLogined = true;
                        next();
                    }else{
                        if(!opt.required){
                            return next();
                        }else{
                            if(opt.ajax || req.get('X-Requested-With') === 'XMLHttpRequest'){
                                utilLibrary.outputJsonResult(req, res, new ResponseError(ResponseError.NOLOGIN));
                            }else{
                                utilLibrary.goLogin(req, res, opt);
                            }
                        }
                    }
                });
            }
        };
    },
    /**
     * 获取用户信息
     * @param opt
     * @returns {Function}
     */
    getloginuserinfo: function(opt) {
        var _self = this;
        return function(req, res, next){
            if(utilLibrary.checkPathInArr(opt.exclude, req.originalUrl) || /options/i.test(req.method) || checkTokenAccess(req, res, opt)) {  //排除掉
                next();
            }else{
                userLibrary.getUserInfo(req, res, function(err, data) {
                    if(!err){
                        req._userinfo = data;
                        res.locals._userinfo = req._userinfo;
                        next();
                    }else{
                        if(!opt.required){
                            return next();
                        }else{
                            if(opt.ajax || req.get('X-Requested-With') === 'XMLHttpRequest'){
                                utilLibrary.outputJsonResult(req, res, new ResponseError(ResponseError.NOLOGIN));
                            }else{
                                utilLibrary.goLogin(req, res);
                            }
                        }
                    }
                });
            }
        };
    },

    checkperm: function (opt) {
        var _self = this;
        return function (req, res, next) {
            if(!config.get('permConfig.open') || utilLibrary.checkPathInArr(opt.exclude, req.originalUrl) || /options/i.test(req.method) || checkTokenAccess(req, res, opt)){  //排除掉
                next();
            }else{
                req._perms = opt.perms.join(',');
                userLibrary.checkPerm(req, res, function(err) {
                    if(!err){
                        next();
                    }else{
                        if(opt.ajax || req.get('X-Requested-With') === 'XMLHttpRequest'){
                            utilLibrary.outputJsonResult(req, res, new ResponseError({code: 10002, msg: JSON.stringify(err)}));
                        }else{
                            utilLibrary.showApplyPerm(req, res, opt);
                        }
                    }
                });
            }
        }
    },
    
    checksign: function (opt) {
        return function (req, res, next) {
            if (checkSign(req, res, opt)) {
                next();
            } else {
                utilLibrary.outputJsonResult(req, res, new ResponseError({code: 10003, msg: '未授权的访问'}));
            }
        }
    }
};

/**
 * 对于某些路径，想直接通过token授权访问
 * @param req
 * @param res
 * @param opt
 * @returns {boolean}
 */
function checkTokenAccess(req, res, opt){
    var flag = false;
    var s_token = config.get('securityConfig.s_token');
    if(s_token && opt && opt.tokendir && req.query.s_token){
        if(utilLibrary.checkPathInArr(opt.tokendir, req.originalUrl) && s_token === req.query.s_token){
            flag = true;
        }
    }
    return flag;
}

/**
 * 签名验证
 * @param req
 * @param res
 * @param opt
 */
function checkSign (req, res, opt) {
    var params = [];
    
    if (!req.query.signature || !req.query.timestamp) {
        return false;
    }
    _.each(req.query, function (v, k) {
        if (k !== 'signature') {
            params.push({
                k: k,
                v: v
            });
        }
    });
    if (req.method === 'POST') {
        _.each(req.body, function (v, k) {
            if (k !== 'signature') {
                params.push({
                    k: k,
                    v: v
                });
            }
        });
    }
    
    sortArr(params);
    
    var s_token = config.get('securityConfig.s_token');
    
    var paramstr = params.map(function (para) {
        return toHex(para.k) + '=' + toHex(para.v)
    }).join('&');
    
    var sign = utilLibrary.md5(s_token + '&' + paramstr).toUpperCase();
    
    return req.query.signature === sign;
}

function sortArr (arr) {
    arr.sort(function (a, b) {
        if (a.k < b.k) {
            return -1;
        } else if (a.k > b.k) {
            return 1;
        } else {
            return 0;
        }
    });
}

function toHex (str) {
    var b = new Buffer(str);
    return b.toString('hex').toUpperCase();
}

/**
 *
 * @param arr ['cors', 'csrf', 'checklogin', 'getloginuserinfo', 'checkperm', 'checksign', ...]
 * @param opt
 */
module.exports = function(arr, opt){
    arr = arr || [];
    opt = opt || {};

    var filters = [];

    arr.forEach(function(k) {
        if(filterMap[k]){
            filters.push(filterMap[k](opt));
        }
    });

    return filters;
};