/**
 * Created by Anchel on 2016/11/27.
 */

$(function () {

    var store = {
        
        editInfo: {
            template_list: [],
            data: {
                id: undefined,
                type: '',
                title: '',
                rel_template_id: '',
                data_desc: undefined
            }
        },

        listData: [],
        
        resetEditInfo : function () {
            $.extend(this.editInfo.data, {
                id: '',
                type: '',
                title: '',
                rel_template_id: '',
                data_desc: ''
            });
        },

        clearListData: function () {
            this.listData.splice(0, this.listData.length);
        },

        saveItem: function (olditem) {
            var me = this;
            var params = {};
            $.extend(params, this.editInfo.data);
    
            if (!params.type || !params.title || !params.rel_template_id) {
                notifiy('请填写完整的信息', 'warning');
                return;
            }
            
            params.data_desc = JSON.stringify(app.selTemplateInfo.valArr);
            
            saveItemData(params);
        },

        addItem: function (item) {
            this.listData.push(item);
        },

        getItem: function (idx) {
            var me = this;
            if( !(idx >= 0 && idx < me.listData.length) ){
                return;
            }
            return this.listData[idx];
        },
        
        updateItem: function (idx) {
            var item = this.getItem(idx);
            if (!item) return;
            $.extend(this.editInfo.data, item);
            
            $('.add-item').trigger('click', true);
        },

        removeItem: function (idx) {
            var me = this;
            if( !(idx >= 0 && idx < me.listData.length) ){
                return;
            }
            var item = me.listData[idx];
            $.confirmModal({
                confirmMessage: '删除模板可能导致用户收不到模板消息，确定删除吗？',
                confirmStyle: 'success',
                confirmCallback: function(){
                    var df = delItemData(item);
                    df.then(function (ret) {
                        if (ret && ret.errcode == 0) {
                            me.listData.splice(idx, 1);
                        }
                    });
                }
            });
        }
    };

    var app = new Vue({
        el: $('.list-cont').get(0),
        template: '#template-item-list',
        data: store,
        computed: {
            selTemplateInfo: function () {
                var me = this;
                var selTemplateId = this.editInfo.data.rel_template_id;
                var items = this.editInfo.template_list.filter(function (item) {
                    return item.template_id == selTemplateId
                });
                var retitem = {
                    template_id: '',
                    title: '',
                    content: '',
                    example: '',
                    valArr: []
                };
                
                var tmpMap = {};
                if (me.editInfo.data.data_desc) {
                    var tmpDD = JSON.parse(me.editInfo.data.data_desc);
                    tmpDD.forEach(function (item) {
                        tmpMap[item.keyword] = item;
                    })
                }
                if (items.length) {
                    var item = items[0];
                    $.extend(retitem, item);
                    item.vars.forEach(function (k) {
                        var tmpItem = tmpMap[k] || {};
                        retitem.valArr.push({
                            keyword: k,
                            param_name: tmpItem.param_name || '',
                            color: tmpItem.color || ''
                        })
                    });
                }
                return retitem;
            }
        },
        methods: {
            onSaveItem: function () {
                store.saveItem();
            },
            
            onUpdateItem: function (itemidx) {
                store.updateItem(itemidx);
            },

            onRemoveItem: function (itemidx) {
                store.removeItem(itemidx);
            }
        }
    });

    function getdata(){
        store.clearListData();

        $.ajax({
            url: '/template/templatelist/getdata',
            dataType: 'json',
            data: {

            },
            success: function(ret){
                if(ret && ret.errcode == 0){
                    renderData(ret.data);
                }else{
                    notifiy('数据初始化失败，请重试', 'warning');
                }
            },
            error: function(){
                notifiy('数据初始化失败，请重试', 'warning');
            }
        });
    }

    function renderData(data){
        if(!data || !data.list){
            //notifiy('数据异常，请联系管理员', 'warning');
            return;
        }
        data.list.forEach(function (item) {
            item.edit = false;
            //item.content = item.content.replace(/(\r\n)|\n/g, '<br>');
            //item.example = item.example.replace(/(\r\n)|\n/g, '<br>');
            store.addItem(item)
        });

    }
    
    $('.add-item').on('click', function (e, remain) {
        if (!remain) {
            store.resetEditInfo();
        }
    });

    getdata();

    function saveItemData (params) {

        return $.ajax({
            type: 'post',
            url: '/template/templatelist/savedata',
            dataType: 'json',
            data: params
        }).then(function(ret){
            if (ret && ret.errcode == 0) {
                notifiy('保存成功', 'success');
                getdata();
            } else {
                notifiy('保存失败,' + ret.errmsg, 'warning');
            }
        }, function(){
            notifiy('保存失败，请重试', 'warning');
        });
    }

    function delItemData (item) {
        return $.ajax({
            type: 'post',
            url: '/template/templatelist/deldata',
            dataType: 'json',
            data: {
                id: item.id
            }
        }).then(function(ret){
            if (ret && ret.errcode == 0) {
                notifiy('删除成功', 'success');
                getdata();
            } else {
                notifiy('删除失败,' + ret.errmsg, 'warning');
            }
        }, function(){
            notifiy('删除失败，请重试', 'warning');
        });
    }
    
    function get_wx_template_list () {
        $.ajax({
            url: '/template/remotelist/getdata',
            dataType: 'json',
            data: {
                
            },
            success: function(ret){
                if(ret && ret.errcode == 0){
                    if (ret.data && ret.data.template_list) {
                        ret.data.template_list.forEach(function (item) {
                            item.vars = getVar(item);
                            item.content = item.content.replace(/(\r\n)|\n/g, '<br>');
                            item.example = item.example.replace(/(\r\n)|\n/g, '<br>');
                            store.editInfo.template_list.push(item);
                        })
                    }
                }else{
                    notifiy('模板列表数据初始化失败，请重试', 'warning');
                }
            },
            error: function(){
                notifiy('模板列表数据初始化失败，请重试', 'warning');
            }
        });
    }
    
    function getVar (item) {
        var content = item.content;
        var reg = /\{\{(.*?)\.DATA\}\}/g;
        var regret = reg.exec(content);
        var vars = [];
        while(regret){
            vars.push(regret[1]);
            regret = reg.exec(content);
        }
        return vars;
    }
    
    get_wx_template_list();
});

