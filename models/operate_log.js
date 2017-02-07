var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var _Table = sequelize.define('t_operate_log', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    userid: {
        type: Sequelize.INTEGER
    },
    email: {
        type: Sequelize.STRING
    },
    url: {
        type: Sequelize.STRING
    },
    url_params: {
        type: Sequelize.TEXT
    },
    interface: {
        type: Sequelize.STRING
    },
    interface_params: {
        type: Sequelize.TEXT
    },
    status: {
        type: Sequelize.INTEGER
    },
    ctime: {
        type: Sequelize.DATE
    }
}, {
    tableName: 't_operate_log'
});

module.exports = _Table;