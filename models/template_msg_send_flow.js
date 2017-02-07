var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var _Table = sequelize.define('t_template_msg_send_flow', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    platform: {
        type: Sequelize.STRING
    },
    touser: {
        type: Sequelize.STRING
    },
    template_id: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    data: {
        type: Sequelize.TEXT
    },
    msgid: {
        type: Sequelize.BIGINT
    },
    status: {
        type: Sequelize.INTEGER
    },
    ctime: {
        type: Sequelize.DATE
    }
}, {
    tableName: 't_template_msg_send_flow'
});

module.exports = _Table;