const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Listar todas as tarefas
app.get('/tarefas', (req, res) => {
    db.query('SELECT * FROM Tarefas ORDER BY ordem_apresentacao', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Incluir uma nova tarefa
app.post('/tarefas', (req, res) => {
    const { nome, custo, data_limite } = req.body;
    console.log('Dados recebidos para inclusão:', { nome, custo, data_limite });

    db.query('SELECT MAX(ordem_apresentacao) AS max_ordem FROM Tarefas', (err, result) => {
        if (err) return res.status(500).send(err);
        const ordem_apresentacao = result[0].max_ordem + 1;

        db.query('INSERT INTO Tarefas (nome, custo, data_limite, ordem_apresentacao) VALUES (?, ?, ?, ?)', 
        [nome, custo, data_limite, ordem_apresentacao], (err, result) => {
            if (err) {
                console.error('Erro ao inserir tarefa:', err);
                return res.status(500).send(err);
            }
            // Retorna a nova tarefa criada
            res.status(201).json({
                id: result.insertId,
                nome,
                custo,
                data_limite,
                ordem_apresentacao
            });
        });
    });
});

// Editar uma tarefa
app.put('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, custo, data_limite } = req.body;
    console.log('Dados recebidos para edição:', { id, nome, custo, data_limite });

    db.query('UPDATE Tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?', 
    [nome, custo, data_limite, id], (err) => {
        if (err) {
            console.error('Erro ao editar tarefa:', err);
            return res.status(500).send(err);
        }
        res.sendStatus(200);
    });
});

// Excluir uma tarefa
app.delete('/tarefas/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Tarefas WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Erro ao excluir tarefa:', err);
            return res.status(500).send(err);
        }
        res.sendStatus(200);
    });
});

// Reordenar tarefas (subir ou descer)
app.patch('/tarefas/ordem', (req, res) => {
    const { id, novaOrdem } = req.body;
    db.query('UPDATE Tarefas SET ordem_apresentacao = ? WHERE id = ?', [novaOrdem, id], (err) => {
        if (err) {
            console.error('Erro ao reordenar tarefa:', err);
            return res.status(500).send(err);
        }
        res.sendStatus(200);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
