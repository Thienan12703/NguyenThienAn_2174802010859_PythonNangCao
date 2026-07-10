const Order = require('../models/Order');
const Product = require('../models/Product');

const addOrderItems = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm trong đơn hàng' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ message: 'Vui lòng cung cấp địa chỉ giao hàng đầy đủ' });
    }

    const normalizedPaymentMethod = paymentMethod === 'card' ? 'card' : 'COD';
    const orderItems = [];
    let computedTotal = 0;

    for (const item of items) {
      if (!item.product || !item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({ message: 'Thông tin sản phẩm trong giỏ hàng không hợp lệ' });
      }

      const quantity = Number(item.quantity);
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Sản phẩm không hợp lệ: ${item.product}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm` });
      }

      const itemPrice = Number(item.price);
      if (Number.isNaN(itemPrice) || itemPrice <= 0) {
        return res.status(400).json({ message: `Giá sản phẩm không hợp lệ cho ${product.name}` });
      }

      product.stock -= quantity;
      await product.save();

      orderItems.push({
        product: product._id,
        quantity,
        price: itemPrice,
      });
      computedTotal += itemPrice * quantity;
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      totalPrice: computedTotal,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: normalizedPaymentMethod === 'card' ? 'Paid' : 'Pending',
      paidAt: normalizedPaymentMethod === 'card' ? Date.now() : undefined,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product', 'name price image');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const allowedStatuses = ['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'];
      const nextStatus = req.body.status;

      if (nextStatus && allowedStatuses.includes(nextStatus)) {
        const shouldRestoreStock = order.status !== 'Đã hủy' && nextStatus === 'Đã hủy';
        if (shouldRestoreStock) {
          for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
              product.stock += item.quantity;
              await product.save();
            }
          }
        }
        order.status = nextStatus;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price image')
      .populate('user', 'id name email');

    if (order) {
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Không được phép' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  getOrderById,
};
