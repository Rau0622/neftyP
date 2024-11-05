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
            try {
                console.log("Dados recebidos no evento POST:", event.body);

                const { nome, custo, data_limite } = JSON.parse(event.body);

                // Verificação detalhada dos valores recebidos
                console.log("Dados processados para inclusão:", { nome, custo, data_limite });

                // Validar se os dados são válidos
                if (!nome || typeof custo !== 'number' || !data_limite) {
                    throw new Error("Dados inválidos: Verifique se todos os campos estão preenchidos corretamente.");
                }

                await pool.query(
                    'INSERT INTO Tarefas (nome, custo, data_limite) VALUES (?, ?, ?)',
                    [nome, custo, data_limite]
                );

                return {
                    statusCode: 201,
                    body: JSON.stringify({ message: 'Tarefa adicionada com sucesso!' }),
                    headers: { 'Content-Type': 'application/json' }
                };
            } catch (error) {
                console.error('Erro ao processar requisição POST:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'Erro ao incluir tarefa', error: error.message }),
                    headers: { 'Content-Type': 'application/json' }
                };
            }
        } else if (event.httpMethod === 'PUT') {
            const { id, nome, custo, data_limite } = JSON.parse(event.body);
            await pool.query(
                'UPDATE Tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?',
                [nome, custo, data_limite, id]
            );
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
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Método não permitido' }),
                headers: { 'Content-Type': 'application/json' }
            };
        }
    } catch (error) {
        console.error('Erro geral:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Erro interno do servidor', error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
