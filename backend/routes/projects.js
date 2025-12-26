import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getProjectsCollection } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeProject(project) {
  return {
    id: project._id?.toString(),
    name: project.name,
    description: project.description || '',
    color: project.color || '#1f7f7b',
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const projectsCollection = await getProjectsCollection();
    const projects = await projectsCollection
      .find({ userId: req.user._id })
      .sort({ name: 1 })
      .toArray();

    return res.json({ projects: projects.map(sanitizeProject) });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = normalizeString(req.body?.name);
    if (!name) {
      return res.status(400).json({ error: 'Project name is required.' });
    }

    const description = normalizeString(req.body?.description);
    const color = normalizeString(req.body?.color) || '#1f7f7b';
    const now = new Date().toISOString();

    const project = {
      name,
      description,
      color,
      userId: req.user._id,
      createdAt: now,
      updatedAt: now
    };

    const projectsCollection = await getProjectsCollection();

    let savedProject;
    try {
      const result = await projectsCollection.insertOne(project);
      savedProject = { ...project, _id: result.insertedId };
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: 'A project with that name already exists.' });
      }
      throw error;
    }

    return res.status(201).json({ project: sanitizeProject(savedProject) });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project id.' });
    }

    const updates = { updatedAt: new Date().toISOString() };

    if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
      const name = normalizeString(req.body.name);
      if (!name) {
        return res.status(400).json({ error: 'Project name is required.' });
      }
      updates.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      updates.description = normalizeString(req.body.description);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'color')) {
      updates.color = normalizeString(req.body.color) || '#1f7f7b';
    }

    const projectsCollection = await getProjectsCollection();

    let result;
    try {
      result = await projectsCollection.findOneAndUpdate(
        { _id: new ObjectId(id), userId: req.user._id },
        { $set: updates },
        { returnDocument: 'after' }
      );
    } catch (error) {
      if (error?.code === 11000) {
        return res.status(409).json({ error: 'A project with that name already exists.' });
      }
      throw error;
    }

    if (!result) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ project: sanitizeProject(result) });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid project id.' });
    }

    const projectsCollection = await getProjectsCollection();
    const result = await projectsCollection.deleteOne({
      _id: new ObjectId(id),
      userId: req.user._id
    });

    if (!result.deletedCount) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    return res.json({ project: { id } });
  })
);

export default router;
