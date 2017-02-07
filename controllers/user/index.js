'use strict';

var Logger = require('../../lib/logger');
var log = Logger.getLogger();
var utilLibrary = require('../../lib/utilLibrary');
var userService = require('../../services/userService');
var ResponseError = require('../../errors/ResponseError');

module.exports = function (router) {

    router.get('/getinfo', function(req, res){
        userService.getUserInfo(req, res, function(err, retdata) {
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                if(retdata.retcode == 0){
                    utilLibrary.outputJsonResult(req, res, retdata.data);
                }else{
                    utilLibrary.outputJsonResult(req, res, new ResponseError({
                        code: retdata.retcode,
                        msg: retdata.errMsg
                    }));
                }
            }
        });
    });

};
