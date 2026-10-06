import animalSaleService from '../services/animalSale.service.js';

class AnimalSaleController {
  async recordSale(req, res, next) {
    try {
      const result = await animalSaleService.recordSale(req.body, req.user?._id || req.user?.id);
      res.status(201).json({
        success: true,
        message: 'Animal sale recorded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSales(req, res, next) {
    try {
      const result = await animalSaleService.getAllSales(req.query);
      res.status(200).json({
        success: true,
        data: result.sales,
        total: result.total,
        page: result.page,
        limit: result.limit,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSaleById(req, res, next) {
    try {
      const sale = await animalSaleService.getSaleById(req.params.id);
      res.status(200).json({
        success: true,
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSale(req, res, next) {
    try {
      const result = await animalSaleService.deleteSale(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnimalSaleController();
