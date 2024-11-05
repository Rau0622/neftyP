const mysql = require('mysql2');
const util = require('util');

const pool = mysql.createPool({
    host: process.env.DB_HOST, // Altere para a variável de ambiente do host do banco de dados
    user: process.env.DB_USER, // variável de ambiente do usuário
    password: process.env.DB_PASSWORD, // variável de ambiente da senha
    database: process.env.DB_NAME, // variável de ambiente do nome do banco de dados
    connectTimeout: 10000
});

// Promisify para facilitar o uso com async/await
pool.query = util.promisify(pool.query);

exports.handler = async (event) => {
    try {
        if (event.httpMethod === 'GET') {
            const tarefas = await pool.query('SELECT * FROM Tarefas');
            return {
                statusCode: 200,
                body: JSON.stringify(tarefas),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'POST') {
            const { nome, custo, data_limite, ordem } = JSON.parse(event.body);
            await pool.query('INSERT INTO Tarefas (nome, custo, data_limite, ordem) VALUES (?, ?, ?, ?)', [nome, custo, data_limite, ordem]);
            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Tarefa adicionada com sucesso!' }),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'PUT') {
            const { id, nome, custo, data_limite } = JSON.parse(event.body);
            await pool.query('UPDATE Tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?', [nome, custo, data_limite, id]);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Tarefa atualizada com sucesso!' }),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'DELETE') {
            const id = event.path.split('/').pop();
            await pool.query('DELETE FROM Tarefas WHERE id = ?', [id]);
            return {
                statusCode: 204,
                body: null
            };
        } else if (event.httpMethod === 'GET' && event.path.endsWith('/ordem')) {
            const [result] = await pool.query('SELECT IFNULL(MAX(ordem), 0) + 1 AS proximo_ordem FROM Tarefas');
            return {
                statusCode: 200,
                body: JSON.stringify(result[0]),
                headers: { 'Content-Type': 'application/json' }
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Método não permitido' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }
    } catch (error) {
        console.error('Erro:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

