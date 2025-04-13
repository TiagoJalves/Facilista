// Importando bibliotecas necessárias
const express = require('express');
const { Client } = require('pg');
const cors = require('cors'); // Para permitir requisições de diferentes origens (necessário para o frontend)

// Criando uma instância do Express
const app = express();
app.use(express.json()); // Para analisar requisições com JSON
app.use(cors()); // Para permitir requisições de diferentes origens (se você for desenvolver em um servidor diferente)

// Configuração do PostgreSQL
const client = new Client({
  connectionString: process.env.postgresql://facilista_user:j7K3tgncSdWXsW1byyzw702NQ0FqSwuB@dpg-cvtjsp3e5dus73aaa97g-a/facilista, // Usando a variável de ambiente DATABASE_URL do Render
  ssl: {
    rejectUnauthorized: false // Necessário para conexões seguras no Render
  }
});

// Conectando ao banco de dados
client.connect()
  .then(() => console.log('Conectado ao banco de dados PostgreSQL'))
  .catch(err => console.error('Erro ao conectar ao banco de dados', err));

// Rota para Criar Receita (POST)
app.post('/api/receitas', (req, res) => {
  const { nome, descricao, ingredientes } = req.body;
  const query = 'INSERT INTO receitas (nome, descricao, ingredientes) VALUES ($1, $2, $3) RETURNING *';
  const values = [nome, descricao, JSON.stringify(ingredientes)];

  client.query(query, values)
    .then(result => {
      res.status(201).json({
        message: 'Receita salva com sucesso!',
        receita: result.rows[0]
      });
    })
    .catch(err => {
      console.error('Erro ao salvar a receita', err);
      res.status(500).json({ message: 'Erro ao salvar a receita. Tente novamente.' });
    });
});

// Rota para Listar todas as Receitas (GET)
app.get('/api/receitas', (req, res) => {
  const query = 'SELECT * FROM receitas';

  client.query(query)
    .then(result => {
      res.status(200).json(result.rows);
    })
    .catch(err => {
      console.error('Erro ao buscar receitas', err);
      res.status(500).json({ message: 'Erro ao buscar receitas. Tente novamente.' });
    });
});

// Rota para Buscar uma Receita por ID (GET)
app.get('/api/receitas/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM receitas WHERE id = $1';
  const values = [id];

  client.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Receita não encontrada.' });
      }
      res.status(200).json(result.rows[0]);
    })
    .catch(err => {
      console.error('Erro ao buscar receita', err);
      res.status(500).json({ message: 'Erro ao buscar receita. Tente novamente.' });
    });
});

// Rota para Atualizar uma Receita (PUT)
app.put('/api/receitas/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao, ingredientes } = req.body;
  const query = 'UPDATE receitas SET nome = $1, descricao = $2, ingredientes = $3 WHERE id = $4 RETURNING *';
  const values = [nome, descricao, JSON.stringify(ingredientes), id];

  client.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Receita não encontrada.' });
      }
      res.status(200).json({
        message: 'Receita atualizada com sucesso!',
        receita: result.rows[0]
      });
    })
    .catch(err => {
      console.error('Erro ao atualizar receita', err);
      res.status(500).json({ message: 'Erro ao atualizar receita. Tente novamente.' });
    });
});

// Rota para Excluir uma Receita (DELETE)
app.delete('/api/receitas/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM receitas WHERE id = $1 RETURNING *';
  const values = [id];

  client.query(query, values)
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Receita não encontrada.' });
      }
      res.status(200).json({ message: 'Receita excluída com sucesso!' });
    })
    .catch(err => {
      console.error('Erro ao excluir receita', err);
      res.status(500).json({ message: 'Erro ao excluir receita. Tente novamente.' });
    });
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
