/**
 * Created by Anchel on 2016/10/27.
 */
var urllib = require('url');
var validator_lib = require('../validator_lib');

var _util = {
    checkTeshehuiUrl: function (rurl){
        if(!rurl){
            return '参数rurl不能为空';
        }
        if(!validator_lib.isURL(rurl)){
            return '参数rurl不正确';
        }
        var rurlobj = urllib.parse(rurl);
        if(rurlobj.hostname && /\.teshehui\.com$/i.test(rurlobj.hostname)){

        }else{
            return '参数rurl的域名必须是 .teshehui.com 结尾';
        }

        return '';
    }
};

module.exports = _util;