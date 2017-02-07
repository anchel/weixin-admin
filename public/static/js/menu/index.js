/**
 * Created by Anchel on 2016/9/17.
 */
$(function(){

    // $('[name="menutype"]').iCheck({
    //     checkboxClass: 'icheckbox_square-green',
    //     radioClass: 'iradio_square-green'
    // });

    var ma = new MsgAdd({
        $el: $('#menu-info .cont-click div'),
        data: {
            msg_data: {
                reply_cat: true,
                reply_msg_list: []
            }
        }
    });
    
    ma.addChangeFn(function(){
        saveTmpMenuMsg();
    });

    var jstree = null;

    function jstree_init(data){
        $('#tree-menu').jstree({
            "core" : {
                "animation" : 0,
                "multiple" : false,
                'force_text' : true,
                "themes" : { "stripes" : true },
                'check_callback' : function (operation, node, node_parent, node_position, more) {
                    return true;
                },
                'data' : data
            },
            "types" : {
                "#" : { "max_children" : 3, "max_depth" : 2 },
                "default" : { "icon" : "glyphicon glyphicon-th-large"}
            },
            "plugins" : [ "contextmenu", "dnd", "search", "state", "types", "wholerow" ]
        });

        jstree = $('#tree-menu').jstree(true);
    }

    function getMenuData(){
        $.ajax({
            url: '/menu/get',
            dataType: 'json',
            success: function(ret){
                if(ret.errcode == 0){
                    jstree_init(menuDataToTreeNode(ret.data));
                }else{
                    jstree_init(menuDataToTreeNode({}));
                    //notifiy('数据拉取失败，请重试', 'error');
                }
            },
            error: function(err){
                notifiy('数据拉取失败，请重试', 'error');
            }
        });
    }

    function menuDataToTreeNode(menudata){
        var arr = [];
        if(menudata.button){
            $.each(menudata.button, function(i, item){
                var nd = {
                    text: item.name,
                    data: item
                };
                if(item.sub_button && item.sub_button.length > 0){
                    item.sub_button.reverse();
                    nd.children = [];
                    $.each(item.sub_button, function(j, subitem){
                        nd.children.push({
                            text: subitem.name,
                            data: subitem
                        });
                    });
                }
                arr.push(nd);
            });
        }
        return arr;
    }


    getMenuData();



    $('#tree-menu').on('delete_node.jstree', function(e, data) {
        console.log(JSON.stringify(jstree.get_json()));
    });

    $('#tree-menu').on('select_node.jstree', function(e, data) {
        if(!data.selected || data.selected.length <= 0){
            return;
        }
        var id = data.selected[0];
        var nodeinfo = jstree.get_node(id);
        data = nodeinfo.data || {};
        fixData(data);
        renderMenuInfo(data);
    });

    function renderMenuInfo(data){
        var type = data.type;
        $('#menu-info').find('[name="url"]').val('');
        $('#menu-info [name="menutype"]').prop('checked', false);
        $('#menu-info [name="menutype"][value="'+type+'"]').prop('checked', true);

        checkTypeStatus(type);
        ma.data.msg_data = data.msg_data;
        ma.resetReply();
        
        if('click' == type){
            
        }else{
            $('#menu-info').find('[name="url"]').val(data.url);
        }
    }
    
    function fixData(data){
        if(!data.type){
            data.type = 'click';
        }
        if(!data.msg_data){
            data.msg_data = {
                reply_cat: true,
                reply_msg_list: []
            };
        }
    }

    $('#btn-create-menuone').on('click', function() {
        $('#modal-menuone').modal();
    });
    $('#modal-menuone').on('click', '.ok', function() {
        var el = $('#menuone-name');
        var val = el.val();
        var rootNode = jstree.get_node('#');
        if(rootNode.children.length >= 3){
            notifiy('最多添加三个一级菜单', 'warning');
            return;
        }
        if(!val){
            notifiy('菜单名称不能为空', 'warning');
        }else{
            jstree.create_node('#', {
                text: val
            }, 'last', function() {
                $('#modal-menuone').modal('hide');
            });
        }
    });

    $('#menu-info').on('click', '#btn-save-minfo', function(){
    
        saveTmpMenuMsg();

    });
    
    $('#menu-info').find('[name="url"]').on('blur', function(){
        if($(this).val()){
            saveTmpMenuMsg();
        }
    });
    
    function saveTmpMenuMsg(){
        var selnodes = jstree.get_selected(true);
        if(!selnodes || selnodes.length <= 0){
            notifiy('请先选择一个菜单', 'warning');
            return;
        }
        var selnode = selnodes[0];
    
        var type = $('#menu-info [name="menutype"]:checked').val();
        var url =  $('#menu-info').find('[name="url"]').val();
        if(!type){
            notifiy('请选择菜单类型', 'warning');
            return;
        }
        if(type == 'view' && !url){
            notifiy('url不能为空', 'warning');
            return;
        }
    
        selnode.data = selnode.data || {};
        selnode.data.type = type;
        if('view' == type){
            selnode.data.url = url;
        }else{
            delete selnode.data.url;
            selnode.data.msg_data = ma.data.msg_data;
        }
        //notifiy('操作成功', 'info')
    }

    $('#menu-info [name="menutype"]').on('click', function() {
        var val = $(this).val();
        checkTypeStatus(val);
    });

    function checkTypeStatus(type){
        if('click' == type){
            $('.cont-click').removeClass('none');
            $('.cont-view').addClass('none');
        }else{
            $('.cont-view').removeClass('none');
            $('.cont-click').addClass('none');
        }
    }

    function treeNodeToMenuData(){
        if(!jstree){
            notifiy('页面初始化失败，请刷新页面', 'warning');
            return;
        }
        var json = jstree.get_json();
        var arr = [];
        if(json.length > 0){
            $.each(json, function(i, item){
                var mi = item.data || {type: 'click', name: item.text, key: item.id};
                fixData(mi);
                if(item.children && item.children.length > 0){
                    mi.sub_button = [];
                    $.each(item.children, function(j, subitem){
                        var submi = subitem.data || {type: 'click', name: subitem.text, key: subitem.id};
                        fixData(submi);
                        submi.type = submi.type || 'view';
                        submi.name = submi.name || subitem.text;
                        if(submi.type == 'click'){
                            submi.key = submi.key || subitem.id;
                            delete submi.url;
                        }else{
                            submi.url = submi.url || '';
                            delete submi.key;
                        }
                        mi.sub_button.push(submi);
                    });
                    mi.sub_button.reverse();
                } else {
                    delete mi.sub_button;
                }
                mi.type = mi.type || 'click';
                mi.name = item.text || mi.name;
                if(mi.type == 'click'){
                    mi.key = mi.key || item.id;
                    delete mi.url;
                }else{
                    mi.url = mi.url || '';
                    mi.msg_data = null;
                    delete mi.key;
                }
                arr.push(mi);
            });
        }
        return arr;
    }

    /**
     * 保存菜单
     */
    $('#btn-menu-save').click(function(){
        if(!jstree){
            notifiy('页面初始化失败，请刷新页面', 'warning');
            return;
        }
        var rootNode = jstree.get_node('#');
        if(rootNode.children.length <= 0){
            notifiy('菜单不能为空', 'warning');
            return;
        }
        var menudata = treeNodeToMenuData();
        $.confirmModal({
            confirmMessage: '确定保存数据？',
            confirmStyle: 'success',
            confirmCallback: function(){
                $.ajax({
                    url: '/menu/save',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        menudata: JSON.stringify({
                            button: menudata
                        })
                    },
                    success: function(ret){
                        if(ret.errcode == 0){
                            notifiy('保存成功', 'success');
                        }else{
                            notifiy(ret.errmsg, 'warning');
                        }
                    },
                    error: function(){
                        notifiy('操作失败，请重试', 'warning');
                    }
                });
            }
        });
    });
    
    /**
     * 更新公众号上的菜单
     */
    $('#btn-menu-release').click(function(){
        $.confirmModal({
            confirmMessage: '确定更新公众号上的菜单？',
            confirmStyle: 'success',
            confirmCallback: function(){
                $.ajax({
                    url: '/menu/release',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        
                    },
                    success: function(ret){
                        if(ret.errcode == 0){
                            notifiy('更新成功', 'success');
                        }else{
                            notifiy(ret.errmsg, 'warning');
                        }
                    },
                    error: function(){
                        notifiy('操作失败，请重试', 'warning');
                    }
                });
            }
        });
    });

    /**
     * 删除公众号上的菜单
     */
    $('#btn-menu-delete').click(function(){
        if(!jstree){
            notifiy('页面初始化失败，请刷新页面', 'warning');
            return;
        }
        var rootNode = jstree.get_node('#');
        if(rootNode.children.length <= 0){

        }
        $.confirmModal({
            confirmMessage: '确定删除公众号上的菜单？',
            confirmStyle: 'danger',
            confirmCallback: function(){
                $.ajax({
                    url: '/menu/delete',
                    dataType: 'json',
                    success: function(ret){
                        if(ret.errcode == 0){
                            notifiy('菜单删除成功', 'success');
                        }else{
                            notifiy(ret.errmsg, 'warning');
                        }
                    },
                    error: function(){
                        notifiy('操作失败，请重试', 'warning');
                    }
                });
            }
        });
    });


});