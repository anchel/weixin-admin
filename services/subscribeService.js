var config = require('config');
var _ = require('lodash');
var async = require('async');
var utilLibrary = require('../lib/utilLibrary');
var requestLibrary = require('../lib/requestLibrary');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');
var wechatService = require('./wechatService');
var subscribe_user = require('../models/subscribe_user');
var subscribe_flow = require('../models/subscribe_flow');

var log = Logger.getLogger();

module.exports = {

    /**
     * 用户关注公众号
     * @param message
     */
    userSubscribe: function(message){
        var openid = message.FromUserName;
        var EventKey = message.EventKey;
        var scene_id;
        var regscene = /qrscene_(.*)/;
        if (EventKey && regscene.test(EventKey)) {
            scene_id = EventKey.match(regscene)[1];
            if ( !isNaN(scene_id) ) {
                scene_id = parseInt(scene_id, 10);
            }
        }
        var unixtime = Math.round((new Date()).getTime() / 1000);

        wechatService.get_gzh_userinfo({
            openid: openid
        }, function (err, userinfo) {
            userinfo = userinfo || {};
            subscribe_flow.create({
                type: 1,
                openid: openid,
                unionid: userinfo.unionid,
                scene_id: scene_id
            }).then(function(){
                subscribe_user.upsert({
                    subscribe: 1,
                    openid: openid,
                    unionid: userinfo.unionid,
                    nickname: userinfo.nickname,
                    sex: userinfo.sex,
                    headimgurl: userinfo.headimgurl,
                    subscribe_time: unixtime,
                    subscribe_scene_id: scene_id
                }, {
                    openid: openid
                }).then(function(){

                }).catch(function(err){

                });
            }).catch(function(){

            });
        });
    },

    /**
     * 用户取消关注公众号
     * @param message
     */
    userUnSubscribe: function(message){
        var openid = message.FromUserName;
        var unixtime = Math.round((new Date()).getTime() / 1000);
        subscribe_flow.create({
            type: 0,
            openid: message.FromUserName
        }).then(function(){
            subscribe_user.upsert({
                subscribe: 0,
                openid: openid
            }, {
                openid: openid
            }).then(function(){

            }).catch(function(err){

            });
        }).catch(function(){

        });
    },

    getDashboardData: function(callback){

        function getTotal(cb){
            subscribe_user.count({
                distinct: true,
                col: 'openid',
                where: {
                    subscribe: 1
                }
            }).then(function(n){
                cb(null, n);
            }).catch(function(err){
                cb(err);
            });
        }

        var d = new Date();
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);

        function getTodaySubscribe(cb){
            subscribe_flow.count({
                distinct: true,
                col: 'openid',
                where: {
                    type: 1,
                    ctime: {
                        $gt: d
                    }
                }
            }).then(function(n){
                cb(null, n);
            }).catch(function(err){
                cb(err);
            });
        }

        function getTodayUnSubscribe(cb){
            subscribe_flow.count({
                distinct: true,
                col: 'openid',
                where: {
                    type: 0,
                    ctime: {
                        $gt: d
                    }
                }
            }).then(function(n){
                cb(null, n);
            }).catch(function(err){
                cb(err);
            });
        }

        async.parallel([getTotal, getTodaySubscribe, getTodayUnSubscribe], function(err, rets){
            if(err){
                callback(err);
            }else{
                callback(null, {
                    total: rets[0],
                    today_subscribe: rets[1],
                    today_unsubscribe: rets[2]
                });
            }
        });
    }
};
