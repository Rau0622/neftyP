const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: '127.0.0.1',        // IP ou nome do servidor
    user: 'root',     // seu usuário MySQL
    password: 'Rau_060203',   // sua senha MySQL
    database: 'Projeto',     // nome do banco de dados
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
