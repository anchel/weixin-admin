var config = require('config');
var _ = require('lodash');
var utilLibrary = require('../lib/utilLibrary');
var requestLibrary = require('../lib/requestLibrary');
var cmsBaseUrl = config.get('hostConfig.cmsweb');
var Logger = require('../lib/logger');
var ResponseError = require('../errors/ResponseError');

var log = Logger.getLogger();

var cmsService = {

	getSubjectData: function(params, cb){
        var defaultParams = {
            subjectCode: '',
            unIssue: 0
        };
        _.extend(defaultParams, params);
        var url = cmsBaseUrl + '/h5/subject';
        requestLibrary.request({
            url: url,
            method: 'get',
            qs: defaultParams,
            //proxy: 'http://127.0.0.1:8888',
            json: true,
            timeout: 10000
        }, function(err, body, res){
            if(err || !body || body.status != 0 || (body && body.code != '200')){
                cb(new ResponseError(ResponseError.REQUEST_CMS_ERROR));
            }else{
                cb(null, body);
            }
        });
    }
};


module.exports = cmsService;








