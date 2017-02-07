var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var AutoreplyConf = sequelize.define('t_autoreply_conf', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    type: {
        type: Sequelize.INTEGER
    },
    keyid: {
        type: Sequelize.STRING
    },
    keyname: {
        type: Sequelize.STRING
    },
    reply_type: {
        type: Sequelize.STRING
    },
    reply_content: {
        type: Sequelize.TEXT
    },
    reply_media_id: {
        type: Sequelize.STRING
    },
    reply_rule_name: {
        type: Sequelize.STRING
    },
    reply_rule_keywords: {
        type: Sequelize.STRING
    },
    reply_rule_keywords_def: {
        type: Sequelize.STRING
    }
}, {
    tableName: 't_autoreply_conf'
});

module.exports = AutoreplyConf;