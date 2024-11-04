const mysql = require('mysql2');

// Configuração da conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: '127.0.0.1',        // ou o IP do seu servidor MySQL
    user: 'root',             // seu usuário MySQL
    password: 'Rau_060203',    // sua senha MySQL
    database: 'Projeto'        // nome do banco de dados que contém a tabela Tarefas
});

// Conecta ao banco de dados e realiza uma consulta de teste para verificar a conexão
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conectado ao banco de dados MySQL!');

    // Consulta de teste para verificar a comunicação com o banco de dados
    db.query('SELECT 1 + 1 AS resultado', (err, results) => {
        if (err) {
            console.error('Erro ao executar a consulta de teste:', err);
        } else {
            console.log('Consulta de teste bem-sucedida. Resultado:', results[0].resultado);
        }
    });
});

module.exports = db;
