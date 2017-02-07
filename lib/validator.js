'use strict';

var url = require('url');
var validator = require('./validator_lib');

validator.check = function(target, rules){
    var errors = [];
    var value;
    var attr;
    var rule;
    for (attr in rules) {
        rule = rules[attr];
        value = deepGet(target, attr);

        var optionalIndex = rule.indexOf('optional');
        if (optionalIndex !== -1) {
            if (value === undefined) {
                continue;
            }
            rule.splice(optionalIndex, 1);
        }
        if (value === undefined) {
            errors.push({
                key: attr,
                value: 'undefined',
                message: 'field ' + attr + ' missing'
            });
            continue;
        }
        for (var i = 0; i < rule.length; i++) {
            var item = rule[i];
            var result;
            if (typeof item === 'string') {
                if (!validator[item]) {
                    errors.push({
                        key: attr,
                        value: value,
                        message: 'method validator[' + item + '] is not defined'
                    });
                    continue;
                }
                result = validator[item].apply(validator, [value]);
                if (!result) {
                    errors.push({
                        key: attr,
                        value: value,
                        message: validator.getMessage(item)
                    });
                }
            } else if (typeof item === 'object') {
                for (var j in item) {
                    var func = j;
                    var param = Array.isArray(item[j]) ? item[j] : [item[j]];
                    param.unshift(value);
                    result = validator[func].apply(validator, param);
                    if (!result) {
                        errors.push({
                            key: attr,
                            value: value,
                            message: validator.getMessage(func)
                        });
                    }
                }
            }
        }
    }
    if(errors.length <= 0){
        errors = undefined;
    }
    return errors;
};


function deepGet(obj, path) {
    var keys = path.split('.');
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (obj === undefined || !obj.hasOwnProperty(key)) {
            obj = undefined;
            break;
        }
        obj = obj[key];
    }
    return obj;
}

var rules = {
    /**
     * 判断是否是*.estay.com站点的url地址
     */
    isEstayUrl: {
        fn: function(value) {
            var flag =  validator.isURL(value, {
                protocols: ['http', 'https']
            });
            if (flag) {
                var urlObj = url.parse(value);
                if(urlObj.hostname && /estay\.com$/i.test(urlObj.hostname)){
                    return true;
                }
            }
            return false;
        },
        message: 'the url must be in *.estay.com'
    }
};
validator.extend(rules);

module.exports = validator;