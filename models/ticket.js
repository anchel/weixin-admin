var Sequelize = require('sequelize');
var sequelize = require('./sequelize');

var Ticket = sequelize.define('t_ticket', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true
    },
    type: {
        type: Sequelize.STRING,
        unique: true
    },
    ticket: {
        type: Sequelize.STRING
    },
    expire_time: {
        type: Sequelize.BIGINT
    }
}, {
    tableName: 't_ticket'
});

module.exports = Ticket;