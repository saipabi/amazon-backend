const Product = require('../models/Product');
const sampleProducts = require('../data/sampleProducts');

// @desc Get all products (with optional category, subCategory & search filter)
// @route GET /api/products
const getProducts = async (req, res) => {
  const { category, subCategory, search } = req.query;

  try {
    let query = {};
    if (category && category !== 'All') {
      if (category === "Men's Wear") {
        query.category = 'Fashion';
        query.subCategory = 'Men';
      } else if (category === "Women's Wear") {
        query.category = 'Fashion';
        query.subCategory = 'Women';
      } else if (category === "Kids' Wear") {
        query.category = 'Fashion';
        query.subCategory = 'Kids';
      } else {
        query.category = category;
      }
    }
    if (subCategory && subCategory !== 'All') {
      query.subCategory = subCategory;
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
    if (category === "Men's Wear") {
      filtered = filtered.filter(p => p.category === 'Fashion' && p.subCategory === 'Men');
    } else if (category === "Women's Wear") {
      filtered = filtered.filter(p => p.category === 'Fashion' && p.subCategory === 'Women');
    } else if (category === "Kids' Wear") {
      filtered = filtered.filter(p => p.category === 'Fashion' && p.subCategory === 'Kids');
    } else {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
  }
  if (subCategory && subCategory !== 'All') {
    filtered = filtered.filter(
      p => p.subCategory && p.subCategory.toLowerCase() === subCategory.toLowerCase()
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
  const categories = ['All', 'Electronics', 'Mobiles', 'Fashion', "Men's Wear", "Women's Wear", "Kids' Wear", 'Home', 'Books'];
  return res.json(categories);
};

module.exports = { getProducts, getProductById, getCategories };
