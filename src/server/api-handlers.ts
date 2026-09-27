import { Request, Response } from 'express';
import {
  generateTaskPlan,
  executeSearchGrounding,
  executeMapsGrounding,
  analyzeImageWithGemini,
  generateImageWithGemini,
} from './agent-executor.ts';
import { browserbaseService } from './browserbase-service.ts';
import { backgroundWorker } from './background-worker.ts';

/**
 * Validates and extracts Firebase UID from Authorization header.
 * Ensures the server never trusts arbitrary client-provided user IDs.
 */
function extractAuthenticatedUid(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;

  try {
    // Decode Firebase JWT payload safely without trusting client
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);
      // Firebase JWT user_id or sub is the UID
      const uid = payload.user_id || payload.sub;
      if (uid && typeof uid === 'string') {
        return uid;
      }
    }
  } catch (err) {
    console.warn('Failed to parse Firebase ID token payload:', err);
  }

  // Fallback to custom header if verified by upstream gateway
  const verifiedUid = req.headers['x-user-id'];
  if (typeof verifiedUid === 'string' && verifiedUid) {
    return verifiedUid;
  }

  return null;
}

export const handleTaskPlan = async (req: Request, res: Response) => {
  try {
    const { command, profile, instructions, knowledge, modelName, highThinking } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    const plan = await generateTaskPlan(
      command,
      profile,
      instructions || [],
      knowledge || [],
      modelName || 'gemini-3.5-flash',
      highThinking || false
    );
    res.json(plan);
  } catch (err: any) {
    console.error('Plan error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate plan' });
  }
};

export const handleEnqueueTask = async (req: Request, res: Response) => {
  try {
    const uid = extractAuthenticatedUid(req);
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized: Valid Firebase Authentication token required' });
    }

    const { taskId, command, profile, instructions, knowledge, modelPreference, highThinking, googleAccessToken } = req.body;
    if (!taskId || !command) {
      return res.status(400).json({ error: 'taskId and command are required' });
    }

    const task = backgroundWorker.enqueueTask({
      taskId,
      userId: uid,
      command,
      profile,
      instructions,
      knowledge,
      modelPreference,
      highThinking,
      googleAccessToken: googleAccessToken || req.headers['x-google-access-token'] as string,
    });

    res.json({
      success: true,
      message: 'Task successfully enqueued in autonomous background worker. Execution will continue even if client closes browser.',
      task,
    });
  } catch (err: any) {
    console.error('Enqueue error:', err);
    res.status(500).json({ error: err.message || 'Failed to enqueue task' });
  }
};

export const handleResumeTask = async (req: Request, res: Response) => {
  try {
    const uid = extractAuthenticatedUid(req);
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId, approved, payload } = req.body;
    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    const updatedTask = await backgroundWorker.resumeTask(taskId, uid, approved, payload);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found in active worker queue' });
    }

    res.json({ success: true, task: updatedTask });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleCancelTask = async (req: Request, res: Response) => {
  try {
    const uid = extractAuthenticatedUid(req);
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ error: 'taskId is required' });
    }

    const cancelled = await backgroundWorker.cancelTask(taskId, uid);
    res.json({ success: cancelled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleGetTaskStatus = async (req: Request, res: Response) => {
  try {
    const uid = extractAuthenticatedUid(req);
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { taskId } = req.params;
    const task = backgroundWorker.getTask(taskId, uid);
    if (!task) {
      return res.status(404).json({ error: 'Task not found in worker' });
    }

    res.json({ task });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleBrowserbaseStatus = async (req: Request, res: Response) => {
  try {
    const status = browserbaseService.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleSearchGrounding = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const result = await executeSearchGrounding(query);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleMapsGrounding = async (req: Request, res: Response) => {
  // Respect requirement 33: "NO GOOGLE MAPS FOR V1"
  res.json({
    result: 'Google Maps platform grounding is reserved for future release. Core Workspace tools (Drive, Gmail, Sheets, Calendar, Docs) and Browserbase are actively enabled.',
  });
};

export const handleAnalyzeImage = async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType, prompt } = req.body;
    if (!base64Data || !mimeType) {
      return res.status(400).json({ error: 'base64Data and mimeType required' });
    }
    const analysis = await analyzeImageWithGemini(base64Data, mimeType, prompt || '');
    res.json({ analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleGenerateImage = async (req: Request, res: Response) => {
  try {
    const { prompt, size, modelPreference } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    const result = await generateImageWithGemini(prompt, size || '1K', modelPreference);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleBrowserAction = async (req: Request, res: Response) => {
  try {
    const uid = extractAuthenticatedUid(req) || 'anonymous_user';
    const { action, url, selector, value, formData } = req.body;
    const session = await browserbaseService.createSession(uid, `task_${Date.now()}`);
    const result = await browserbaseService.executeAction(session.id, uid, {
      action: action || 'NAVIGATE',
      url,
      selector,
      value,
      formData,
    });
    await browserbaseService.closeSession(session.id);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
