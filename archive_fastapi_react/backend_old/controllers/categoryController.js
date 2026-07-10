const Category = require('../models/Category');
const { isNonEmptyString, sanitizeString } = require('../utils/validators');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const slug = sanitizeString(req.body.slug).toLowerCase();
    const description = sanitizeString(req.body.description);

    if (!isNonEmptyString(name) || !isNonEmptyString(slug)) {
      return res.status(400).json({ message: 'Tên và slug danh mục là bắt buộc' });
    }

    const categoryExists = await Category.findOne({ slug });

    if (categoryExists) {
      return res.status(400).json({ message: 'Danh mục đã tồn tại' });
    }

    const category = await Category.create({ name, slug, description });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const slug = sanitizeString(req.body.slug).toLowerCase();
    const description = sanitizeString(req.body.description);
    const category = await Category.findById(req.params.id);

    if (category) {
      if (isNonEmptyString(name)) category.name = name;
      if (isNonEmptyString(slug)) category.slug = slug;
      if (description !== undefined) category.description = description;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Đã xóa danh mục' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
