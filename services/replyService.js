var config = require('config');
var _ = require('lodash');
var utilLibrary = require('../lib/utilLibrary');
var requestLibrary = require('../lib/requestLibrary');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');
var autoreply_conf = require('../models/autoreply_conf');

var log = Logger.getLogger();

module.exports = {

    /**
     *
     * @param message
     * @param callback
     *
     res.reply([
     {
         title: '你来我家接我吧',
         description: '这是女神与高富帅之间的对话',
         picurl: 'http://img0.bdstatic.com/img/image/zhengjiuwxr.jpg',
         url: 'http://m.teshehui.com/'
     }
     ]);
     */
    getReplyMsg: function(message, callback){
        var _self = this;
        var type = 0; //1-被添加 2-消息 3-关键词 4-点击菜单回复
        
        var msgtype = message.MsgType;
        if(msgtype === 'event'){
            if(message.Event == 'subscribe'){
                type = 1;
            }else if(message.Event == 'unsubscribe'){

            }else if(message.Event == 'SCAN'){

            }else if(message.Event == 'CLICK'){
                type = 4;
            }else if(message.Event == 'VIEW'){
    
            }
        }else if(msgtype === 'text'){
            type = 3;
        }else if(['image', 'voice', 'video', 'shortvideo'].indexOf(msgtype) >= 0){
            type = 2;
        }
        
        if(type === 0){
            callback(null);
            return;
        }
        
        log.info(__filename, 'type=', type);
        
        if (type == 4) { // 点击菜单回复
            _self.queryMenuReplyMsg(type, message, callback);
        } else if(type == 3){ // 关键词回复
            _self.queryKeywordReplyMsg(type, message, function(err, msgs){
                if(err){
                    type = 2;
                    _self.queryCommReplyMsg(type, message, callback);
                } else {
                    if(msgs && msgs.length > 0){
                        callback(null, msgs);
                    } else {
                        type = 2;
                        _self.queryCommReplyMsg(type, message, callback);
                    }
                }
            });
        } else { // 普通消息回复
            _self.queryCommReplyMsg(type, message, callback);
        }
    },
    
    queryCommReplyMsg: function(type, message, callback){
        var _self = this;
        autoreply_conf.findOne({
            where: {
                type: type
            }
        }).then(function(row){
        
            if(row){
                callback(null, _self.buildReplyMsgEx(row));
            }else{
                callback(null);
            }
        }).catch(function(err){
            log.error(__filename, 'queryCommReplyMsg', err.toString());
            callback(null);
        });
    },
    
    queryKeywordReplyMsg: function(type, message, callback){
        var _self = this;
        var keyword_receive = message.Content;
        
        autoreply_conf.findAll({
            limit: 30,
            where: {
                type: type,
                reply_rule_keywords: {
                    $like: '%' + keyword_receive + '%'
                }
            }
        }).then(function(rows){
            
            if(rows){
                var msg = null;
                rows.forEach(function(r){
                    var kwdefstr = r.get('reply_rule_keywords_def');
                    var kwdefobj = [];
                    try{
                        kwdefobj = JSON.parse(kwdefstr);
                    } catch (e) {
                        log.error(__filename, 'queryKeywordReplyMsg', 'reply_rule_keywords_def parse error', kwdefstr)
                    }
                    if(!Array.isArray(kwdefobj)){
                        return;
                    }
                    kwdefobj.forEach(function(kwdef){
                        var kw = kwdef.keyword || '';
                        var match_mode = kwdef.mode; // true-全词匹配 false-模糊匹配
                        if(match_mode){
                            if(keyword_receive === kw){
                                msg = r;
                            }
                        } else {
                            if(kw.indexOf(keyword_receive) >= 0){
                                msg = r;
                            }
                        }
                    });
                });
                
                if(msg){
                    callback(null, _self.buildReplyMsgEx(msg));
                } else {
                    callback(null);
                }
                
            }else{
                callback(null);
            }
        }).catch(function(err){
            log.error(__filename, 'queryKeywordReplyMsg', err.toString());
            callback(null);
        });
    },
    
    queryMenuReplyMsg: function(type, message, callback){
        var _self = this;
        var keyid = message.EventKey;
        autoreply_conf.findOne({
            where: {
                type: type,
                keyid: keyid
            }
        }).then(function(row){
        
            if(row){
                callback(null, _self.buildReplyMsgEx(row));
            }else{
                callback(null);
            }
        }).catch(function(err){
            log.error(__filename, 'queryMenuReplyMsg', err.toString());
            callback(null);
        });
    },

    buildReplyMsg: function(row){
        var reply_type = row.get('reply_type');
        var reply_content = row.get('reply_content');
        if(reply_type == 'text'){
            return {
                type: 'text',
                content: reply_content
            }
        }else if(reply_type == 'news'){
            return JSON.parse(row.get('reply_content'));
        }
        return null;
    },

    buildReplyMsgEx: function(row){
        
        var _self = this;
        var content = row.get('reply_content');
        if(!content){
            log.warn(__filename, 'buildReplyMsgEx', 'reply_content is empty');
            return null;
        }
        var msg_data = null;
        try{
            msg_data = JSON.parse(content);
        }catch(e){
            log.warn(__filename, 'buildReplyMsgEx', 'content parse err')
        }
        if(!msg_data || !msg_data.reply_msg_list || !msg_data.reply_msg_list.length){
            log.warn(__filename, 'buildReplyMsgEx', 'msg_data or msg_data.reply_msg_list is empty');
            return null;
        }
        
        //log.info(__filename, 'buildReplyMsgEx', JSON.stringify(msg_data));
        var msgs = [];
        var reply_cat = msg_data.reply_cat;
        if(reply_cat){
            msgs = msg_data.reply_msg_list;
        }else{
            var len = msg_data.reply_msg_list.length;
            var rc = Math.floor(Math.random() * len);
            msgs = msg_data.reply_msg_list.slice(rc, rc + 1);
        }
        var msgs_new = [];
        msgs.forEach(function(msgraw, idx){
            var msg = _self.convertMsg(msgraw, idx);
            msg && msgs_new.push(msg)
        });
        log.info(__filename, 'buildReplyMsgEx msgs_new', JSON.stringify(msgs_new));
        return msgs_new;
    },
    
    convertMsg: function(msgraw){
        var msg = null;
        switch(msgraw.type){
            case 'text':
                msg = {
                    type: msgraw.type,
                    content: msgraw.content
                };
                break;
            case 'voice':
    
            case 'mpnews':
                
            case 'image':
                msg = {
                    type: msgraw.type,
                    content: {
                        mediaId: msgraw.media_id
                    }
                };
                break;
            
            case 'video':
                msg = {
                    type: msgraw.type,
                    content: {
                        title: '来段视频吧',
                        description: '女神与高富帅',
                        mediaId: msgraw.media_id
                    }
                };
                break;
            case 'news':
                msg = {
                    type: msgraw.type,
                    content: msgraw.content
                };
                break;
            default:
                break;
        }
        return msg;
    }
};
