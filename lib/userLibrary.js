'use strict';

var _ = require('lodash');
var utilLibrary = require('./utilLibrary.js');
var userService = require('../services/userService');
var log = require('./logger').getLogger();

var _lib = {
    /**
     * 判断是否登录
     */
    checkLogin: function(req, res, callback) {
        var _self = this;
        var invalidInfo = _self.checkSkeyAndUid(req);
        if(invalidInfo){
            callback(invalidInfo);
            return;
        }

        var oa_skey = req.cookies.oa_skey;
        var userId = req.cookies.oa_user_id;
        var clientInfo = utilLibrary.getClientInfo(req);
        log.info('userLibrary.checkLogin - userId: %s, oa_skey: %s, clientInfo: %s', userId, '*', JSON.stringify(clientInfo));
        userService.checkLogin(req, res, function(err, retdata){
            if(err){
                callback(err);
            }else{
                if(retdata.retcode == 0){
                    callback(null, retdata.data);
                }else{
                    callback({
                        code: retdata.retcode,
                        msg: retdata.errMsg
                    });
                }
            }
        });
    },

    /**
     * 获取用户信息
     */
    getUserInfo: function(req, res, callback){
        var _self = this;
        var invalidInfo = _self.checkSkeyAndUid(req);
        if(invalidInfo){
            callback(invalidInfo);
            return;
        }
        var userId = req.cookies.oa_user_id;
        var oa_skey = req.cookies.oa_skey;
        var clientInfo = utilLibrary.getClientInfo(req);
        log.info('userLibrary.getUserInfo - userId: %s, oa_skey: %s, clientInfo: %s', userId, '*', JSON.stringify(clientInfo));
        userService.getUserInfo(req, res, function(err, retdata){
            if(err){
                callback(err);
            }else{
                if(retdata.retcode == 0){
                    callback(null, retdata.data);
                }else{
                    callback({
                        code: retdata.retcode,
                        msg: retdata.errMsg
                    });
                }
            }
        });
    },

    checkPerm: function (req, res, callback) {
        var _self = this;
        var invalidInfo = _self.checkSkeyAndUid(req);
        if(invalidInfo){
            callback(invalidInfo);
            return;
        }
        if(!req._perms){
            callback({
                code: -1,
                msg: '需要检验的权限ID为空'
            });
            return;
        }

        var userId = req.cookies.oa_user_id;
        var clientInfo = utilLibrary.getClientInfo(req);
        log.info('userLibrary.checkPerm - userId: %s, oa_skey: %s, clientInfo: %s', userId, '*', JSON.stringify(clientInfo));
        userService.checkPerm({
            perms: req._perms
        }, req, res, function(err, retdata){
            if(err){
                callback(err);
            }else{
                if(retdata.retcode == 0){
                    if (retdata.data && retdata.data.perms) {
                        var i = 1;
                        _.each(retdata.data.perms, function (v, k) {
                            i = i & v;
                        });
                        if(i) {
                            callback(null);
                        } else {
                            callback({
                                code: -1,
                                msg: '无接口访问权限'
                            });
                        }
                    } else {
                        callback({
                            code: -1,
                            msg: '检查权限接口返回的数据结构不正确'
                        });
                    }

                }else{
                    callback({
                        code: retdata.retcode,
                        msg: retdata.errMsg
                    });
                }
            }
        });
    },

    /**
     * 检测cookie里面用户态相关key是否合法
     * @param req
     * @returns {*}
     */
    checkSkeyAndUid: function(req) {
        var oa_skey = req.cookies.oa_skey;
        var userId = req.cookies.oa_user_id;
        if(!oa_skey || !userId){
            return {
                code: -1,
                msg: 'oa_skey or uid in cookie can not be empty'
            };
        }
        if(!/^\d*$/.test(userId)){
            return {
                code: -1,
                msg: 'uid in cookie invalid'
            };
        }
        return null;
    }
};
module.exports = _lib;