'use strict';

var utilLibrary = require('../../lib/utilLibrary');
var ResponseError = require('../../errors/ResponseError');
var Logger = require('../../lib/logger');
var log = Logger.getLogger();
var subscribeService = require('../../services/subscribeService');

module.exports = function (router) {

    router.get('/dashboarddata', function(req, res){
        subscribeService.getDashboardData(function(err, data){
            if(err){
                utilLibrary.outputJsonResult(req, res, new ResponseError(err.toString()));
            }else{
                utilLibrary.outputJsonResult(req, res, data);
            }
        });
    });
};
