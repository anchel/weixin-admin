'use strict';

var fs = require('fs');
var path = require('path');
var config = require('config');

var manifestCssJson = {};

// var _p = path.resolve(process.cwd(), config.webui.manifestCssFile);
// if(fs.existsSync(_p)){
//     manifestCssJson = JSON.parse(fs.readFileSync(_p));
// }

var _lib = {

    tagJs: function(chunk, context, bodies, params) {
        var content = config.webui.jsPrefix + params.name;
        if(params.ver){
            content = content + '?v=' + params.ver;
        }
        chunk.write(content);
    },

    tagCss: function(chunk, context, bodies, params) {
        var n = params.name || '';
        if(n && manifestCssJson[n] != undefined){
            n = manifestCssJson[n];
        }
        chunk.write(config.webui.cssPrefix + n);
    }
};

module.exports = _lib;