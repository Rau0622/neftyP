const mysql = require('mysql2');
const util = require('util');

// Configuração do pool de conexão com o banco de dados usando variáveis de ambiente
const pool = mysql.createPool({
    host: process.env.DB_HOST, // Host do banco de dados
    user: process.env.DB_USER, // Usuário do banco de dados
    password: process.env.DB_PASSWORD, // Senha do banco de dados
    database: process.env.DB_NAME, // Nome do banco de dados
    connectTimeout: 10000 // Tempo de espera para a conexão
});

// Promisify para facilitar o uso com async/await
pool.query = util.promisify(pool.query);

exports.handler = async (event) => {
    try {
        if (event.httpMethod === 'GET') {
            const tarefas = await pool.query('SELECT * FROM tarefas'); // Certifique-se de que o nome da tabela está correto (minúsculas)
            return {
                statusCode: 200,
                body: JSON.stringify(tarefas),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'POST') {
            const { nome, custo, data_limite } = JSON.parse(event.body);
            await pool.query('INSERT INTO tarefas (nome, custo, data_limite) VALUES (?, ?, ?)', [nome, custo, data_limite]);
            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Tarefa adicionada com sucesso!' }),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'PUT') {
            const { id, nome, custo, data_limite } = JSON.parse(event.body);
            await pool.query('UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?', [nome, custo, data_limite, id]);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Tarefa atualizada com sucesso!' }),
                headers: { 'Content-Type': 'application/json' }
            };
        } else if (event.httpMethod === 'DELETE') {
            const id = event.path.split('/').pop();
            await pool.query('DELETE FROM tarefas WHERE id = ?', [id]);
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
        console.error('Erro:', error); // Log do erro
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};

