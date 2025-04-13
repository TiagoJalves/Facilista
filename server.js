const express = require('express');
const { Client } = require('pg');
const cors = require('cors'); // Para permitir requisições de diferentes origens (necessário para o frontend)

// Criando uma instância do Express
const app = express();
app.use(express.json()); // Para analisar requisições com JSON
app.use(cors()); // Para permitir requisições de diferentes origens

// Conectar-se ao banco de dados PostgreSQL usando a variável de ambiente DATABASE_URL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessário para algumas conexões seguras (ex: Render)
  },
});

// Tentar conectar ao banco de dados
client.connect()
  .then(() => console.log('Conectado ao banco de dados PostgreSQL'))
  .catch((err) => {
    console.error('Erro ao conectar ao banco de dados', err);
    process.exit(1); // Sai do processo em caso de erro de conexão
  });

// Rota para criar uma nova receita (POST)
app.post('/api/receitas', (req, res) => {
  const { nome, descricao, ingredientes } = req.body;
  const query = 'INSERT INTO receitas (nome, descricao, ingredientes) VALUES ($1, $2, $3) RETURNING *';
  const values = [nome, descricao, JSON.stringify(ingredientes)];

  client.query(query, values)
    .then((result) => {
      res.status(201).json({
        message: 'Receita salva com sucesso!',
        receita: result.rows[0],
      });
    })
    .catch((err) => {
      console.error('Erro ao salvar a receita', err);
      res.status(500).json({ message: 'Erro ao salvar a receita. Tente novamente.' });
    });
});

// Rota para listar todas as receitas (GET)
app.get('/api/receitas', (req, res) => {
  const query = 'SELECT * FROM receitas';

  client.query(query)
    .then((result) => {
      res.status(200).json(result.rows);
    })
    .catch((err) => {
      console.error('Erro ao buscar receitas', err);
      res.status(500).json({ message: 'Erro ao buscar receitas. Tente novamente.' });
    });
});

// Rota para buscar uma receita por ID (GET)
app.get('/api/receitas/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM receitas WHERE id = $1';
  const values = [id];

  client.query(query, values)
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Receita não encontrada.' });
      }
      res.status(200).json(result.rows[0]);
    })
    .catch((err) => {
      console.error('Erro ao buscar receita', err);
      res.status(500).json({ message: 'Erro ao buscar receita. Tente novamente.' });
    });
});

// Rota para excluir uma receita (DELETE)
app.delete('/api/receitas/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM receitas WHERE id = $1 RETURNING *';
  const values = [id];

  client.query(query, values)
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Receita não encontrada.' });
      }
      res.status(200).json({ message: 'Receita excluída com sucesso!' });
    })
    .catch((err) => {
      console.error('Erro ao excluir receita', err);
      res.status(500).json({ message: 'Erro ao excluir receita. Tente novamente.' });
    });
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
