import Product from '../../../models/Product.model.js';
import AppError from '../../../utils/AppError.js';

class ProductService {
  /**
   * Create a new product in the inventory.
   * @param {object} data - Validated product data
   * @returns {Promise<object>} Created product document
   */
  async createProduct(data) {
    // Check for duplicate SKU
    const existingProduct = await Product.findOne({ sku: data.sku });
    if (existingProduct) {
      throw new AppError(
        `Product with SKU '${data.sku}' already exists`,
        409,
        'DUPLICATE_SKU'
      );
    }

    const product = await Product.create(data);
    return product;
  }

  /**
   * Get all products with filtering, search, and pagination.
   * @param {object} query - Validated query parameters
   * @returns {Promise<{products: Array, total: number, page: number, limit: number}>}
   */
  async getAllProducts(query) {
    const { page, limit, category, unit, isAvailableForPos, isAvailableForDelivery, search } = query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (unit) filter.unit = unit;
    if (typeof isAvailableForPos === 'boolean') filter.isAvailableForPos = isAvailableForPos;
    if (typeof isAvailableForDelivery === 'boolean') filter.isAvailableForDelivery = isAvailableForDelivery;

    // Text search on SKU or name
    if (search) {
      filter.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    return { products, total, page, limit };
  }

  /**
   * Get a single product by ID.
   * @param {string} id - Product ObjectId
   * @returns {Promise<object>} Product document
   */
  async getProductById(id) {
    const product = await Product.findById(id).lean();

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Update an existing product.
   * @param {string} id - Product ObjectId
   * @param {object} data - Validated update data
   * @returns {Promise<object>} Updated product document
   */
  async updateProduct(id, data) {
    // If SKU is being changed, check for duplicates
    if (data.sku) {
      const existingProduct = await Product.findOne({
        sku: data.sku,
        _id: { $ne: id },
      });
      if (existingProduct) {
        throw new AppError(
          `Product with SKU '${data.sku}' already exists`,
          409,
          'DUPLICATE_SKU'
        );
      }
    }

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Delete a product from inventory.
   * @param {string} id - Product ObjectId
   * @returns {Promise<object>} Deleted product document
   */
  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    return product;
  }

  /**
   * Get products that are below their minimum alert stock level.
   * @returns {Promise<Array>} Low stock products
   */
  async getLowStockProducts() {
    const products = await Product.find({
      $expr: { $lte: ['$currentStock', '$minimumAlertStock'] },
    })
      .sort({ currentStock: 1 })
      .lean();

    return products;
  }

  /**
   * Get aggregate statistics for the inventory.
   * @returns {Promise<object>} Summary statistics
   */
  async getProductStats() {
    const [stats] = await Product.aggregate([
      {
        $facet: {
          totalProducts: [{ $count: 'count' }],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
          ],
          byUnit: [
            { $group: { _id: '$unit', count: { $sum: 1 } } },
          ],
          lowStock: [
            { $match: { $expr: { $lte: ['$currentStock', '$minimumAlertStock'] } } },
            { $count: 'count' },
          ],
          totalStockValue: [
            {
              $group: {
                _id: null,
                retailValue: { $sum: { $multiply: ['$currentStock', '$price'] } },
                costValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
              },
            },
          ],
        },
      },
    ]);

    return {
      totalProducts: stats.totalProducts[0]?.count || 0,
      lowStockCount: stats.lowStock[0]?.count || 0,
      byCategory: stats.byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byUnit: stats.byUnit.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      totalRetailValue: Number((stats.totalStockValue[0]?.retailValue || 0).toFixed(2)),
      totalCostValue: Number((stats.totalStockValue[0]?.costValue || 0).toFixed(2)),
    };
  }
}

export default new ProductService();
