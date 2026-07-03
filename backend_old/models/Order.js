const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['COD', 'card'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paidAt: { type: Date },
  status: { type: String, enum: ['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'], default: 'Chờ xử lý' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
