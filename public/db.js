const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'seu_host',        // IP ou nome do servidor
    user: 'seu_usuario',     // seu usuário MySQL
    password: 'sua_senha',   // sua senha MySQL
    database: 'Projeto',     // nome do banco de dados
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;
