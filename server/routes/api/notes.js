const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const notes = [];
let nextId = 1;

/**
 * @route    POST /notes
 * @desc     Create a new note
 * @access   Public
 */
router.post(
  '/',
  [
    check('title').optional().isString().withMessage('Title must be a string'),
    check('content').optional().isString().withMessage('Content must be a string'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title = '', content = '' } = req.body || {};
      if (!title && !content) {
        return res.status(400).json({ errors: [{ msg: 'title or content required' }] });
      }

      const now = new Date().toISOString();
      const note = { id: nextId++, title, content, createdAt: now, updatedAt: now };
      notes.push(note);
      console.log('[NOTES] Created:', note);
      return res.status(201).json(note);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

/**
 * @route    GET /notes
 * @desc     Retrieve all notes
 * @access   Public
 */
router.get('/', (_req, res) => {
  try {
    return res.json(notes);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

/**
 * @route    GET /notes/:id
 * @desc     Retrieve a specific note by ID
 * @access   Public
 */
router.get('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid id' }] });
    }
    const note = notes.find(n => n.id === id);
    if (!note) return res.status(404).json({ errors: [{ msg: 'not found' }] });
    return res.json(note);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

/**
 * @route    PUT /notes/:id
 * @desc     Update a note
 * @access   Public
 */
router.put(
  '/:id',
  [
    check('title').optional().isString().withMessage('Title must be a string'),
    check('content').optional().isString().withMessage('Content must be a string'),
  ],
(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ errors: [{ msg: 'Invalid id' }] });

    const note = notes.find(n => n.id === id);
    if (!note) return res.status(404).json({ errors: [{ msg: 'not found' }] });

    const { title, content } = req.body || {};
    if (title === undefined && content === undefined) {
      return res.status(400).json({ errors: [{ msg: 'Provide title or content to update' }] });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    note.updatedAt = new Date().toISOString();

    console.log('[NOTES] Updated:', note);
    return res.json(note);
  }
);

/**
 * @route    DELETE /notes/:id
 * @desc     Delete a note
 * @access   Public
 */
router.delete('/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ errors: [{ msg: 'Invalid id' }] });
    }

    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return res.status(404).json({ errors: [{ msg: 'not found' }] });

    const [deleted] = notes.splice(idx, 1);
    console.log('[NOTES] Deleted:', deleted);
    return res.status(204).send();
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;