const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      default: 'Amazon Choice',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    numReviews: {
      type: Number,
      default: 120,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 50,
    },
    isPrime: {
      type: Boolean,
      default: true,
    },
    features: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
