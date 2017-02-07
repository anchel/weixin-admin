/**
 * Created by Anchel on 2016/11/27.
 */

$(function () {


    var COUNT = 20;
    var CUR_PAGE = 0;
    var TOTAL_PAGE = 0;
    var INIT_PAGER = false;

    var store = {

        isTmpQrcode: ACTION_NAME == 'QR_SCENE',
        showEdit: false,

        editInfo: {
            scene_id: undefined,
            name: '',
            action_name: ACTION_NAME,
            expire_seconds: 0
        },

        resetEditInfo: function () {
            $.extend(this.editInfo, {
                scene_id: undefined,
                name: '',
                action_name: ACTION_NAME,
                expire_seconds: 0
            })
        },

        listData: [],

        clearListData: function () {
            this.listData.splice(0, this.listData.length);
        },

        saveItem: function (olditem) {
            var me = this;
            var item = {};
            if (olditem) {
                item = olditem;
            } else {
                $.extend(item, this.editInfo);
            }

            if(!item.name){
                notifiy('名称不能为空', 'warning');
                return;
            }
            if(item.action_name == 'QR_SCENE'){ // 临时二维码需要填过期时间
                if (!item.expire_seconds) {
                    notifiy('过期时间不能为空', 'warning');
                    return;
                }
                if (!isNaN(item.expire_seconds)) {
                    item.expire_seconds = parseInt(item.expire_seconds);
                } else {
                    notifiy('过期时间必须是数字，且小于2592000', 'warning');
                    return;
                }
            }

            $.confirmModal({
                confirmMessage: item.scene_id ? '确定修改吗？' : '创建后将不能删除，确定创建吗？',
                confirmStyle: 'success',
                confirmCallback: function(){
                    var df = saveItemData(item);
                    df.then(function (ret) {
                        item.edit = false;
                        getdata();
                    });
                }
            });

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
        }
    };

    var app = new Vue({
        el: $('.list-cont').get(0),
        template: '#template-item-list',
        data: store,
        computed: {

        },
        methods: {
            onRemoveItem: function (itemidx) {
                store.removeItem(itemidx);
            },

            onSaveItem: function () {
                store.saveItem();
            },

            onClose: function () {
                store.showEdit = false;
            },

            modifyItem: function (itemidx) {
                var item = store.getItem(itemidx);
                if (item) {
                    item.edit = true;
                }
            },

            confirmModify: function (itemidx) {
                var item = store.getItem(itemidx);
                if (item) {
                    store.saveItem(item);
                }
            }
        }
    });

    $('.add-item').on('click', function () {
        store.showEdit = true;
    });

    function getdata(){
        store.clearListData();

        $.ajax({
            url: '/qrcode/list/getdata',
            dataType: 'json',
            data: {
                action_name: ACTION_NAME,
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
            item.edit = false;
            store.addItem(item)
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
        if (totalPages > 1) {
            $('#list_paginate').bootstrapPaginator(options);
        }
    }

    getdata();

    function saveItemData (item) {

        return $.ajax({
            type: 'post',
            url: '/qrcode/list/savedata',
            dataType: 'json',
            data: item
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
            url: '/qrcode/list/deldata',
            dataType: 'json',
            data: {
                type: ACTION_NAME,
                scene_id: item.scene_id
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

