import VehicleFuelLog from '../../../models/VehicleFuelLog.model.js';

class VehicleFuelLogService {
  async createVehicleFuelLog(payload) {
    const fuelLog = await VehicleFuelLog.create(payload);
    return fuelLog;
  }

  async getVehicleFuelLogs(query = {}) {
    const { riderId, date, shift, vehiclePlate, linkedDeliveryRunId, page = 1, limit = 50 } = query;

    const filter = {};

    if (riderId) filter.riderId = riderId;
    if (shift) filter.shift = shift;
    if (vehiclePlate) filter.vehiclePlate = new RegExp(vehiclePlate, 'i');
    if (linkedDeliveryRunId) filter.linkedDeliveryRunId = linkedDeliveryRunId;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [fuelLogs, total] = await Promise.all([
      VehicleFuelLog.find(filter)
        .populate('riderId', 'name phone role')
        .populate('linkedDeliveryRunId', 'runCode route status')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      VehicleFuelLog.countDocuments(filter),
    ]);

    return {
      fuelLogs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVehicleFuelLogById(id) {
    const fuelLog = await VehicleFuelLog.findById(id)
      .populate('riderId', 'name phone role')
      .populate('linkedDeliveryRunId', 'runCode route status');

    if (!fuelLog) {
      const error = new Error(`Vehicle Fuel Log with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return fuelLog;
  }

  async updateVehicleFuelLog(id, updateData) {
    if (!updateData || Object.keys(updateData).length === 0) {
      const error = new Error('No fields provided to update');
      error.statusCode = 400;
      throw error;
    }

    const updatedFuelLog = await VehicleFuelLog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('riderId', 'name phone role');

    if (!updatedFuelLog) {
      const error = new Error(`Vehicle Fuel Log with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return updatedFuelLog;
  }

  async deleteVehicleFuelLog(id) {
    const deletedFuelLog = await VehicleFuelLog.findByIdAndDelete(id);

    if (!deletedFuelLog) {
      const error = new Error(`Vehicle Fuel Log with ID '${id}' not found`);
      error.statusCode = 404;
      throw error;
    }

    return deletedFuelLog;
  }
}

export default new VehicleFuelLogService();
