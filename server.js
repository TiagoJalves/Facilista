const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 10000;  // A porta será definida pelo ambiente do Render ou a local

// Middleware para permitir CORS e parsear JSON no corpo das requisições
app.use(cors());
app.use(express.json());

// Conexão com o banco de dados PostgreSQL (substitua com suas credenciais do Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Certifique-se de definir essa variável no painel do Render
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint para listar as receitas
app.get('/api/receitas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM receitas');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter receitas:', error);
    res.status(500).send('Erro ao obter receitas');
  }
});

// Endpoint para salvar uma nova receita
app.post('/api/receitas', async (req, res) => {
  const { nome, ingredientes } = req.body;

  if (!nome || !ingredientes || ingredientes.length === 0) {
    return res.status(400).send('Nome e ingredientes são obrigatórios');
  }

  try {
    const result = await pool.query(
      'INSERT INTO receitas(nome, ingredientes) VALUES($1, $2) RETURNING id',
      [nome, JSON.stringify(ingredientes)]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Erro ao salvar receita:', error);
    res.status(500).send('Erro ao salvar receita');
  }
});

// Endpoint para excluir uma receita
app.delete('/api/receitas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM receitas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Receita não encontrada');
    }
    res.status(200).send('Receita excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    res.status(500).send('Erro ao excluir receita');
  }
});

// Rota padrão para o servidor
app.get('/', (req, res) => {
  res.send('API Facilista - Receitas');
});

// Iniciando o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
