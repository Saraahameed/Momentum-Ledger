import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getTasksCollection } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const STATUS_VALUES = new Set(['open', 'done']);
const PRIORITY_VALUES = new Set(['low', 'medium', 'high']);
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDate(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function sanitizeTask(task) {
  return {
    id: task._id?.toString(),
    title: task.title,
    notes: task.notes || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate || null,
    project: task.project || '',
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  };
}

function buildTask(body, userId) {
  const title = normalizeString(body?.title);
  if (!title) {
    return { error: 'Task title is required.' };
  }

  const notes = normalizeString(body?.notes);
  const status = STATUS_VALUES.has(body?.status) ? body.status : 'open';
  const priority = PRIORITY_VALUES.has(body?.priority) ? body.priority : 'medium';
  const dueDate = normalizeDate(body?.dueDate);
  const project = normalizeString(body?.project);
  const now = new Date().toISOString();

  return {
    task: {
      title,
      notes,
      status,
      priority,
      dueDate,
      project,
      userId,
      createdAt: now,
      updatedAt: now
    }
  };
}

function buildUpdates(body) {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'title')) {
    const title = normalizeString(body.title);
    if (!title) {
      return { error: 'Task title is required.' };
    }
    updates.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'notes')) {
    updates.notes = normalizeString(body.notes);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'status')) {
    updates.status = STATUS_VALUES.has(body.status) ? body.status : 'open';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'priority')) {
    updates.priority = PRIORITY_VALUES.has(body.priority) ? body.priority : 'medium';
  }

  if (Object.prototype.hasOwnProperty.call(body, 'dueDate')) {
    updates.dueDate = normalizeDate(body.dueDate);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'project')) {
    updates.project = normalizeString(body.project);
  }

  updates.updatedAt = new Date().toISOString();

  return { updates };
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
  const tasksCollection = await getTasksCollection();
  const tasks = await tasksCollection
    .find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .toArray();

    return res.json({ tasks: tasks.map(sanitizeTask) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
  const { task, error } = buildTask(req.body, req.user._id);
  if (error) {
    return res.status(400).json({ error });
  }

  const tasksCollection = await getTasksCollection();
  const result = await tasksCollection.insertOne(task);
  const savedTask = { ...task, _id: result.insertedId };

    return res.status(201).json({ task: sanitizeTask(savedTask) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task id.' });
  }

  const { updates, error } = buildUpdates(req.body || {});
  if (error) {
    return res.status(400).json({ error });
  }

  const tasksCollection = await getTasksCollection();
  const result = await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id), userId: req.user._id },
    { $set: updates },
    { returnDocument: 'after' }
  );

  if (!result) {
    return res.status(404).json({ error: 'Task not found.' });
  }

    return res.json({ task: sanitizeTask(result) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid task id.' });
  }

  const tasksCollection = await getTasksCollection();
  const result = await tasksCollection.deleteOne({ _id: new ObjectId(id), userId: req.user._id });

  if (!result.deletedCount) {
    return res.status(404).json({ error: 'Task not found.' });
  }

    return res.json({ task: { id } });
  })
);

export default router;
