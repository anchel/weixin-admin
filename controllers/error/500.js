'use strict';

var Logger = require('../../lib/logger');
var log = Logger.getLogger();

module.exports = function (router) {

    router.get('/', function (req, res) {

        res.send('error 500');
    });

};
