const url = 'http://localhost:3000/tarefas';

document.addEventListener("DOMContentLoaded", () => {
    carregarTarefas();
});

function carregarTarefas() {
    fetch(url)
        .then(response => response.json())
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

                // Certifique-se de que 'custo' seja exibido como número válido
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
        .catch(error => console.error('Erro ao carregar tarefas:', error));
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
                carregarTarefas();
            } else {
                alert("Erro ao incluir a tarefa.");
            }
        })
        .catch(error => console.error('Erro ao incluir tarefa:', error));
    } else {
        alert("Por favor, insira um custo válido.");
    }
}

function excluirTarefa(id) {
    if (confirm("Confirma a exclusão?")) {
        fetch(`${url}/${id}`, { method: 'DELETE' })
            .then(() => carregarTarefas())
            .catch(error => console.error('Erro ao excluir tarefa:', error));
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
        .then(() => carregarTarefas())
        .catch(error => console.error('Erro ao editar tarefa:', error));
    } else {
        alert("Por favor, insira um custo válido.");
    }
}
