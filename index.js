const express = require('express');
const mongoose = require('mongoose');
const prompt = require('prompt-sync')();
const fs = require('fs');
const path = require('path');

const app = express();
const porta = 3000;

// Conexão com o banco de dados
mongoose.connect('mongodb+srv://Jacques:Cadeira03-@estudos.gnksfby.mongodb.net/?retryWrites=true&w=majority&appName=estudos')

// Esquema para os carros
const carroSchema = new mongoose.Schema({
  marca: String,
  modelo: String,
  ano: Number
});

// Esquema para os clientes
const clienteSchema = new mongoose.Schema({
  nome: String,
  email: String,
  telefone: String,
  carros: [carroSchema] // Subcoleção de carros
});

// Modelo para os clientes
const Cliente = mongoose.model('Cliente', clienteSchema);

// Rota para carregar a página do gráfico
app.get('/grafico', (req, res) => {
  res.sendFile(path.join(__dirname, 'grafico/grafico.html'));
});

app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});

//Usuário escolhe a operação que deseja
var operacao = parseInt(prompt("Qual operação você deseja realizar? 1(Consulta), 2(Inclusão), 3(Alteração), 4(Exclusão), 5 (Gerar arquivo Json), 6 (Exibir gráfico dos dados)"));
switch (operacao) {
  case 1:
    var r = prompt("Consulta geral (1), consulta específica(2)?");
    if (r == 1) 
    {
      Cliente.find()
      .then((clientes) => {
        console.log("Clientes Cadastrados:");
        console.log("-----------------------")
        clientes.forEach((cliente) => {
          console.log("ID:", cliente.id);
          console.log("Nome:", cliente.nome);
          console.log("Email:", cliente.email);
          console.log("Telefone:", cliente.telefone);
          console.log("Carros:");
          cliente.carros.forEach((carro) => {
            console.log("- Marca:", carro.marca);
            console.log("- Modelo:", carro.modelo);
            console.log("- Ano:", carro.ano);
            console.log("- ID do carro:", carro.id);
            console.log("======================");
          });
          console.log("-----------------------");
        });
      })
      .catch((error) => {
        console.error("Erro ao consultar clientes:", error);
      });
      
    } else if (r == 2) 
    {
      cliId = prompt("Digite o ID do cliente: ");
      Cliente.findById(cliId)
      .then((cliente) => {
        console.log("-----------------------")
          console.log("ID:", cliente.id);
          console.log("Nome:", cliente.nome);
          console.log("Email:", cliente.email);
          console.log("Telefone:", cliente.telefone);
          console.log("Carros:");
          cliente.carros.forEach((carro) => {
            console.log("- Marca:", carro.marca);
            console.log("- Modelo:", carro.modelo);
            console.log("- Ano:", carro.ano);
          })
        })
    } else 
    {
      console.log("Opção inválida");
    }
    break;
    
  case 2:
    try {
      const data = fs.readFileSync('dados.json', 'utf8');
      const { cliente, carro } = JSON.parse(data);

      const novoCliente = new Cliente({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        carros: [{
          marca: carro.marca,
          modelo: carro.modelo,
          ano: carro.ano
        }]
      });

      novoCliente.save()
        .then(() => {
          console.log("Cliente adicionado com sucesso!");
        })
        .catch((error) => {
          console.error("Erro ao adicionar cliente:", error);
        });
    } catch (error) {
      console.error("Erro ao ler arquivo JSON:", error);
    }
    break;

  case 3:
    const idClienteAlterar = prompt("Digite o ID do cliente que deseja alterar: ");
    const idCarroAlterar = prompt("Digite o ID do carro que deseja alterar: ");

    const nomeNovo = prompt("Digite o novo nome do cliente (ou pressione Enter para manter o mesmo): ");
    const emailNovo = prompt("Digite o novo email do cliente (ou pressione Enter para manter o mesmo): ");
    const telefoneNovo = prompt("Digite o novo telefone do cliente (ou pressione Enter para manter o mesmo): ");

    const marcaCarroNovo = prompt("Digite a nova marca do carro do cliente (ou pressione Enter para manter o mesmo): ");
    const modeloCarroNovo = prompt("Digite o novo modelo do carro do cliente (ou pressione Enter para manter o mesmo): ");
    const anoCarroNovo = prompt("Digite o novo ano do carro do cliente (ou pressione Enter para manter o mesmo): ");

    const updateData = {};
    if (nomeNovo !== "") {
      updateData.nome = nomeNovo;
    }
    if (emailNovo !== "") {
      updateData.email = emailNovo;
    }
    if (telefoneNovo !== "") {
      updateData.telefone = telefoneNovo;
    }

    if (marcaCarroNovo !== "") {
      updateData['carros.$.marca'] = marcaCarroNovo;
    }
    if (modeloCarroNovo !== ""){
      updateData['carros.$.modelo'] = modeloCarroNovo;
    }
    if (anoCarroNovo !== ""){
      updateData['carros.$.ano'] = anoCarroNovo;
    }

    Cliente.updateOne({ _id: idClienteAlterar, 'carros._id': idCarroAlterar }, updateData)
      .then(() => {
        console.log("Cliente e carro alterados com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao alterar cliente e carro:", error);
      });
    break;

  case 4:
    const clienteExcluir = prompt("Digite o ID do cliente que deseja excluir: ");

    Cliente.deleteOne({ _id: clienteExcluir })
      .then(() => {
        console.log("Cliente excluído com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao excluir cliente:", error);
      });
    break;

  case 5:
    // Rota para carregar a página HTML
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });
    //Caso não carregue a página automaticamente, pesquisar na barra do WebView "/".
    break;

  case 6: 
     // Rota para obter os dados do gráfico
    app.get('/dadosParaGrafico', (req, res) => {
      Cliente.find()
        .then((clientes) => {
          const data = clientes.map((cliente) => ({
            nome: cliente.nome,
            numCarros: cliente.carros.length,
          }));
          res.json(data);
        })
        .catch((error) => {
          console.error("Erro ao obter dados para o gráfico:", error);
          res.status(500).json({ error: "Erro ao obter dados para o gráfico" });
        });
    });
    //Caso não carregue a página automaticamente, pesquisar na barra do WebView "/grafico".
    break;

  default:
    console.log("Operação inválida");
    break;
}
