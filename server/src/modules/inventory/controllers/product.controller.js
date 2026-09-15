import productService from '../services/product.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class ProductController {
  /**
   * POST /api/v1/inventory/products
   * Add a new product to the inventory.
   */
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);

      return sendSuccess(res, 201, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inventory/products
   * List all products with filtering, search, and pagination.
   */
  async getAllProducts(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const { products, total, page, limit } = await productService.getAllProducts(query);

      return sendSuccess(
        res,
        200,
        'Products retrieved successfully',
        products,
        { page, limit, total }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inventory/products/stats
   * Get aggregate statistics for the inventory.
   */
  async getProductStats(req, res, next) {
    try {
      const stats = await productService.getProductStats();

      return sendSuccess(res, 200, 'Product statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inventory/products/low-stock
   * Get products that are below their minimum alert stock.
   */
  async getLowStockProducts(req, res, next) {
    try {
      const products = await productService.getLowStockProducts();

      return sendSuccess(res, 200, 'Low stock products retrieved successfully', products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/inventory/products/:id
   * Get a single product by ID.
   */
  async getProductById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const product = await productService.getProductById(params.id);

      return sendSuccess(res, 200, 'Product retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/inventory/products/:id
   * Update an existing product.
   */
  async updateProduct(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const product = await productService.updateProduct(params.id, req.body);

      return sendSuccess(res, 200, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/inventory/products/:id
   * Delete a product from inventory.
   */
  async deleteProduct(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const product = await productService.deleteProduct(params.id);

      return sendSuccess(res, 200, 'Product deleted successfully', product);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
