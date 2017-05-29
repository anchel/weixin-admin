'use strict';

var path = require('path');
var fs = require('fs');
var crypto = require('crypto');
var urllib = require('url');
var qs = require('qs');
var ip = require('ip');
var config = require('config');
var node_ssh = require('node-ssh');

var _lib = {
    noop: function () {
        
    },
    md5: function(str) {
        var md5 = crypto.createHash('md5');
        return md5.update(str).digest('hex');
    },

    ipToLong: function(ipStr){
        return ip.toLong(ipStr);
    },

    int64ToIp: function(i6){
        return ip.fromLong(i6.toNumber());
    },

    getCsrfToken: function(req) {
        var _self = this;
        if(req.cookies.oa_skey){
            return _self.md5(req.cookies.oa_skey);
        }
        return null;
    },

    getClientInfo: function(req) {
        var platform = req.query.platform || req.body.platform;
        return {
            device: '',
            platform: platform,
            guid: '',
            userIp: this.ipToLong(req.ip)
        };
    },

    outputJsonResult: function(req, res, data){

        if(data instanceof Error){
            
            data = {
                errcode: data.code,
                errmsg: data.msg
            };
        }else{
            data = {
                errcode: 0,
                errmsg: '',
                data: data
            }
        }
        res.jsonp(data);
    },

    goLogin: function(req, res, opt){
        opt = opt || {};
        var url = [req.protocol, '://', req.hostname, req.originalUrl].join('');
        res.redirect(urllib.format({
            protocol: 'http',
            hostname: config.get('loginConfig.host'),
            port: config.get('loginConfig.port'),
            pathname: '/login',
            query: {
                redirect: url
            }
        }));
    },

    showApplyPerm: function (req, res, opt) {
        // http://perm.anchel.com/business/100/request
        var applyurl = urllib.format({
            protocol: config.get('permConfig.protocol'),
            hostname: config.get('permConfig.host'),
            port: config.get('permConfig.port'),
            pathname: '/business/' + config.get('permConfig.bid') + '/request'
        });
        res.render('errors/noperm', {
            applyurl: applyurl,
            perms: opt.perms
        })
    },

    checkPathInArr: function(arr, path){
        if(arr && path){
            var isExclude = false;
            arr.forEach(function(p){
                if(path.indexOf(p) == 0){
                    isExclude = true;
                }
            });
            return isExclude;
        }else{
            return false;
        }
    },

    /**
     * 判断是否在微信内
     * @param req
     * @returns {boolean}
     */
    isWechatWebView: function(req){
        var ua = req.headers['user-agent'];
        return /micromessenger/i.test(ua);
    },

    /**
     * 判断是否在特奢汇的app内
     * @returns {boolean}
     */
    isAppWebView: function(req){
        var ua = req.headers['user-agent'];
        return /anchel/i.test(ua);
    },

    isIosView: function(req){
        var ua = req.headers['user-agent'];
        var isIphone = /iphone/i.test(ua);
        var isIpad = /ipad/i.test(ua);
        var isIpod = /ipod/i.test(ua);
        if(isIphone || isIpad || isIpod){
            return true;
        }
        return false;
    },

    isAndroidView: function(req) {
        var ua = req.headers['user-agent'];
        var isAndroid = /android/i.test(ua);
        return isAndroid;
    },

    isMobileView: function(req){
        if(this.isIosView(req) || this.isAndroidView(req)){
            return true;
        }else{
            return false;
        }
    },

    nl2br: function(str, isXhtml) {
        var breakTag = isXhtml ? '<br />' : '<br>';
        return String(str).replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    },

    getDateDirName: function(){
        var d = new Date();
        return [d.getFullYear()].join('/');
    },

    mkdirParents: function (dir, mode, cb) {
        // check arguments
        if (typeof dir !== 'string')
            throw new Error('mkdirParents: directory path required');

        if (typeof mode === 'function') {
            cb = mode;
            mode = undefined;
        }

        if (mode !== undefined && typeof mode !== 'number')
            throw new Error('mkdirParents: mode must be a number');

        if (cb !== undefined && typeof cb !== 'function')
            throw new Error('mkdirParents: callback must be function');

        dir = path.resolve(dir);

        var ctx = this, called, results;

        // local variables
        var dirList = []; // directories that we have to make directory

        fs.exists(dir, existsCallback);

        // fs.exists callback...
        function existsCallback(exists) {
            if (exists) {
                return mkdirCallback(null);
            }

            // if dir does not exist, then we have to make directory
            dirList.push(dir);
            dir = path.resolve(dir, '..');

            return fs.exists(dir, existsCallback);
        } // existsCallback

        // fs.mkdir callback...
        function mkdirCallback(err) {
            if (err && err.code !== 'EEXIST') {
                return mkdirParentsCallback(err);
            }

            dir = dirList.pop();
            if (!dir) {
                return mkdirParentsCallback(null);
            }

            return fs.mkdir(dir, mode, mkdirCallback);
        } // mkdirCallback

        // mkdirParentsCallback(err)
        function mkdirParentsCallback(err) {
            if (err && err.code === 'EEXIST') err = arguments[0] = null;
            if (!results) results = arguments;
            if (!cb || called) return;
            called = true;
            cb.apply(ctx, results);
        } // mkdirParentsCallback

        // return mkdirParentsYieldable
        return function mkdirParentsYieldable(fn) {
            if (!cb) cb = fn;
            if (!results || called) return;
            called = true;
            cb.apply(ctx, results);
        }; // mkdirParentsYieldable

    },

    fillUrl: function(oriurl, params){
        var paramsStr = qs.stringify(params);
        var jingStr = '';
        var url = oriurl;
        if(oriurl.indexOf('#') > 0){
            jingStr = oriurl.substring(url.indexOf('#'));
            url = oriurl.substring(0, url.indexOf('#'));
        }
        if(url.indexOf('?') >= 0){ //含有问号
            return url + '&' + paramsStr + jingStr;
        } else {
            return url + '?' + paramsStr + jingStr;
        }
    },

    uploadImageFile: function(localPath, remotePath, cb){
        var ssh = new node_ssh();

        ssh.connect({
            host: config.get('imageFtpConfig.host'),
            username: config.get('imageFtpConfig.username'),
            password: config.get('imageFtpConfig.password')
        }).then(function() {
            // Local, Remote
            ssh.putFile(localPath, remotePath).then(function() {
                cb(null);
            }, function(err) {
                cb(err);
            }).catch(function(err){
                cb(err);
            });
        }, function(err){
            cb(err);
        }).catch(function(err){
            cb(err);
        });
    }
};


if(Date.prototype.format == undefined){
    Date.prototype.format = function (fmt) {
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        var expMap = {'M+':this.getMonth()+1,'d+':this.getDate(),'h+':this.getHours(),'m+':this.getMinutes(),'s+':this.getSeconds(),'S':this.getMilliseconds()};
        for(var exp in expMap){
            if(new RegExp('('+exp+')').test(fmt)){
                fmt = fmt.replace(RegExp.$1,(RegExp.$1.length==1)?(expMap[exp]):(("00"+expMap[exp]).substr((""+expMap[exp]).length)));
            }
        }
        return fmt;
    };
}

module.exports = _lib;