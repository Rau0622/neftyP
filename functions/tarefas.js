<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lista de Tarefas</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .container {
            padding: 20px;
            max-width: 800px; 
            margin: auto;
        }

        .task-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border: 1px solid #ccc;
            margin-bottom: 5px;
        }

        .task-cell {
            flex: 1;
            text-align: left;
            padding: 5px;
        }

        .task-cell.task-actions {
            display: flex; 
            gap: 5px;
        }

        button {
            padding: 5px 10px;
            cursor: pointer;
        }

        .destaque {
            background-color: goldenrod;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Lista de Tarefas</h1>

        <form id="tarefaForm" onsubmit="incluirTarefa(); return false;">
            <label for="nome">Nome da Tarefa:</label>
            <input type="text" id="nome" required>

            <label for="custo">Custo (R$):</label>
            <input type="text" id="custo" required>

            <label for="data_limite">Data Limite (DD/MM/AAAA):</label>
            <input type="text" id="data_limite" required oninput="formatarData(this)">

            <button type="submit">Adicionar Tarefa</button>
        </form>

        <div id="tarefasTable"></div>

        <!-- Formulário de Edição -->
        <div id="formularioEdicao" style="display: none;">
            <h2>Editar Tarefa</h2>
            <label for="edit_nome">Nome da Tarefa:</label>
            <input type="text" id="edit_nome" required>

            <label for="edit_custo">Custo (R$):</label>
            <input type="text" id="edit_custo" required>

            <label for="edit_data_limite">Data Limite (AAAA-MM-DD):</label>
            <input type="text" id="edit_data_limite" required oninput="formatarData(this)">

            <button id="btnSalvarEdicao" onclick="salvarEdicao()">Salvar Alterações</button>
            <button type="button" onclick="cancelarEdicao()">Cancelar</button>
        </div>
    </div>

    <script>
        const url = '/.netlify/functions/tarefas'; // URL para a função serverless
        let tarefas = [];
        let tarefaAtualId = null;

        document.addEventListener("DOMContentLoaded", () => {
            carregarTarefas();
        });

        function carregarTarefas() {
            console.log('Tentando carregar tarefas...');
            document.getElementById('tarefasTable').innerHTML = '<p>Carregando tarefas...</p>';

            fetch(url)
                .then(response => {
                    console.log('Resposta do servidor:', response);
                    if (!response.ok) {
                        throw new Error('Erro ao carregar tarefas');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Tarefas carregadas:', data);
                    if (Array.isArray(data)) {
                        tarefas = data;
                        atualizarTabela();
                    } else {
                        throw new Error('Formato de dados inesperado');
                    }
                })
                .catch(error => {
                    alert('Não foi possível carregar as tarefas. Erro: ' + error.message);
                });
        }

        function atualizarTabela() {
            const table = document.getElementById('tarefasTable');
            table.innerHTML = 
                `<div class="task-row header-row">
                    <div class="task-cell">Nome da Tarefa</div>
                    <div class="task-cell">Custo (R$)</div>
                    <div class="task-cell">Data Limite</div>
                    <div class="task-cell">Ordem</div>
                    <div class="task-cell">Ações</div>
                </div>`;
                
            tarefas.forEach((tarefa) => {
                const row = document.createElement('div');
                row.className = 'task-row';
                
                const custoFormatado = typeof tarefa.custo === 'number' ? tarefa.custo.toFixed(2).replace('.', ',') : 'Valor inválido';
                const dataLimiteFormatada = new Date(tarefa.data_limite).toLocaleDateString('pt-BR'); // Formato brasileiro de data

                row.innerHTML = 
                    `<div class="task-cell">${tarefa.nome}</div>
                    <div class="task-cell">${custoFormatado}</div>
                    <div class="task-cell">${dataLimiteFormatada}</div>
                    <div class="task-cell">${tarefa.ordem}</div>
                    <div class="task-cell task-actions">
                        <button onclick="editarTarefa(${tarefa.id}, '${tarefa.nome}', ${tarefa.custo}, '${tarefa.data_limite}')">Editar</button>
                        <button onclick="excluirTarefa(${tarefa.id})">Excluir</button>
                    </div>`;
                
                table.appendChild(row);
            });
        }

        function incluirTarefa() {
            const nome = document.getElementById('nome').value;
            const custo = parseFloat(document.getElementById('custo').value.replace(',', '.'));
            const data_limite = document.getElementById('data_limite').value;

            if (!isNaN(custo) && nome && data_limite) {
                const dataLimiteFormatada = converterData(data_limite);

                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, custo, data_limite: dataLimiteFormatada })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao incluir a tarefa: ' + response.statusText);
                    }
                    return response.json(); 
                })
                .then(novaTarefa => {
                    document.getElementById('tarefaForm').reset();
                    carregarTarefas(); 
                })
                .catch(error => {
                    console.error('Erro ao incluir tarefa:', error);
                    alert('Erro ao incluir tarefa. Verifique os dados e tente novamente.');
                });
            } else {
                alert("Por favor, insira um custo válido e preencha todos os campos.");
            }
        }

        function excluirTarefa(id) {
            if (confirm("Você tem certeza que deseja excluir esta tarefa?")) {
                fetch(`${url}/${id}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) throw new Error('Erro ao excluir a tarefa: ' + response.statusText);
                    carregarTarefas(); 
                })
                .catch(error => {
                    console.error('Erro ao excluir tarefa:', error);
                    alert('Erro ao excluir tarefa. Por favor, tente novamente.');
                });
            }
        }

        function editarTarefa(id, nome, custo, data_limite) {
            tarefaAtualId = id;
            document.getElementById('edit_nome').value = nome;
            document.getElementById('edit_custo').value = custo.toString().replace('.', ',');
            document.getElementById('edit_data_limite').value = data_limite;
            document.getElementById('formularioEdicao').style.display = 'block';
        }

        function salvarEdicao() {
            const nome = document.getElementById('edit_nome').value;
            const custo = parseFloat(document.getElementById('edit_custo').value.replace(',', '.'));
            const data_limite = document.getElementById('edit_data_limite').value;

            if (!isNaN(custo) && nome && data_limite) {
                fetch(`${url}/${tarefaAtualId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome, custo, data_limite: converterData(data_limite) })
                })
                .then(response => {
                    if (!response.ok) throw new Error('Erro ao editar a tarefa: ' + response.statusText);
                    cancelarEdicao();
                    carregarTarefas(); 
                })
                .catch(error => {
                    console.error('Erro ao salvar edição:', error);
                    alert('Erro ao salvar edição. Por favor, tente novamente.');
                });
            } else {
                alert("Por favor, preencha todos os campos corretamente.");
            }
        }

        function cancelarEdicao() {
            tarefaAtualId = null;
            document.getElementById('formularioEdicao').style.display = 'none';
            document.getElementById('edit_nome').value = '';
            document.getElementById('edit_custo').value = '';
            document.getElementById('edit_data_limite').value = '';
        }

        function converterData(data) {
            const partes = data.split('/');
            return `${partes[2]}-${partes[1]}-${partes[0]}`; // Formato para YYYY-MM-DD
        }

        function formatarData(input) {
            const value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
            if (value.length >= 2) {
                input.value = value.replace(/(\d{2})(\d)/, '$1/$2'); // Adiciona /
            }
            if (value.length >= 4) {
                input.value = value.replace(/(\d{2})(\d{2})(\d)/, '$1/$2/$3'); // Adiciona /
            }
            if (value.length > 10) {
                input.value = input.value.slice(0, 10); // Limita o tamanho
            }
        }
    </script>
</body>
</html>

