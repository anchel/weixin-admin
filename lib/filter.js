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
            if(utilLibrary.checkPathInArr(opt.exclude, req.originalUrl) || /options/i.test(req.method)){  //排除掉
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
            if(utilLibrary.checkPathInArr(opt.exclude, req.originalUrl) || /options/i.test(req.method)) {  //排除掉
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
            if(!config.get('permConfig.open') || utilLibrary.checkPathInArr(opt.exclude, req.originalUrl) || /options/i.test(req.method)){  //排除掉
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
    }
};

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