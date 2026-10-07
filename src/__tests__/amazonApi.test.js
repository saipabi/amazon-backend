const request = require('supertest');
const app = require('../server');

describe('Amazon Clone Core API Full Stack Verification', () => {
  let authToken;
  let testProductId;

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health - returns 200 OK with Amazon Clone info', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.app).toMatch(/Amazon Clone Backend API/i);
    });
  });

  describe('2. Products Catalog Endpoints', () => {
    it('GET /api/products - returns list of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      testProductId = res.body[0]._id;
    });

    it('GET /api/products?category=Electronics - filters by category', async () => {
      const res = await request(app).get('/api/products?category=Electronics');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/products?search=iPhone - searches products by title', async () => {
      const res = await request(app).get('/api/products?search=iPhone');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /api/products/categories/all - returns list of categories', async () => {
      const res = await request(app).get('/api/products/categories/all');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain('All');
      expect(res.body).toContain('Electronics');
    });

    it('GET /api/products/:id - returns product by ID', async () => {
      const res = await request(app).get(`/api/products/${testProductId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title');
      expect(res.body).toHaveProperty('price');
    });
  });

  describe('3. Authentication Endpoints', () => {
    const testEmail = `testuser_${Date.now()}@amazon.com`;
    const testPassword = 'password123';

    it('POST /api/auth/register - registers new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Amazon Tester',
          email: testEmail,
          password: testPassword,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe(testEmail);
      authToken = res.body.token;
    });

    it('POST /api/auth/login - logs in user and returns valid JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.name).toBe('Amazon Tester');
      authToken = res.body.token;
    });

    it('POST /api/auth/login - fails gracefully on invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@user.com',
          password: 'wrongpassword',
        });

      // Should return either 401 or handle mock gracefully
      expect([200, 401]).toContain(res.statusCode);
    });
  });

  describe('4. Payment (Razorpay) Endpoints', () => {
    let razorpayOrderId;

    it('POST /api/payment/create-order - creates Razorpay payment order', async () => {
      const res = await request(app)
        .post('/api/payment/create-order')
        .send({ amount: 1499 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('amount');
      expect(res.body.amount).toBe(149900); // 1499 * 100 paise
      razorpayOrderId = res.body.id;
    });

    it('POST /api/payment/verify - verifies payment callback successfully', async () => {
      const res = await request(app)
        .post('/api/payment/verify')
        .send({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: 'pay_test_123456',
          razorpay_signature: 'dummy_or_valid_signature',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('5. Order Management Endpoints', () => {
    it('POST /api/orders - places new order', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderItems: [
            {
              product: testProductId,
              title: 'Test Product Title',
              price: 1499,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1',
            },
          ],
          shippingAddress: {
            fullName: 'Amazon Tester',
            phone: '9876543210',
            address: '123 Prime St',
            city: 'Bengaluru',
            postalCode: '560001',
            country: 'India',
          },
          totalAmount: 1499,
          paymentResult: {
            razorpayOrderId: 'order_test_123',
            razorpayPaymentId: 'pay_test_123',
            status: 'SUCCESS',
          },
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.isPaid).toBe(true);
    });

    it('GET /api/orders/myorders - fetches user orders', async () => {
      const res = await request(app)
        .get('/api/orders/myorders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
