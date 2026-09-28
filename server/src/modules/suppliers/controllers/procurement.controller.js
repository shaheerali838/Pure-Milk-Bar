import procurementService from '../services/procurement.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class ProcurementController {
  async createProcurement(req, res, next) {
    try {
      const procurement = await procurementService.createProcurement(req.body);

      return sendSuccess(res, 201, 'Procurement recorded successfully', procurement);
    } catch (error) {
      next(error);
    }
  }

  async getAllProcurements(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const { procurements, total, page, limit } =
        await procurementService.getAllProcurements(query);

      return sendSuccess(
        res,
        200,
        'Procurement records retrieved successfully',
        procurements,
        { page, limit, total }
      );
    } catch (error) {
      next(error);
    }
  }

  async getDailySummary(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const date = query.date || new Date().toISOString().split('T')[0];
      const summary = await procurementService.getDailySummary(date);

      return sendSuccess(res, 200, 'Daily procurement summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }

  async getProcurementById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const procurement = await procurementService.getProcurementById(params.id);

      return sendSuccess(res, 200, 'Procurement record retrieved successfully', procurement);
    } catch (error) {
      next(error);
    }
  }

  async updateProcurement(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const procurement = await procurementService.updateProcurement(params.id, req.body);

      return sendSuccess(res, 200, 'Procurement record updated successfully', procurement);
    } catch (error) {
      next(error);
    }
  }

  async deleteProcurement(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      await procurementService.deleteProcurement(params.id);

      return sendSuccess(res, 200, 'Procurement record deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProcurementController();
