import supplierService from '../services/supplier.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class SupplierController {
  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body);

      return sendSuccess(res, 201, 'Supplier registered successfully', supplier);
    } catch (error) {
      next(error);
    }
  }

  async getAllSuppliers(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const { suppliers, total, page, limit } = await supplierService.getAllSuppliers(query);

      return sendSuccess(
        res,
        200,
        'Suppliers retrieved successfully',
        suppliers,
        { page, limit, total }
      );
    } catch (error) {
      next(error);
    }
  }

  async getSupplierStats(req, res, next) {
    try {
      const stats = await supplierService.getSupplierStats();

      return sendSuccess(res, 200, 'Supplier statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const supplier = await supplierService.getSupplierById(params.id);

      return sendSuccess(res, 200, 'Supplier retrieved successfully', supplier);
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const supplier = await supplierService.updateSupplier(params.id, req.body);

      return sendSuccess(res, 200, 'Supplier updated successfully', supplier);
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const supplier = await supplierService.deleteSupplier(params.id);

      return sendSuccess(res, 200, 'Supplier deactivated successfully', supplier);
    } catch (error) {
      next(error);
    }
  }
}

export default new SupplierController();
