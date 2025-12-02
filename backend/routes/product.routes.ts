import { Router } from 'express';
import * as ProductController from '../controllers/product.controller.js';

const router = Router();

// LIST PRODUCTS and CREATE PRODUCT
router.route('/')
    .get(ProductController.listProducts) // GET /api/products (handles all query params)
    .post(ProductController.create);     // POST /api/products

// GET, UPDATE, or DELETE a specific product by ID
router.route('/:id')
    .get(ProductController.getById)     // GET /api/products/:id
    .put(ProductController.update)     // PUT /api/products/:id
    .delete(ProductController.remove);  // DELETE /api/products/:id

export default router;