const mysql = require('mysql2');
const util = require('util');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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
            const { nome, custo, data_limite } = JSON.parse(event.body);
            console.log('Dados recebidos para inclusão:', { nome, custo, data_limite });

            // Adicione validação dos dados aqui, se necessário
            if (!nome || isNaN(custo) || !data_limite) {
                throw new Error('Dados inválidos fornecidos');
            }

            await pool.query('INSERT INTO Tarefas (nome, custo, data_limite) VALUES (?, ?, ?)', [nome, custo, data_limite]);
            return {
                statusCode: 201,
                body: JSON.stringify({ message: 'Tarefa adicionada com sucesso!' }),
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
        console.error('Erro no servidor:', error); // Log detalhado do erro
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
