/**
 * Created by Anchel on 2016/11/3.
 */


$(function() {

    var TYPE = 'image';
    var COUNT = 30;
    var CUR_PAGE = 0;
    var TOTAL_PAGE = 0;
    var INIT_PAGER = false;

    function getdata(){
        var offset = CUR_PAGE*COUNT;
        var count = COUNT;

        $.ajax({
            url: '/material/list/getdata',
            dataType: 'json',
            data: {
                type: TYPE,
                offset: offset,
                count: count
            },
            success: function(retjson) {
                if(retjson.errcode === 0){
                    var data = retjson.data;
                    renderData(data);
                    if(!INIT_PAGER) {
                        INIT_PAGER = true;
                        TOTAL_PAGE = Math.ceil(data.total_count / COUNT);
                        initPager(TOTAL_PAGE, function(page){
                            CUR_PAGE = page;
                            getdata();
                        });
                    }
                } else {
                    notifiy('数据获取异常，请重试', 'warning');
                }
            },
            error: function(err) {
                notifiy('数据获取失败，请重试', 'warning');
            }
        });
    }

    function renderData (data) {

        if(data && data.item){
            $.each(data.item, function(i, dd){
                dd.pic_url = '/mui/style/2016/wechat/' + dd.media_id + '';
            });
        }
        var str = tmpl($('#tpl-list').html(), data);
        $('#listcont').html(str);
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

    /**
     * 下载素材
     */
    $(document.body).on('click', '.downmaterial', function(){
        var $this = $(this);
        var $mi = $this.parents('.material-item');
        var mid = $this.attr('data-for');
        var $img = $('[data-mid="'+mid+'"]');
        $.ajax({
            url: '/material/list/getmaterial',
            data: {
                media_id: mid
            },
            success: function(ret){
                if(ret.errcode === 0){
                    $img.attr('src', ret.data.url);
                } else {
                    notifiy('操作失败，请重试', 'warning')
                }
            },
            error: function(err){
                notifiy('操作失败，请重试', 'warning')
            }
        })
    });

    /**
     * 删除素材
     */
    $(document.body).on('click', '.delmaterial', function(){
        var $this = $(this);
        var $mi = $this.parents('.material-item');
        var mid = $this.attr('data-for');

        $.confirmModal({
            confirmMessage: '确定删除该素材？',
            confirmStyle: 'success',
            confirmCallback: function(){
                $.ajax({
                    url: '/material/list/delmaterial',
                    data: {
                        media_id: mid
                    },
                    success: function(ret){
                        if(ret.errcode === 0){
                            notifiy('删除成功', 'success');
                            getdata();
                        } else {
                            notifiy('操作失败，请重试', 'warning')
                        }
                    },
                    error: function(err){
                        notifiy('操作失败，请重试', 'warning')
                    }
                })
            }
        });
    });

    getdata();

    $('.uploadfile').each(function(i, el){
        var selfield = $(el).attr('file-field');
        var selpreview = $(el).attr('file-preview');
        var $elField = $(el).parent().find(selfield);
        var $elPreview = $(el).parent().find(selpreview);
        initUpload(el, $elField, $elPreview);
    });

    function initUpload(elTrigger, $elField, $elPreview){
        var uploader = new plupload.Uploader({
            browse_button : elTrigger, //触发文件选择对话框的按钮，为那个元素id
            url : '/material/upload/common?type=image', //服务器端的上传页面地址
            flash_swf_url : 'js/Moxie.swf', //swf文件，当需要使用swf方式进行上传时需要配置该参数
            file_data_name: 'filedatas',
            filters: {
                mime_types : [ //只允许上传图片和zip文件
                    { title : "Image files", extensions : "jpg,gif,png" }
                ],
                max_file_size : '4096kb', //最大只能上传4096kb的文件
                prevent_duplicates : true //不允许选取重复文件
            }
        });

        //在实例对象上调用init()方法进行初始化
        uploader.init();

        //绑定各种事件，并在事件监听函数中做你想做的事
        uploader.bind('FilesAdded',function(uploader, files){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            $(elTrigger).prop('disabled', true);
            uploader.start();
        });

        uploader.bind('BeforeUpload',function(uploader, file){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            notifiy('文件上传中，请耐心等候')
        });

        uploader.bind('UploadProgress',function(uploader, file){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作

        });

        uploader.bind('FileUploaded',function(uploader, file, res){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            $(elTrigger).prop('disabled', false);
            var ret = $.parseJSON(res.response);
            if(ret.errcode == 0){
                if(ret.data){
                    notifiy('文件上传成功', 'success');
                    getdata();
                }else{
                    notifiy('文件上传失败', 'warning');
                }
            }else{
                notifiy('文件上传失败', 'warning');
            }
        });

        uploader.bind('Error',function(uploader, errObj){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            $(elTrigger).prop('disabled', false);
            notifiy('文件上传失败 ' + errObj.message, 'warning');
        });
    }

    $(document.body).on('click', '.material-item .preview', function (e) {
        var imgurl = $(this).parents('.material-item').find('.item-pic-cont img').attr('src');
        blueimp.Gallery([
            imgurl
        ]);
    });
});