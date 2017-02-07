/**
 * Created by Anchel on 2016/9/17.
 */
$(function(){

    var RTYPE = 3; // 1-被添加 2-消息 3-关键词 4-菜单点击
    var COUNT = 20;
    var CUR_PAGE = 0;
    var TOTAL_PAGE = 0;
    var INIT_PAGER = false;

    var store = {
        listData: [],

        clearListData: function () {
            this.listData.splice(0, this.listData.length);
        },

        saveItem: function (idx) {
            var me = this;
            if( !(idx >= 0 && idx < me.listData.length) ){
                return;
            }
            var item = me.listData[idx];

            if(!item.rule_name){
                notifiy('规则名不能为空', 'warning');
                return;
            }
            if(!item.keywords.length){
                notifiy('请至少添加一个关键词', 'warning');
                return;
            }
            if(!item.msg_data.reply_msg_list.length){
                notifiy('请至少添加一条回复消息', 'warning');
                return;
            }

            var df = saveItemData(item);
            df.then(function (ret) {

            });
        },

        addItem: function (item, needR) {
            if (needR) {
                this.listData.unshift(item);
            } else {
                this.listData.push(item);
            }
        },

        getItem: function (idx) {
            return this.listData[idx];
        },

        removeItem: function (idx) {
            var me = this;
            if( !(idx >= 0 && idx < me.listData.length) ){
                return;
            }
            var item = me.listData[idx];
            var df = delItemData(item);
            df.then(function (ret) {
                if (ret && ret.errcode == 0) {
                    me.listData.splice(idx, 1);
                }
            });
        },

        expandItem: function (idx) {
            if (idx >=0 && idx < this.listData.length) {
                this.listData[idx].expand = !this.listData[idx].expand;
            }
        },

        getKeywordsInfo: function (idx) {
            var item = this.listData[idx];
            return item.keywords.map(function(k){
                return k.keyword;
            }).join(' ');
        },
        getMsgInfo: function (idx) {
            var item = this.listData[idx];
            var n_total = item.msg_data.reply_msg_list.length;
            var n_text = item.msg_data.reply_msg_list.filter(function (m) {
                return m.type === 'text';
            }).length;
            var n_image = item.msg_data.reply_msg_list.filter(function (m) {
                return m.type === 'image';
            }).length;
            var n_mpnews = item.msg_data.reply_msg_list.filter(function (m) {
                return m.type === 'mpnews';
            }).length;
            var n_news = item.msg_data.reply_msg_list.filter(function (m) {
                return m.type === 'news';
            }).length;
            return n_total + '条（' + n_text + '条文字，' + n_image + '条图片，' + n_mpnews + '条图文，' + n_news + '条图文外链）';
        }
    };

    var app = new Vue({
        el: $('.words-list-cont').get(0),
        template: '#template-words-reply-list',
        data: store,
        computed: {

        },
        methods: {
            onRemoveItem: function (itemidx) {
                store.removeItem(itemidx);
            },

            onSaveItem: function (itemidx) {
                store.saveItem(itemidx);
            },

            onAddKeyword: function (itemidx) {
                var item = store.getItem(itemidx);
                if(!item) return;
                item.keywords.push({
                    keyword: '',
                    mode: true,
                    edit: true
                })
            },

            onRemoveKeyword: function (itemidx, kidx) {
                var item = store.getItem(itemidx);
                if(!item) return;
                item.keywords.splice(kidx, 1);
            },

            onUpdateKeyword: function (itemidx, kidx) {
                var item = store.getItem(itemidx);
                if(!item) return;
                item.keywords[kidx].edit = !item.keywords[kidx].edit;
            },

            onChangeKeywordMode: function (itemidx, kidx) {
                var item = store.getItem(itemidx);
                if(!item) return;
                item.keywords[kidx].mode = !item.keywords[kidx].mode;
            },

            onSetReplyAll: function (itemidx) {
                var item = store.getItem(itemidx);
                if(!item) return;
                item.msg_data.reply_cat = !item.msg_data.reply_cat;
            }
        }
    });

    $('.add-item').on('click', function () {
        store.addItem({
            expand: true,
            rule_name: '',
            keywords: [],
            msg_data: {
                reply_cat: true,
                reply_msg_list: []
            }
        }, true);
    });

    function getdata(){
        store.clearListData();

        $.ajax({
            url: '/autoreply/getlistdata',
            dataType: 'json',
            data: {
                type: RTYPE, //1-被添加 2-消息 3-关键词 4-菜单点击
                page: CUR_PAGE,
                count: COUNT
            },
            success: function(ret){
                if(ret && ret.errcode == 0){
                    renderData(ret.data);
                    if(!INIT_PAGER) {
                        INIT_PAGER = true;
                        TOTAL_PAGE = Math.ceil(ret.data.total_count / COUNT);
                        initPager(TOTAL_PAGE, function(page){
                            CUR_PAGE = page;
                            getdata();
                        });
                    }
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
            var msgStr = item.reply_content;
            var kStr = item.reply_rule_keywords_def;
            var keywords = [];
            var msg_data = {
                reply_cat: true,
                reply_msg_list: []
            };
            try{
                keywords = JSON.parse(kStr);
            } catch (e) {

            }
            keywords = keywords.map(function (k) {
                return {
                    keyword: k.keyword,
                    mode: k.mode,
                    edit: false
                }
            });
            try{
                msg_data = JSON.parse(msgStr);
            } catch (e) {

            }
            store.addItem({
                id: item.id,
                expand: false,
                rule_name: item.reply_rule_name,
                keywords: keywords,
                msg_data: msg_data
            })
        });

    }

    function initPager (totalPages, cb) {
        var options = {
            bootstrapMajorVersion: 3,
            currentPage: 1,
            totalPages: totalPages,
            onPageClicked: function(e, originalEvent, type, page){
                cb(page-1);
            }
        };

        $('#list_paginate').bootstrapPaginator(options);
    }

    getdata();

    function saveItemData (item) {
        var sitem = {
            id: item.id,
            type: RTYPE,
            reply_content: JSON.stringify(item.msg_data),
            reply_rule_name: item.rule_name,
            reply_rule_keywords: item.keywords.map(function(ki){ return ki.keyword;}).join(','),
            reply_rule_keywords_def: JSON.stringify(item.keywords.map(function (ki) {
                return {
                    keyword: ki.keyword,
                    mode: ki.mode
                }
            }))
        };

        return $.ajax({
            type: 'post',
            url: '/autoreply/savedata',
            dataType: 'json',
            data: sitem
        }).then(function(ret){
            if (ret && ret.errcode == 0) {
                notifiy('保存成功', 'success');
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
            url: '/autoreply/deldata',
            dataType: 'json',
            data: {
                type: RTYPE,
                id: item.id
            }
        }).then(function(ret){
            if (ret && ret.errcode == 0) {
                notifiy('删除成功', 'success');
            } else {
                notifiy('删除失败,' + ret.errmsg, 'warning');
            }
        }, function(){
            notifiy('删除失败，请重试', 'warning');
        });
    }
});