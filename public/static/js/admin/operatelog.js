/**
 * Created by Anchel on 2016/11/27.
 */

$(function () {


    var COUNT = 30;
    var CUR_PAGE = 0;
    var TOTAL_PAGE = 0;
    var INIT_PAGER = false;

    var store = {

        listData: [],

        clearListData: function () {
            this.listData.splice(0, this.listData.length);
        },

        saveItem: function (olditem) {
            var me = this;

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
            }
        }
    });

    function getdata(){
        store.clearListData();

        $.ajax({
            url: '/admin/operatelog/getdata',
            dataType: 'json',
            data: {
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

});

