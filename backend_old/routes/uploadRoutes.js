const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

const imageFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ hỗ trợ định dạng ảnh JPEG, PNG hoặc WEBP'));
    }
};

const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/', protect, admin, upload.array('images', 10), (req, res) => {
    try {
        const files = req.files || [];
        const paths = files.map((f) => `/uploads/${f.filename}`);
        res.json({ paths });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// delete uploaded file (admin only). body or query: path = '/uploads/filename.jpg'
router.delete('/', protect, admin, (req, res) => {
    try {
        const target = req.body.path || req.query.path;
        if (!target) return res.status(400).json({ message: 'Missing path' });
        // only allow deleting local uploads
        if (!target.startsWith('/uploads/')) return res.status(400).json({ message: 'Invalid path' });
        const full = path.join(__dirname, '..', target);
        if (fs.existsSync(full)) {
            fs.unlinkSync(full);
            return res.json({ message: 'Deleted' });
        }
        return res.status(404).json({ message: 'File not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
