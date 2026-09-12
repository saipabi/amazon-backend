const Product = require('../models/Product');
const sampleProducts = require('../data/sampleProducts');

// @desc Get all products (with optional category & search filter)
// @route GET /api/products
const getProducts = async (req, res) => {
  const { category, search } = req.query;

  try {
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query);
    if (products && products.length > 0) {
      return res.json(products);
    }
  } catch (error) {
    console.warn('Using sample product data fallback');
  }

  // Fallback to sample array filtering if MongoDB query fails or is empty
  let filtered = [...sampleProducts];
  if (category && category !== 'All') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
  }

  return res.json(filtered);
};

// @desc Get product by ID
// @route GET /api/products/:id
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (product) {
      return res.json(product);
    }
  } catch (error) {
    // ignore
  }

  const sample = sampleProducts.find((p) => p._id === id || p._id === `prod_${id}`);
  if (sample) {
    return res.json(sample);
  }

  return res.status(404).json({ message: 'Product not found' });
};

// @desc Get product categories
// @route GET /api/products/categories/all
const getCategories = (req, res) => {
  const categories = ['All', 'Electronics', 'Mobiles', 'Fashion', 'Home', 'Books'];
  return res.json(categories);
};

module.exports = { getProducts, getProductById, getCategories };
