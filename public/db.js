const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',        // ou o IP do seu servidor MySQL
    user: 'root',             // seu usuário MySQL
    password: 'Rau_060203',    // sua senha MySQL
    database: 'Projeto' // nome do banco de dados que contém a tabela Tarefas
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');
});

module.exports = db;
