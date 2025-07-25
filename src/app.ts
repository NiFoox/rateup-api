import express from 'express';

const app = express();
const PORT = 3000;

app.get('/api/status', (req, res) => {
  res.json({ status: 'Prueba funcionando' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});