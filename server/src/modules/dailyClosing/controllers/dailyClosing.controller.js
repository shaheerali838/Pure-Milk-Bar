import DailyClosing from '../../../models/DailyClosing.model.js';
import { getPktDayRange, getPktTodayString } from '../../../utils/dateUtils.js';
import {
  getDailyClosingSummaryService,
  confirmDailyClosingService,
  getDailyClosingHistoryService,
  recordWastageService,
  getWastageLogsService,
  createDailyClosingService,
  getDailyClosingsService,
  getDailyClosingByIdService,
  getDailyClosingByDateService,
  reconcileDailyClosingService,
  approveDailyClosingService,
  reopenDailyClosingService,
  getDailyClosingReportService,
} from '../services/dailyClosing.service.js';


export const getDailyClosingSummary = async (req, res, next) => {
  try {
    const summary = await getDailyClosingSummaryService(req.query);
    res.status(200).json({
      success: true,
      message: 'Daily closing summary retrieved successfully',
      data: summary,

      ...summary,
    });
  } catch (error) {
    next(error);
  }
};


export const confirmDailyClosing = async (req, res, next) => {
  try {
    const result = await confirmDailyClosingService(req.user, req.body, req.ip);
    res.status(200).json({
      success: true,
      message: 'Daily closing confirmed, frozen and locked successfully',
      data: result,
      closing: result.closing,
      summary: result.summarySnapshot,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Light Closing History
export const getDailyClosingHistory = async (req, res, next) => {
  try {
    const history = await getDailyClosingHistoryService(req.query.limit);
    res.status(200).json({
      success: true,
      data: history,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Record Spoilage / Wastage Log
export const recordWastage = async (req, res, next) => {
  try {
    const wastage = await recordWastageService(req.user, req.body, req.ip);
    res.status(201).json({
      success: true,
      message: 'Wastage entry recorded successfully',
      data: wastage,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Get Wastage Logs
export const getWastageLogs = async (req, res, next) => {
  try {
    const logs = await getWastageLogsService(req.query);
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};



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

export const getDailyClosingByDate = async (req, res, next) => {
  try {
    const closing = await getDailyClosingByDateService(req.params.date);
    res.status(200).json({
      success: true,
      message: 'Daily closing date details retrieved successfully',
      data: { closing },
      ...closing,
    });
  } catch (error) {
    next(error);
  }
};

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

export const getTodayClosingStatus = async (req, res, next) => {
  try {
    const targetDateStr = req.query.date || getPktTodayString();
    const { startOfDay, endOfDay, dateStr } = getPktDayRange(targetDateStr);

    const closing = await DailyClosing.findOne({
      closingDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ closingDate: -1 })
      .populate('closedByUserId', 'name username role')
      .populate('reopenedByUserId', 'name username role')
      .lean();

    const isDayClosed = closing
      ? ['CLOSED', 'LOCKED', 'APPROVED', 'RECONCILED'].includes(closing.status)
      : false;

    res.status(200).json({
      success: true,
      isDayClosed,
      status: closing?.status || 'OPEN',
      date: dateStr,
      closingId: closing?._id || null,
      closedAt: closing?.closedAt || null,
      closedBy: closing?.closedByUserId?.name || 'Staff',
      reopenedAt: closing?.reopenedAt || null,
      reopenReason: closing?.reopenReason || null,
    });
  } catch (error) {
    next(error);
  }
};

export const reopenTodayClosing = async (req, res, next) => {
  try {
    const targetDateStr = req.body?.date || getPktTodayString();
    const { startOfDay, endOfDay, dateStr } = getPktDayRange(targetDateStr);

    const closing = await DailyClosing.findOne({
      closingDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!closing) {
      return res.status(200).json({
        success: true,
        isDayClosed: false,
        status: 'OPEN',
        message: `Day ${dateStr} is not closed.`,
      });
    }

    const reopenedClosing = await reopenDailyClosingService(
      closing._id.toString(),
      req.user,
      req.body || { reopenReason: 'Day reopened by Admin to reactivate website operations' },
      req.ip
    );

    res.status(200).json({
      success: true,
      isDayClosed: false,
      status: 'REOPENED',
      message: `Daily closing for ${dateStr} successfully reopened. Operations are now ACTIVE!`,
      data: { closing: reopenedClosing },
    });
  } catch (error) {
    next(error);
  }
};

