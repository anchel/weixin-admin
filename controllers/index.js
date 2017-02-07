'use strict';

var Logger = require('../lib/logger');
var log = Logger.getLogger();
var subscribeService = require('../services/subscribeService');

module.exports = function (router) {

    router.get('/', function (req, res) {
        subscribeService.getDashboardData(function(err, data){
            var dashboarddata = err?{}:data;
            res.render('index', {
                dashboarddata: dashboarddata
            });
        });

    });

};
