const express = require('express');
const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all posts (public)
// @route   GET /api/posts
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate('author', 'name email').sort({ createdAt: -1 });
  res.json(posts);
}));

// @desc    Get single post by slug (public)
// @route   GET /api/posts/:slug
// @access  Public
router.get('/:slug', asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name email');
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  res.json(post);
}));

// @desc    Create new post
// @route   POST /api/posts
// @access  Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { title, slug, content, thumbnail } = req.body;
  const post = new Post({
    title,
    slug,
    content,
    thumbnail,
    author: req.user._id,
  });
  const createdPost = await post.save();
  res.status(201).json(createdPost);
}));

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const { title, slug, content, thumbnail } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  post.title = title ?? post.title;
  post.slug = slug ?? post.slug;
  post.content = content ?? post.content;
  post.thumbnail = thumbnail ?? post.thumbnail;
  const updatedPost = await post.save();
  res.json(updatedPost);
}));

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  await post.remove();
  res.json({ message: 'Post removed' });
}));

module.exports = router;
