/**
 * Created by Anchel on 2016/11/18.
 */



var msg_edit_data = {
    reply_type_list: [
        {
            active: true,
            type: 'text',
            name: '文本'
        },{
            active: false,
            type: 'image',
            name: '图片'
        },{
            active: false,
            type: 'mpnews',
            name: '图文'
        },{
            active: false,
            type: 'news',
            name: '图文（外链）'
        }
    ],

    news_outer_data: {
        _p: null,
        editArticle: {
            title: '',
            description: '',
            picurl: '',
            url: ''
        },
        articles: [

        ]
    }
};

function MsgAdd(opts){
    opts = opts || {};
    var self = this;
    this.$el = opts.$el;
    this.changefns = [];
    this.data = {
        msg_data: {
            reply_cat: true,
            reply_msg_list: []
        },
        reply_type_list: []
    };
    $.extend(this.data, msg_edit_data);

    if(opts.data){
        $.extend(this.data, opts.data);
    }


    this.app = new Vue({
        el: self.$el.get(0),
        template: '#template-msg-app',
        data: self.data,
        computed: {

        },
        methods: {
            setCurReplyType: function(idx){
                this.reply_type_list.forEach(function(v, i){
                    idx === i ? v.active = true : v.active = false;
                });
            }
        },
        components: {
            'msg-item-text': {
                props: ['data', 'idx'],
                template: '#template-msg-text',
                methods: {
                    removeMsg: function(){
                        self.removeMsg(this.idx);
                    }
                }
            },
            'msg-item-image': {
                props: ['data', 'idx'],
                template: '#template-msg-image',
                methods: {
                    removeMsg: function(){
                        self.removeMsg(this.idx);
                    },
                    updateMsg: function () {
                        var me = this;
                        choose_image({
                            max: 1,
                            okfn: function(msgs){
                                if(msgs && msgs.length){
                                    self.updateMsg(me.idx, msgs[0]);
                                }
                            }
                        });
                    }
                }
            },
            'msg-item-news': {
                props: ['data', 'idx'],
                template: '#template-msg-news',
                computed: {
                    firstSubitem: function(){
                        var fsi = null;
                        if(this.data.content && this.data.content.news_item && this.data.content.news_item.length){
                            fsi = this.data.content.news_item[0];
                        }
                        return fsi;
                    },
                    otherSubitem: function(){
                        var fsi = null;
                        if(this.data.content && this.data.content.news_item && this.data.content.news_item.length){
                            fsi = this.data.content.news_item.slice(1);
                        }
                        return fsi;
                    }
                },
                methods: {
                    removeMsg: function(){
                        self.removeMsg(this.idx);
                    },
                    updateMsg: function(){
                        var me = this;
                        choose_news({
                            max: 1,
                            okfn: function(msgs){
                                if(msgs && msgs.length){
                                    self.updateMsg(me.idx, msgs[0]);
                                }
                            }
                        });
                    }
                }
            },
            'msg-item-news-outer': {
                props: ['data', 'idx'],
                template: '#template-msg-news-outer',
                computed: {
                    firstSubitem: function(){
                        var fsi = null;
                        if(this.data.content && this.data.content.length){
                            fsi = this.data.content[0];
                        }
                        return fsi;
                    },
                    otherSubitem: function(){
                        var fsi = null;
                        if(this.data.content && this.data.content.length){
                            fsi = this.data.content.slice(1);
                        }
                        return fsi;
                    }
                },
                methods: {
                    removeMsg: function(){
                        self.removeMsg(this.idx);
                    },
                    updateMsg: function () {
                        self.data.news_outer_data.articles.splice(0, self.data.news_outer_data.articles.length);
                        this.data.content.forEach(function(ai){
                            self.data.news_outer_data.articles.push(ai);
                        });
                        self.data.news_outer_data._p = this.data.content;
                        self.data.reply_type_list.forEach(function(rt){
                            if(rt.type == 'news'){
                                rt.active = true;
                            }else{
                                rt.active = false;
                            }
                        });
                    }
                }
            },
            'edit-item-text': {
                props: ['data', 'idx'],
                data: function () {
                    return {
                        content: ''
                    }
                },
                template: '#template-edit-text',
                methods: {
                    okMsg: function () {
                        self.addMsgs([{
                            type: 'text',
                            content: this.content
                        }])
                    }
                }
            },
            'edit-item-image': {
                props: ['data', 'idx'],
                template: '#template-edit-image',
                methods: {
                    chooseImage: function(){
                        choose_image({
                            max: 1,
                            okfn: function(msgs){
                                
                                self.addMsgs(msgs);
                            }
                        });
                    }
                }
            },
            'edit-item-news': {
                props: ['data', 'idx'],
                template: '#template-edit-news',
                methods: {
                    chooseNews: function(){
                        choose_news({
                            max: 1,
                            okfn: function(msgs){
                                
                                self.addMsgs(msgs);
                            }
                        });
                    }
                }
            },
            'edit-item-news-outer': {
                props: ['data', 'idx'],
                data: function(){
                    return {
                        __newsdata: self.data.news_outer_data
                    }
                },
                template: '#template-edit-news-outer',
                methods: {
                    addArticle: function(){
                        if(!this._data.__newsdata.editArticle.title || !this._data.__newsdata.editArticle.description || !this._data.__newsdata.editArticle.url || !this._data.__newsdata.editArticle.picurl){
                            notifiy('请填写完整的文章信息', 'warning');
                            return;
                        }
                        var na = {};
                        $.extend(na, this._data.__newsdata.editArticle);
                        this._data.__newsdata.articles.push(na);
                        if(this._data.__newsdata._p){
                            this._data.__newsdata._p.push(na);
                        }
                    },
                    removeArticle: function(idx){
                        var len = this._data.__newsdata.articles.length;
                        if(idx >=0 && idx < len){
                            this._data.__newsdata.articles.splice(idx, 1);
                            if(this._data.__newsdata._p){
                                this._data.__newsdata._p.splice(idx, 1);
                            }
                        }
                    },
                    okfn: function(){
                        if(!this._data.__newsdata.articles.length){
                            notifiy('请至少添加一篇文章', 'warning');
                            return;
                        }
                        if(this._data.__newsdata._p){
                            this._data.__newsdata._p = null;
                            this._data.__newsdata.articles.splice(0, this._data.__newsdata.articles.length);
                            return;
                        }
                        var content = [];
                        $.extend(content, this._data.__newsdata.articles);
                        self.addMsgs([
                            {
                                type: 'news',
                                content: content
                            }
                        ]);
                        this._data.__newsdata.articles.splice(0, this._data.__newsdata.articles.length);
                    },
                    selectImage: function () {
                        var me = this;
                        var iu = getUploader();
                        iu.one('uploaded', function (data) {
                            me._data.__newsdata.editArticle.picurl = data.url;
                        });
                        setTimeout(function(){
                            iu.el.click();
                        }, 10);
                    }
                }
            }
        }
    });
}

$.extend(MsgAdd.prototype, {

    resetReply: function () {
        var me = this;
        me.data.reply_type_list.forEach(function(rt) {
            if(rt.type == 'text'){
                rt.active = true;
            }else{
                rt.active = false;
            }
        });
        me.data.news_outer_data._p = null;
        me.data.news_outer_data.articles.splice(0, me.data.news_outer_data.articles.length);
    },
    
    updateMsg: function (idx, data) {
        var me = this;
        var msg = me.data.msg_data.reply_msg_list[idx];
        if(!msg) return;

        $.extend(msg, data);
        return msg;
    },
    
    removeMsg: function (idx) {
        var me = this;
        var len = me.data.msg_data.reply_msg_list.length;
        if(idx >=0 && idx < len){
            me.data.msg_data.reply_msg_list.splice(idx, 1);
            me.triggerChange();
        }
    },
    
    addMsgs: function (msgs) {
        var me = this;
        if(msgs && msgs.length){
            msgs.forEach(function(msg){
                me.data.msg_data.reply_msg_list.push(msg);
            });
            me.triggerChange();
        }
    },
    
    addChangeFn: function(fn){
        this.changefns.push(fn);
    },
    
    triggerChange: function(){
        this.changefns.forEach(function(chfn){
            chfn();
        });
    }

});

/**
 * 选择图片
 */
var choose_image = (function(){
    var TYPE = 'image';
    var COUNT = 12;
    var CUR_PAGE = 0;
    var TOTAL_PAGE = 0;
    var INIT_PAGER = false;

    var SELECT_LIMIT = 1;

    function reset(){
        TYPE = 'image';
        COUNT = 12;
        CUR_PAGE = 0;
        TOTAL_PAGE = 0;
        INIT_PAGER = false;

        SELECT_LIMIT = 1;
    }

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
                        $('#material-choose-image').modal({

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
                dd.type = 'image';
            });
        }
        var str = tmpl($('#tpl-image-list').html(), data);
        $('#material-choose-image .listcont').html(str);
    }

    function initPager (totalPages, cb) {
        var options = {
            bootstrapMajorVersion: 3,
            size: 'small',
            currentPage: 1,
            totalPages: totalPages,
            onPageClicked: function(e, originalEvent, type, page){
                cb(page-1);
            }
        };

        $('#material-choose-image .pagination').bootstrapPaginator(options);
    }

    var _okfn = null;

    $('#material-choose-image').on('click', '.ok', function(){

        var $els = $('#material-choose-image').find('.material-item.select');
        if($els.size() > SELECT_LIMIT){
            notifiy('最多只能选择个' + SELECT_LIMIT + '图片');
            return;
        }
        var datas = [];
        $els.each(function(el){
            var $this = $(this);
            var str = $this.data('content');
            if(typeof(str) === 'string'){
                str = JSON.parse(str);
            }
            
            datas.push(str);
        });
        $('#material-choose-image').modal('hide');
        if(_okfn){
            _okfn(datas);
        }
    });

    $('#material-choose-image').on('click', '.material-item', function(){
        $(this).toggleClass('select');
    });

    return function(opts){
        reset();
        opts = opts || {};

        SELECT_LIMIT = opts.max || 1;
        _okfn = opts.okfn;

        getdata();
    }

})();

/**
 * 选择图文消息
 */
var choose_news = (function(){
    var TYPE = 'news';
    var COUNT = 6;
    var CUR_PAGE = 0;
    var TOTAL_PAGE = 0;
    var INIT_PAGER = false;
    
    var SELECT_LIMIT = 1;
    
    function reset(){
        TYPE = 'news';
        COUNT = 6;
        CUR_PAGE = 0;
        TOTAL_PAGE = 0;
        INIT_PAGER = false;
        
        SELECT_LIMIT = 1;
    }
    
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
                        $('#material-choose-news').modal({
                            
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
                dd.type = 'mpnews';
            });
        }
        var str = tmpl($('#tpl-news-list').html(), data);
        $('#material-choose-news .listcont').html(str);
    }
    
    function initPager (totalPages, cb) {
        var options = {
            bootstrapMajorVersion: 3,
            size: 'small',
            currentPage: 1,
            totalPages: totalPages,
            onPageClicked: function(e, originalEvent, type, page){
                cb(page-1);
            }
        };
        
        $('#material-choose-news .pagination').bootstrapPaginator(options);
    }
    
    var _okfn = null;
    
    $('#material-choose-news').on('click', '.ok', function(){
        
        var $els = $('#material-choose-news').find('.material-item.select');
        if($els.size() > SELECT_LIMIT){
            notifiy('最多只能选择个' + SELECT_LIMIT + '图片');
            return;
        }
        var datas = [];
        $els.each(function(el){
            var $this = $(this);
            var str = $this.data('content');
            if(typeof(str) === 'string'){
                str = JSON.parse(str);
            }
            
            datas.push(str);
        });
        $('#material-choose-news').modal('hide');
        if(_okfn){
            _okfn(datas);
        }
    });
    
    $('#material-choose-news').on('click', '.material-item', function(){
        $(this).toggleClass('select');
    });
    
    return function(opts){
        reset();
        opts = opts || {};
        
        SELECT_LIMIT = opts.max || 1;
        _okfn = opts.okfn;
        
        getdata();
    }
    
})();