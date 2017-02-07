'use strict';

var util = require('util');
var ErrorConstants = require('./ErrorConstants');

function ResponseError(message, extobj){
    extobj = extobj || {};
    Error.captureStackTrace(this, ResponseError);

    if(typeof(message) == 'object'){
        this.code = message.code;
        this.msg = message.msg;
    }else{
        this.code = ErrorConstants.DEFAULT.code;
        this.msg = message;
    }
    if(extobj.msg){
        this.msg += extobj.msg;
    }
}
util.inherits(ResponseError, Error);

module.exports = ResponseError;

for(var k in ErrorConstants){
    ResponseError[k] = ErrorConstants[k];
}