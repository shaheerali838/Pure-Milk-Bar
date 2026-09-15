import {
  createDailyClosingService,
  getDailyClosingsService,
  getDailyClosingByIdService,
  getDailyClosingByDateService,
  reconcileDailyClosingService,
  approveDailyClosingService,
  reopenDailyClosingService,
  getDailyClosingReportService,
} from '../services/dailyClosing.service.js';

// 1. Create/Start Daily Closing Draft
export const createDailyClosing = async (req, res, next) => {
  try {
    const newClosing = await createDailyClosingService(req.user, req.body, req.ip);
    res.status(201).json({
      success: true,
      message: 'Daily closing draft initiated successfully',
      data: { closing: newClosing },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Daily Closing History List
export const getDailyClosings = async (req, res, next) => {
  try {
    const result = await getDailyClosingsService(req.query);
    res.status(200).json({
      success: true,
      message: 'Daily closing records retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Daily Closing Details by ID
export const getDailyClosingById = async (req, res, next) => {
  try {
    const closing = await getDailyClosingByIdService(req.params.id);
    res.status(200).json({
      success: true,
      data: { closing },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Daily Closing by Particular Date (YYYY-MM-DD)
export const getDailyClosingByDate = async (req, res, next) => {
  try {
    const closing = await getDailyClosingByDateService(req.params.date);
    res.status(200).json({
      success: true,
      message: 'Daily closing date details retrieved successfully',
      data: { closing },
    });
  } catch (error) {
    next(error);
  }
};

// 5. Reconcile Cash + Stock Variance
export const reconcileDailyClosing = async (req, res, next) => {
  try {
    const reconciledClosing = await reconcileDailyClosingService(
      req.params.id,
      req.user,
      req.body,
      req.ip
    );
    res.status(200).json({
      success: true,
      message: 'Daily closing physical cash and stock reconciled successfully',
      data: { closing: reconciledClosing },
    });
  } catch (error) {
    next(error);
  }
};

// 6. Manager/Admin Closing Approve
export const approveDailyClosing = async (req, res, next) => {
  try {
    const approvedClosing = await approveDailyClosingService(
      req.params.id,
      req.user,
      req.body,
      req.ip
    );
    res.status(200).json({
      success: true,
      message: 'Daily closing approved and locked successfully',
      data: { closing: approvedClosing },
    });
  } catch (error) {
    next(error);
  }
};

// 7. Approved Closing Reopen (Only Admin)
export const reopenDailyClosing = async (req, res, next) => {
  try {
    const reopenedClosing = await reopenDailyClosingService(
      req.params.id,
      req.user,
      req.body,
      req.ip
    );
    res.status(200).json({
      success: true,
      message: 'Daily closing reopened successfully by Admin',
      data: { closing: reopenedClosing },
    });
  } catch (error) {
    next(error);
  }
};

// 8. Complete Daily Closing Detailed Report
export const getDailyClosingReport = async (req, res, next) => {
  try {
    const reportData = await getDailyClosingReportService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Daily closing complete audit report generated successfully',
      data: reportData,
    });
  } catch (error) {
    next(error);
  }
};
