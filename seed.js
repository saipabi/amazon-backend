const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/Product');
const sampleProducts = require('./src/data/sampleProducts');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    await Product.deleteMany({});
    console.log('Previous product catalog cleared.');

    const cleanProducts = sampleProducts.map(({ _id, ...rest }) => rest);
    await Product.insertMany(cleanProducts);

    console.log('✅ Successfully seeded Amazon Product Catalog into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
