import express from 'express';
import path from 'path';
import 'dotenv/config';
import { app } from './src/server/app.ts';

const PORT = process.env.PORT || 3000;

// Serve static frontend in production
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AgentOS Full-Stack server with Background Worker running on port ${PORT}`);
});
