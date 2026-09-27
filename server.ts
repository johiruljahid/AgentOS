import express from 'express';
import path from 'path';
import 'dotenv/config';
import {
  handleTaskPlan,
  handleEnqueueTask,
  handleResumeTask,
  handleCancelTask,
  handleGetTaskStatus,
  handleBrowserbaseStatus,
  handleSearchGrounding,
  handleMapsGrounding,
  handleAnalyzeImage,
  handleGenerateImage,
  handleBrowserAction,
} from './src/server/api-handlers';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AgentOS Autonomous Engine',
    worker: 'Active Background Daemon',
    timestamp: new Date().toISOString(),
  });
});

// Autonomous background agent routes
app.post('/api/agent/plan', handleTaskPlan);
app.post('/api/tasks/enqueue', handleEnqueueTask);
app.post('/api/tasks/resume', handleResumeTask);
app.post('/api/tasks/cancel', handleCancelTask);
app.get('/api/tasks/status/:taskId', handleGetTaskStatus);
app.get('/api/browserbase/status', handleBrowserbaseStatus);

// Grounding, Multimodal, and Browserbase routes
app.post('/api/agent/grounding/search', handleSearchGrounding);
app.post('/api/agent/grounding/maps', handleMapsGrounding);
app.post('/api/agent/analyze-image', handleAnalyzeImage);
app.post('/api/agent/generate-image', handleGenerateImage);
app.post('/api/agent/browser-action', handleBrowserAction);

// Serve static frontend in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AgentOS Full-Stack server with Background Worker running on port ${PORT}`);
});
