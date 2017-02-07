/**
 * Created by Anchel on 2016/9/18.
 */
var config = require('config');
var WechatAPI = require('wechat-api');
var AccessToken = require('../../models/access_token');
var Ticket = require('../../models/ticket');

var conf = {
    appid: config.get('wechatConfig.appid'),
    appsecret: config.get('wechatConfig.appsecret')
};

var api = new WechatAPI(conf.appid, conf.appsecret, function (callback) {
    AccessToken.findOne({
        where: {
            platform: 1
        }
    }).then(function(row){
        if(row){
            callback(null, {
                accessToken: row.get('access_token'),
                expireTime: row.get('expire_time')
            });
        } else {
            callback(null);
        }
    }).error(function(err){
        callback(err);
    });
}, function (token, callback) {
    AccessToken.upsert({
        access_token: token.accessToken,
        expire_time: token.expireTime
    }, {
        platform: 1
    }).then(function(){
        callback(null);
    }).error(function(err){
        callback(err);
    });
});

api.registerTicketHandle(function (type, callback) {
    Ticket.findOne({
        where: {
            type: type
        }
    }).then(function (row) {
        if(row){
            callback(null, {
                ticket: row.get('ticket'),
                expireTime: row.get('expire_time')
            });
        } else {
            callback(null);
        }
    }).error(function (err) {
        callback(err);
    });
}, function (type, _ticketToken, callback) {
    Ticket.upsert({
        ticket: _ticketToken.ticket,
        expire_time: _ticketToken.expireTime
    }, {
        type: type
    }).then(function(){
        callback(null);
    }).error(function(err){
        callback(err);
    });
});

module.exports = api;