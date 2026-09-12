const Order = require('../models/Order');

// In-memory orders array fallback
const mockOrders = [];

// @desc Create new order
// @route POST /api/orders
const createOrder = async (req, res) => {
  const { orderItems, shippingAddress, totalAmount, paymentResult } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  try {
    const order = new Order({
      user: req.user ? req.user.id : null,
      orderItems,
      shippingAddress,
      totalAmount,
      isPaid: true,
      paidAt: Date.now(),
      paymentResult,
    });

    const createdOrder = await order.save();
    return res.status(201).json(createdOrder);
  } catch (error) {
    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderItems,
      shippingAddress,
      totalAmount,
      isPaid: true,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      paymentResult,
    };
    mockOrders.unshift(newOrder);
    return res.status(201).json(newOrder);
  }
};

// @desc Get user orders
// @route GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    if (orders && orders.length > 0) {
      return res.json(orders);
    }
  } catch (error) {
    // ignore
  }

  return res.json(mockOrders);
};

module.exports = { createOrder, getMyOrders };
