import productService from '../services/product.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class ProductController {
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);

      return sendSuccess(res, 201, 'Product created successfully', product);
    } catch (error) {
      next(error);
    }
  }

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

  async getProductStats(req, res, next) {
    try {
      const stats = await productService.getProductStats();

      return sendSuccess(res, 200, 'Product statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  async getLowStockProducts(req, res, next) {
    try {
      const products = await productService.getLowStockProducts();

      return sendSuccess(res, 200, 'Low stock products retrieved successfully', products);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const product = await productService.getProductById(params.id);

      return sendSuccess(res, 200, 'Product retrieved successfully', product);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const product = await productService.updateProduct(params.id, req.body);

      return sendSuccess(res, 200, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

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
