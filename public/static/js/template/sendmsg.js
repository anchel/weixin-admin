/**
 * Created by Anchel on 2016/11/29.
 */

$(function () {

    var store = {

        template_list: [],

        sendinfo: {
            touser: '',
            template_id: '',
            url: '',
            data: ''
        },

        sendmsg: function () {
            var params = {};
            $.extend(params, this.sendinfo);

            if (!params.touser || !params.template_id || !params.url || !params.data) {
                notifiy('请填写完整的信息', 'warning');
                return;
            }
            sendmsg(params);
        }
    };

    var app = new Vue({
        el: $('.main-cont').get(0),
        template: '#template-main',
        data: store,
        computed: {
            selTemplateInfo: function () {
                var selTemplateId = this.sendinfo.template_id;
                var items = this.template_list.filter(function (item) {
                    return item.template_id == selTemplateId
                });
                var retitem = {
                    template_id: '',
                    title: '',
                    content: '',
                    example: '',
                    valArr: []
                };
                if (items.length) {
                    var item = items[0];
                    $.extend(retitem, item);
                    item.vars.forEach(function (k) {
                        retitem.valArr.push({
                            k: k,
                            v: ''
                        })
                    });
                }
                return retitem;
            }
        },
        methods: {
            onSend: function () {
                var data = {};
                this.selTemplateInfo.valArr.forEach(function (item) {
                    data[item.k] = {
                        value: item.v,
                        color: '#3a434b'
                    };
                });

                store.sendinfo.data = JSON.stringify(data);
                store.sendmsg();
            }
        }
    });

    function sendmsg (params) {
        return $.ajax({
            type: 'post',
            url: '/template/sendmsg/send',
            dataType: 'json',
            data: params
        }).then(function(ret){
            if (ret && ret.errcode == 0) {
                notifiy('发送成功', 'success');
            } else {
                notifiy('发送失败,' + ret.errmsg, 'warning');
            }
        }, function(){
            notifiy('发送失败，请重试', 'warning');
        });
    }

    function get_template_list () {
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
                            store.template_list.push(item);
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

    get_template_list();
});