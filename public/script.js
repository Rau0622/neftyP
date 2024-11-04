const url = 'http://localhost:3000/tarefas';

document.addEventListener("DOMContentLoaded", () => {
    carregarTarefas();
});

function carregarTarefas() {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar tarefas');
            }
            return response.json();
        })
        .then(data => {
            const table = document.getElementById('tarefasTable');
            table.innerHTML = `
                <tr>
                    <th>Nome da Tarefa</th>
                    <th>Custo (R$)</th>
                    <th>Data Limite</th>
                    <th>Ações</th>
                </tr>
            `;
            data.forEach(tarefa => {
                const row = table.insertRow();
                row.className = tarefa.custo >= 1000 ? 'highlight' : '';

                const custoFormatado = typeof tarefa.custo === 'number' && !isNaN(tarefa.custo)
                    ? tarefa.custo.toFixed(2).replace('.', ',')
                    : 'Valor inválido';

                row.innerHTML = `
                    <td>${tarefa.nome}</td>
                    <td>${custoFormatado}</td>
                    <td>${new Date(tarefa.data_limite).toLocaleDateString()}</td>
                    <td>
                        <button onclick="editarTarefa(${tarefa.id})">Editar</button>
                        <button onclick="excluirTarefa(${tarefa.id})">Excluir</button>
                    </td>
                `;
            });
        })
        .catch(error => {
            console.error('Erro ao carregar tarefas:', error);
            alert('Não foi possível carregar as tarefas. Verifique a conexão com o servidor.');
        });
}

function incluirTarefa() {
    const nome = prompt("Nome da Tarefa:");
    const custoStr = prompt("Custo (R$):");
    const custo = parseFloat(custoStr.replace(',', '.'));
    const data_limite = prompt("Data Limite (AAAA-MM-DD):");

    if (!isNaN(custo)) {
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, custo, data_limite })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Erro ao incluir a tarefa.');
            }
        })
        .then(() => {
            alert('Tarefa incluída com sucesso!');
            carregarTarefas();
        })
        .catch(error => {
            console.error('Erro ao incluir tarefa:', error);
            alert("Erro ao incluir a tarefa. Verifique os dados e tente novamente.");
        });
    } else {
        alert("Por favor, insira um custo válido.");
    }
}

function excluirTarefa(id) {
    if (confirm("Confirma a exclusão?")) {
        fetch(`${url}/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert('Tarefa excluída com sucesso!');
                    carregarTarefas();
                } else {
                    throw new Error('Erro ao excluir tarefa');
                }
            })
            .catch(error => {
                console.error('Erro ao excluir tarefa:', error);
                alert('Erro ao excluir a tarefa. Tente novamente.');
            });
    }
}

function editarTarefa(id) {
    const nome = prompt("Novo Nome da Tarefa:");
    const custoStr = prompt("Novo Custo (R$):");
    const custo = parseFloat(custoStr.replace(',', '.'));
    const data_limite = prompt("Nova Data Limite (AAAA-MM-DD):");

    if (!isNaN(custo)) {
        fetch(`${url}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, custo, data_limite })
        })
        .then(response => {
            if (response.ok) {
                alert('Tarefa editada com sucesso!');
                carregarTarefas();
            } else {
                throw new Error('Erro ao editar tarefa');
            }
        })
        .catch(error => {
            console.error('Erro ao editar tarefa:', error);
            alert("Erro ao editar a tarefa. Verifique os dados e tente novamente.");
        });
    } else {
        alert("Por favor, insira um custo válido.");
    }
}
