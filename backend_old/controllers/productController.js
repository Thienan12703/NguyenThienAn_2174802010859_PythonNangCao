const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');
const { isNonEmptyString, isPositiveNumber, isNonNegativeNumber, sanitizeString } = require('../utils/validators');

const removeLocalFile = (filePath) => {
  if (!filePath || !filePath.startsWith('/uploads/')) return;
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};

    const products = await Product.find({ ...keyword, ...category }).populate('category', 'name slug');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const price = Number(req.body.price);
    const image = sanitizeString(req.body.image);
    const images = Array.isArray(req.body.images) ? req.body.images.map(sanitizeString).filter(isNonEmptyString) : [];
    const brand = sanitizeString(req.body.brand);
    const category = sanitizeString(req.body.category);
    const description = sanitizeString(req.body.description);
    const stock = Number(req.body.stock ?? 0);
    const isFeatured = Boolean(req.body.isFeatured);

    if (!isNonEmptyString(name) || !isPositiveNumber(price) || !isNonEmptyString(brand) || !isNonEmptyString(category) || !isNonEmptyString(description)) {
      return res.status(400).json({ message: 'Thiếu thông tin sản phẩm bắt buộc hoặc giá sản phẩm không hợp lệ' });
    }
    if (!isNonNegativeNumber(stock)) {
      return res.status(400).json({ message: 'Số lượng tồn kho không hợp lệ' });
    }

    const product = new Product({
      name,
      price,
      image: image || (images.length ? images[0] : ''),
      images,
      brand,
      category,
      description,
      stock,
      isFeatured,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const price = req.body.price !== undefined ? Number(req.body.price) : undefined;
    const description = sanitizeString(req.body.description);
    const image = sanitizeString(req.body.image);
    const images = req.body.images !== undefined ? (Array.isArray(req.body.images) ? req.body.images.map(sanitizeString).filter(isNonEmptyString) : undefined) : undefined;
    const brand = sanitizeString(req.body.brand);
    const category = sanitizeString(req.body.category);
    const stock = req.body.stock !== undefined ? Number(req.body.stock) : undefined;
    const isFeatured = req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : undefined;

    const product = await Product.findById(req.params.id);

    if (product) {
      const previousImages = product.images || [];
      const previousImage = product.image;

      if (isNonEmptyString(name)) product.name = name;
      if (price !== undefined) {
        if (!isPositiveNumber(price)) {
          return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ' });
        }
        product.price = price;
      }
      if (description) product.description = description;
      if (images !== undefined) product.images = images;
      if (image !== undefined) {
        product.image = image || (product.images && product.images.length ? product.images[0] : product.image);
      } else {
        product.image = product.images && product.images.length ? product.images[0] : product.image;
      }
      if (brand) product.brand = brand;
      if (category) product.category = category;
      if (stock !== undefined) {
        if (!isNonNegativeNumber(stock)) {
          return res.status(400).json({ message: 'Số lượng tồn kho không hợp lệ' });
        }
        product.stock = stock;
      }
      if (isFeatured !== undefined) product.isFeatured = isFeatured;

      const updatedProduct = await product.save();

      const removedImages = previousImages.filter((img) => !updatedProduct.images.includes(img));
      removedImages.forEach(removeLocalFile);
      if (previousImage && !updatedProduct.images.includes(previousImage) && previousImage !== updatedProduct.image) {
        removeLocalFile(previousImage);
      }

      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const imagesToRemove = [...new Set([product.image, ...(product.images || [])].filter(Boolean))];
      imagesToRemove.forEach(removeLocalFile);
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Đã xóa sản phẩm' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProductReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const comment = sanitizeString(req.body.comment);

    if (!isPositiveNumber(rating) || rating < 1 || rating > 5 || !isNonEmptyString(comment)) {
      return res.status(400).json({ message: 'Vui lòng đánh giá từ 1 đến 5 sao và nhập bình luận' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: Date.now(),
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Cảm ơn đánh giá của bạn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
};
