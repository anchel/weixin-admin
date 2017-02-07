'use strict';

var filter = require('../../lib/filter');
var utilLibrary = require('../../lib/utilLibrary');
var wechatApi = require('../../lib/wechat/wechat-api');
var ResponseError = require('../../errors/ResponseError');
var Logger = require('../../lib/logger');
var operatelogService = require('../../services/operatelogService');
var t_menu_data = require('../../models/menu_data');
var t_autoreply_conf = require('../../models/autoreply_conf');
var log = Logger.getLogger();

module.exports = function (router) {

    var fns = filter(['checkperm'], {
        perms: ['zdycd']
    });

    router.get('/', fns, function (req, res) {
        res.render('menu/index');
    });

    /**
     * 获取菜单
     */
    router.get('/get', fns, function(req, res){
        t_menu_data.findOne({
            where: {
                menu_type: 'normal'
            }
        }).then(function(r){
            var jsondata = {
                button: []
            };
            try{
                if(r){
                    jsondata = JSON.parse(r.get('menu_data'));
                }
            }catch(e){
                log.error(__filename, 'menu_data parse error');
            }
            utilLibrary.outputJsonResult(req, res, jsondata);
        }).catch(function(err){
            utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
        });
    });

    /**
     * 保存菜单
     */
    router.post('/save', fns, function(req, res){
        var datastr = req.body.menudata;
        if(datastr){

        }else{
            utilLibrary.outputJsonResult(req, res, new ResponseError('参数不正确'));
            return;
        }
        t_menu_data.upsert({
            menu_data: datastr
        }, {
            menu_type: 'normal'
        }).then(function(){
            utilLibrary.outputJsonResult(req, res, null);
            operatelogService.addLog(req, res, {
                status: 0
            });
        }).catch(function(err){
            utilLibrary.outputJsonResult(req, res, new ResponseError(JSON.stringify(err)));
            operatelogService.addLog(req, res, {
                status: 1
            });
        });
    });

    /**
     * 获取微信菜单
     */
    router.get('/get_wx', function(req, res){
        wechatApi.getMenu(function(err, ret){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError({
                    code: err.code || -1,
                    msg: err.toString()
                }));
            }else{
                utilLibrary.outputJsonResult(req, res, ret);
            }
        });
    });
    
    /**
     * 更新菜单项的回复消息内容
     */
    router.post('/update_menu_msg', function(req, res){
        var keyid = req.body.keyid;
        
    });
    
    /**
     * 发布微信菜单
     */
    router.post('/release', fns, function(req, res){
    
        t_menu_data.findOne({
            where: {
                menu_type: 'normal'
            }
        }).then(function(r){
            var menudata = {
                button: []
            };
            try{
                if(r){
                    menudata = JSON.parse(r.get('menu_data'));
                }
            }catch(e){
                log.error(__filename, 'menu_data parse error');
            }
            if(menudata.button.length === 0){
                utilLibrary.outputJsonResult(req, res, new ResponseError('菜单数据不能为空'));
                return;
            }
            
            var retmenudata = buildMenuData(menudata);
            //console.log(retmenudata);
    
            wechatApi.createMenu(retmenudata.newmenudata, function(err, ret){
                if(err){
                    utilLibrary.outputJsonResult(req, res, new ResponseError({
                        code: err.code || -1,
                        msg: err.toString()
                    }));
                }else{
                    t_autoreply_conf.destroy({
                        where: {
                            type: 4
                        }
                    }).then(function(){
                        t_autoreply_conf.bulkCreate(retmenudata.keymsgs).then(function(num){
                            utilLibrary.outputJsonResult(req, res, null);
                        }).catch(function(err){
                            utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
                        });
                    }).catch(function(err){
                        utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
                    });
                    
                }
                operatelogService.addLog(req, res, {
                    interface: 'wechatApi.createMenu',
                    interface_params: retmenudata.newmenudata,
                    status: err ? 1 : 0
                });
            });
        }).catch(function(err){
            utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
        });
        
        
    });
    
    /**
     * 创建微信菜单
     */
    router.post('/create', fns, function(req, res){
        var data = req.body.menudata;
        wechatApi.createMenu(data, function(err, ret){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError({
                    code: err.code || -1,
                    msg: err.toString()
                }));
            }else{
                utilLibrary.outputJsonResult(req, res, null);
            }
            operatelogService.addLog(req, res, {
                interface: 'wechatApi.createMenu',
                interface_params: data,
                status: err ? 1 : 0
            });
        });
    });

    /**
     * 删除菜单
     */
    router.get('/delete', fns, function(req, res){
        wechatApi.removeMenu(function(err, ret){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError({
                    code: err.errcode || -1,
                    msg: err.toString()
                }));
            }else{
                utilLibrary.outputJsonResult(req, res, null);
            }
            operatelogService.addLog(req, res, {
                interface: 'wechatApi.removeMenu',
                interface_params: '',
                status: err ? 1 : 0
            });
        });

    });
    
    function buildMenuData(menudata){
        var newmenudata = {
            button: []
        };
        var keymsgs = [];
        if(menudata.button){
            menudata.button.forEach(function(mitem){
                var newmitem = {};
                newmitem.name = mitem.name;
                if(mitem.sub_button){
                    newmitem.sub_button = [];
                    mitem.sub_button.forEach(function(submitem){
                        var newsubmitem = {};
                        newsubmitem.name = submitem.name;
                        mitemToNew(newsubmitem, submitem, keymsgs);
                        newmitem.sub_button.push(newsubmitem);
                    })
                } else {
                    mitemToNew(newmitem, mitem, keymsgs);
                }
                newmenudata.button.push(newmitem);
            });
        }
        
        return {
            newmenudata: newmenudata,
            keymsgs: keymsgs
        };
    }
    
    function mitemToNew(newmitem, mitem, keymsgs){
        newmitem.type = mitem.type;
        if(mitem.type === 'view'){
            newmitem.url = mitem.url;
        } else {
            newmitem.key = mitem.key;
            if(mitem.msg_data && mitem.msg_data.reply_msg_list && mitem.msg_data.reply_msg_list.length){
                keymsgs.push({
                    type: 4, //菜单点击的回复类型
                    keyname: mitem.name,
                    keyid: mitem.key,
                    reply_content: JSON.stringify(mitem.msg_data)
                });
            }
        }
    }
};
