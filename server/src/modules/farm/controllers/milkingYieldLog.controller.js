import milkingYieldLogService from '../services/milkingYieldLog.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class MilkingYieldLogController {
  async createMilkingYieldLog(req, res, next) {
    try {
      // In production, operatorId comes from JWT (req.user._id).
      // For Thunder Client testing without auth, accept operatorId from body.
      const operatorId = req.user?._id || req.body.operatorId;

      const log = await milkingYieldLogService.createMilkingYieldLog(req.body, operatorId);

      return sendSuccess(res, 201, 'Milking yield log recorded successfully', log);
    } catch (error) {
      next(error);
    }
  }

  async getAllMilkingYieldLogs(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const { logs, total, page, limit } =
        await milkingYieldLogService.getAllMilkingYieldLogs(query);

      return sendSuccess(
        res,
        200,
        'Milking yield logs retrieved successfully',
        logs,
        { page, limit, total }
      );
    } catch (error) {
      next(error);
    }
  }

  async getDailyYieldSummary(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const dateStr = query.date || new Date().toISOString().split('T')[0];
      const summary = await milkingYieldLogService.getDailyYieldSummary(dateStr);

      return sendSuccess(res, 200, 'Daily yield summary retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  }

  async getMilkingYieldLogById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const log = await milkingYieldLogService.getMilkingYieldLogById(params.id);

      return sendSuccess(res, 200, 'Milking yield log retrieved successfully', log);
    } catch (error) {
      next(error);
    }
  }

  async updateMilkingYieldLog(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const log = await milkingYieldLogService.updateMilkingYieldLog(params.id, req.body);

      return sendSuccess(res, 200, 'Milking yield log updated successfully', log);
    } catch (error) {
      next(error);
    }
  }

  async deleteMilkingYieldLog(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      await milkingYieldLogService.deleteMilkingYieldLog(params.id);

      return sendSuccess(res, 200, 'Milking yield log deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new MilkingYieldLogController();
