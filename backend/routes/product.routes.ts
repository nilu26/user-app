import { Router } from "express";
import * as ProductController from "../controllers/product.controller.js";
import multer from "multer";

const router = Router();

// GET /api/products/report
router.get("/report", ProductController.generateReport);

// LIST PRODUCTS and CREATE PRODUCT
router
  .route("/")
  .get(ProductController.listProducts) // GET /api/products (handles all query params)
  .post(ProductController.create); // POST /api/products

// GET, UPDATE, or DELETE a specific product by ID
router
  .route("/:id")
  .get(ProductController.getById) // GET /api/products/:id
  .put(ProductController.update) // PUT /api/products/:id
  .delete(ProductController.remove); // DELETE /api/products/:id

// Configure Multer storage to temporarily store files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure this directory exists in your backend root!
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Bulk Upload Route
router.post(
  "/bulk-upload",
  upload.single("file"), // 'file' is the key/field name in the form data
  ProductController.bulkUpload
);

export default router;
