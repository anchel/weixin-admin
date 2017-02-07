/**
 * Created by Anchel on 2016/11/27.
 */

$(function () {

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

        },
        methods: {
            onSaveItem: function () {
                store.saveItem();
            },

            onRemoveItem: function (itemidx) {
                store.removeItem(itemidx);
            }
        }
    });

    function getdata(){
        store.clearListData();

        $.ajax({
            url: '/template/remotelist/getdata',
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
        if(!data || !data.template_list){
            //notifiy('数据异常，请联系管理员', 'warning');
            return;
        }
        data.template_list.forEach(function (item) {
            item.edit = false;
            item.content = item.content.replace(/(\r\n)|\n/g, '<br>');
            item.example = item.example.replace(/(\r\n)|\n/g, '<br>');
            store.addItem(item)
        });

    }

    getdata();

    function saveItemData (shorttid) {

        return $.ajax({
            type: 'post',
            url: '/template/remotelist/add',
            dataType: 'json',
            data: {
                shorttid: shorttid
            }
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
            url: '/template/remotelist/delete',
            dataType: 'json',
            data: {
                tid: item.template_id
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

