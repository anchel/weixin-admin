'use strict';

module.exports = {

    DEFAULT: {code: 1, msg: '发生错误'},

    CSRF: {code: 2, msg: 'CSRF 验证失败'},

    NOLOGIN: {code: 3, msg: '未登录'},

    WECHAT_REQUEST_ERR: {code: 24, msg: '调用微信接口失败'},
    WECHAT_RESULT_ERR: {code: 25, msg: '微信接口返回内容不正确'},

    REQUEST_CMS_ERROR: {code: 10001, msg: 'cms接口调用失败'}
};