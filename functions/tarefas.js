const mysql = require('mysql2');
const util = require('util');

const connection = mysql.createConnection({
    host: '127.0.0.1', // ou o host do seu banco de dados
    user: 'root', // seu usuário do banco de dados
    password: 'Rau_060203', // sua senha do banco de dados
    database: 'Projeto' // nome do banco de dados
});

// Promisify para facilitar o uso com async/await
connection.query = util.promisify(connection.query);

exports.handler = async (event) => {
    try {
        if (event.httpMethod === 'GET') {
            // Retorna todas as tarefas
            const tarefas = await connection.query('SELECT * FROM tarefas');
            return {
                statusCode: 200,
                body: JSON.stringify(tarefas),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'POST') {
            // Adiciona uma nova tarefa
            const { nome, custo, data_limite } = JSON.parse(event.body);
            await connection.query('INSERT INTO tarefas (nome, custo, data_limite) VALUES (?, ?, ?)', [nome, custo, data_limite]);
            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Tarefa adicionada com sucesso!' }),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'PUT') {
            // Atualiza uma tarefa existente
            const { id, nome, custo, data_limite } = JSON.parse(event.body);
            await connection.query('UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?', [nome, custo, data_limite, id]);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Tarefa atualizada com sucesso!' }),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'DELETE') {
            // Exclui uma tarefa
            const id = event.path.split('/').pop(); // Obtém o ID da tarefa a partir da URL
            await connection.query('DELETE FROM tarefas WHERE id = ?', [id]);
            return {
                statusCode: 204, // No Content
                body: null
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
            body: JSON.stringify({ message: 'Erro interno do servidor' }),
            headers: { 'Content-Type': 'application/json' }
        };
    } finally {
        connection.end(); // Encerra a conexão
    }
};
