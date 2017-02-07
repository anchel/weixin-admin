/**
 * Created by Anchel on 2016/9/20.
 */

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

var Util = {
    inherit : function(childClass, parentClass){
        var tmpFn = function(){};
        tmpFn.prototype = parentClass.prototype;
        childClass.prototype = new tmpFn();
        childClass.prototype.constructor = childClass;
    },

    /**
     * 控制执行频率，在delay后会执行，保证在 delay到时能执行
     * @param {Function} fn 要执行的函数
     * @param {Number} delay 毫秒
     */
    throttle : function(fn, delay){
        var timer,
            lasttime = 0,
            args=null,
            contextthis=null,
            result;

        function later(){
            timer = null;
            lasttime = (new Date()).getTime();
            result = fn.apply(contextthis, args);
            args = contextthis = null;
        }

        return function(){
            args = arguments;
            contextthis = this;
            var now = (new Date()).getTime();
            var remaining = delay - (now - lasttime);
            if(remaining <= 0 || remaining > delay){
                if(timer){
                    clearTimeout(timer);
                    timer = null;
                }
                lasttime = now;
                result = fn.apply(contextthis, args);
                args = contextthis = null;
            }else if(!timer){
                timer = setTimeout(later, remaining);
            }

            return result;
        };
    },

    /**
     * 控制执行频率，和throttle的区别是，如果在delay内触发会重新计时
     * @param {Function} fn 要执行的函数
     * @param {Number} delay 毫秒
     */
    debounce : function(fn, delay){
        var timer,
            args=null,
            contextthis=null,
            result;

        function later(){
            timer = null;
            result = fn.apply(contextthis, args);
            args = contextthis = null;
        }

        return function(){
            args = arguments;
            contextthis = this;
            timer && clearTimeout(timer);
            timer = setTimeout(later, delay);

            return result;
        };
    }
};

function Emitter(obj) {
    if (obj)
        return mixin(obj);
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
    for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
    }
    return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
    return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.one = function(event, fn) {
    function on() {
        this.off(event, on);
        fn.apply(this, arguments);
    }


    on.fn = fn;
    this.on(event, on);
    return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};

    // all
    if (0 == arguments.length) {
        this._callbacks = {};
        return this;
    }

    // specific event
    var callbacks = this._callbacks['$' + event];
    if (!callbacks)
        return this;

    // remove all handlers
    if (1 == arguments.length) {
        delete this._callbacks['$' + event];
        return this;
    }

    // remove specific handler
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
            callbacks.splice(i, 1);
            break;
        }
    }
    return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event) {
    this._callbacks = this._callbacks || {};
    var args = [].slice.call(arguments, 1), callbacks = this._callbacks['$' + event];

    if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
            callbacks[i].apply(this, args);
        }
    }

    return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event) {
    return !!this.listeners(event).length;
};

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
    var cache = {};

    this.tmpl = function tmpl(str, data){
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
            cache[str] = cache[str] ||
                tmpl(document.getElementById(str).innerHTML) :

            // Generate a reusable function that will serve as a template
            // generator (and which will be cached).
            new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
                "with(obj){p.push('" +

                // Convert the template into pure JavaScript
                str
                    .replace(/[\r\t\n]/g, " ")
                    .split("<%").join("\t")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("\t").join("');")
                    .split("%>").join("p.push('")
                    .split("\r").join("\\'")
                + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn( data ) : fn;
    };
})();

function picerr(pic, type){
    pic.src = 'http://image.teshehui.com/mui/style/common/img/placeholder/120.png';
}

function notifiy(msg, type){
    $.notify(msg,{
        type: type,
        z_index: 10086,
        delay: 500,
        timer: 100,
        placement: {
            align: 'center'
        }
    });
}

$(function(){

    function initUserInfo(){
        $.ajax({
            url: '/user/getinfo',
            dataType: 'json',
            success: function(ret){
                if(ret.errcode == 0){
                    renderUserInfo(ret.data);
                }else{
                    notifiy('未登录，请重试', 'warning');
                }
            },
            error: function(err){
                notifiy('查询用户信息失败，请刷新页面重试', 'warning');
            }
        });
    }

    function renderUserInfo(info){
        $('.userinfo-name').text(info.name);
        $('.userinfo-email').text(info.email);
        if(info.header){
            $('.userinfo-header').attr('src', info.header);
        }
    }

    initUserInfo();

    $('.logout').click(function() {
        var url = 'http://' + g_base.loginbase + '/api/logout';
        $.ajax({
            url: url,
            dataType: 'jsonp',
            success: function(){
                location.reload();
            },
            error: function(){
                notifiy('操作失败，请重试', 'warning');
                setTimeout(function(){
                    location.reload();
                }, 1000);
            }
        });
    });

    $(document.body).on('click', '.img-preview', function (e) {
        var imgurl = $(this).data('imgurl');
        blueimp.Gallery([
            imgurl
        ]);
    });
});

var ImageUploader = (function(){

    var IDX = 0;

    function getBtnEl () {
        IDX++;
        var $el = $('<button id="btn_upload_'+ IDX +'" style="display: none;"></button>');
        $(document.body).append($el);
        return $el.get(0);
    }


    return function (opts) {
        opts = opts || {};
        this.el = opts.el || getBtnEl();
        this.autoupload = true;
        this.uploader = null;
    }

})();

Util.inherit(ImageUploader, Emitter);

$.extend(ImageUploader.prototype, {

    init: function () {
        var me = this;
        var uploader = me.uploader = new plupload.Uploader({
            browse_button : me.el, //触发文件选择对话框的按钮，为那个元素id
            url : '/upload/uploadimg', //服务器端的上传页面地址
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
            if(me.autoupload){
                uploader.start();
            }
        });

        uploader.bind('BeforeUpload',function(uploader, file){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作

        });

        uploader.bind('UploadProgress',function(uploader, file){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作

        });

        uploader.bind('FileUploaded',function(uploader, file, res){
            //每个事件监听函数都会传入一些很有用的参数，
            //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
            var ret = $.parseJSON(res.response);
            if(ret.errcode == 0){
                if(ret.data){
                    me.emit('uploaded', ret.data);
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
            notifiy('文件上传失败 ' + errObj.message, 'warning');
        });
    }

});

var getUploader = (function(){

    var iu = null;

    return function () {
        if(!iu){
            iu = new ImageUploader();
            iu.init();
        }
        return iu;
    }
})();

function initUpload(elTrigger, $elField, $elPreview){
    var uploader = new plupload.Uploader({
        browse_button : elTrigger, //触发文件选择对话框的按钮，为那个元素id
        url : '/upload/uploadimg', //服务器端的上传页面地址
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
        uploader.start();
    });
    
    uploader.bind('BeforeUpload',function(uploader, file){
        //每个事件监听函数都会传入一些很有用的参数，
        //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
        
    });
    
    uploader.bind('UploadProgress',function(uploader, file){
        //每个事件监听函数都会传入一些很有用的参数，
        //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
        
    });
    
    uploader.bind('FileUploaded',function(uploader, file, res){
        //每个事件监听函数都会传入一些很有用的参数，
        //我们可以利用这些参数提供的信息来做比如更新UI，提示上传进度等操作
        var ret = $.parseJSON(res.response);
        if(ret.errcode == 0){
            if(ret.data){
                $elField.val(ret.data.url);
                $elPreview.attr('src', ret.data.url);
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
        notifiy('文件上传失败 ' + errObj.message, 'warning');
    });
}

