/**
 * Created by Anchel on 2016/9/18.
 */
var wechat = require('wechat');
var config = require('config');
var utilLibrary = require('../utilLibrary');
var subscribeService = require('../../services/subscribeService');
var replyService = require('../../services/replyService');
var wechatApi = require('./wechat-api');
var Logger = require('../logger');
var log = Logger.getLogger();

var conf = {
    token: config.get('wechatConfig.token'),
    appid: config.get('wechatConfig.appid'),
    encodingAESKey: config.get('wechatConfig.encodingAESKey')
};

var fn = wechat(conf, function (req, res, next) {
    // 微信输入信息都在req.weixin上
    var message = req.weixin;
    console.log('message', message);
    if(message.MsgType == 'event'){
        if(message.Event == 'subscribe'){
            subscribeService.userSubscribe(message);
        }else if(message.Event == 'unsubscribe'){
            subscribeService.userUnSubscribe(message);
        }else if(message.Event == 'SCAN'){

        }
    }
    replyService.getReplyMsg(message, function(err, msgArr){
        if(err){
            res.send('');
        }else{
            if(msgArr && msgArr.length > 0){
                var retobj = fixMsgArr(msgArr);
                log.info(__filename, 'retobj', JSON.stringify(retobj));
                if(retobj.msgReply){
                    res.reply(retobj.msgReply);
                }else{
                    res.send('');
                }
                if(retobj.msgSendArr && retobj.msgSendArr.length){
                    sendMsg(message, retobj.msgSendArr);
                }
            }else{
                res.send('');
            }
        }
    });
});

function sendMsg(message, arr){
    var noop = utilLibrary.noop;
    arr.forEach(function(msg){
        
        switch(msg.type){
            case 'text':
                log.info(__filename, 'sendText', msg);
                wechatApi.sendText(message.FromUserName, msg.content, noop);
                break;
            case 'image':
                log.info(__filename, 'sendImage', msg);
                wechatApi.sendImage(message.FromUserName, msg.content.mediaId, noop);
                break;
            case 'voice':
                log.info(__filename, 'sendVoice', msg);
                wechatApi.sendVoice(message.FromUserName, msg.content.mediaId, noop);
                break;
            case 'video':
                log.info(__filename, 'sendVideo', msg);
                wechatApi.sendVideo(message.FromUserName, msg.content.mediaId, msg.content.thumbMediaId, noop);
                break;
            case 'mpnews':
                log.info(__filename, 'sendMpNews', msg);
                wechatApi.sendMpNews(message.FromUserName, msg.content.mediaId, noop);
                break;
            case 'news':
                log.info(__filename, 'sendNews', msg);
                wechatApi.sendNews(message.FromUserName, msg.content, noop);
                break;
            default:
                break;
        }
        
    })
}

function fixMsgArr(msgArr){
    var msgReply;
    var msgSendArr;
    
    var tmpNewsArr = msgArr.filter(function(msg){
        return msg.type === 'mpnews';
    });
    
    var tmpOtherArr = msgArr.filter(function(msg){
        return !(msg.type === 'mpnews');
    });
    
    msgReply = tmpOtherArr[0];
    msgSendArr = tmpNewsArr.concat(tmpOtherArr.slice(1));
    
    return {
        msgReply: msgReply,
        msgSendArr: msgSendArr
    }
}

module.exports = fn;