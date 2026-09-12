const Product = require('../models/Product');
const sampleProducts = require('../data/sampleProducts');

// @desc Get all products (with strict category, subCategory, isDress & search filter)
// @route GET /api/products
const getProducts = async (req, res) => {
  const { category, subCategory, isDress, search } = req.query;

  try {
    let query = {};

    if (category && category !== 'All') {
      if (category === "Men's Wear") {
        query.subCategory = 'Men';
        query.isDress = true;
      } else if (category === "Women's Wear") {
        query.subCategory = 'Women';
        query.isDress = true;
      } else if (category === "Kids' Wear") {
        query.subCategory = 'Kids';
        query.isDress = true;
      } else {
        query.category = category;
      }
    }

    if (subCategory && subCategory !== 'All') {
      query.subCategory = subCategory;
    }

    if (isDress !== undefined) {
      query.isDress = isDress === 'true';
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

  // Fallback to sample array filtering
  let filtered = [...sampleProducts];

  if (category && category !== 'All') {
    if (category === "Men's Wear") {
      filtered = filtered.filter(p => p.subCategory === 'Men' && p.isDress === true);
    } else if (category === "Women's Wear") {
      filtered = filtered.filter(p => p.subCategory === 'Women' && p.isDress === true);
    } else if (category === "Kids' Wear") {
      filtered = filtered.filter(p => p.subCategory === 'Kids' && p.isDress === true);
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

  if (isDress !== undefined) {
    const wantDress = isDress === 'true';
    filtered = filtered.filter(p => p.isDress === wantDress);
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
  const categories = ['All', 'Fashion', "Men's Wear", "Women's Wear", "Kids' Wear", 'Electronics', 'Mobiles', 'Home', 'Books'];
  return res.json(categories);
};

module.exports = { getProducts, getProductById, getCategories };
