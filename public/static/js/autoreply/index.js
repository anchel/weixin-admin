/**
 * Created by Anchel on 2016/9/17.
 */
$(function(){

    var RTYPE = 1; // 1-被添加 2-消息 3-关键词 4-菜单点击

    var ma = new MsgAdd({
        $el: $('.msg-cont'),
        data: {
            msg_data: {
                reply_cat: true,
                reply_msg_list: []
            }
        }
    });

    function initData(){
        $.ajax({
            url: '/autoreply/getdata',
            dataType: 'json',
            data: {
                type: RTYPE
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
        if(!data || !data.reply_content){
            //notifiy('数据异常，请联系管理员', 'warning');
            return;
        }

        var msg_data = $.parseJSON(data.reply_content);
        ma.data.msg_data = msg_data;
        $('#msg-id').val(data.id);
    }

    initData();

    $('#save-data').click(function(e){
        var id = $('#msg-id').val();

        $.ajax({
            url: '/autoreply/savedata',
            dataType: 'json',
            type: 'post',
            data: {
                id: id || undefined,
                type: RTYPE,
                reply_content: JSON.stringify(ma.data.msg_data)
            },
            success: function(ret){
                if(ret.errcode == 0){
                    notifiy('操作成功', 'success');
                }else{
                    notifiy('操作失败，请重试(' + ret.errmsg + ')', 'warning');
                }
            },
            error: function(err){
                notifiy('操作失败，请重试', 'warning');
            }
        });
    });

});