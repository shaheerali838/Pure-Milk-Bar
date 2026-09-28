import deliveryService from '../services/delivery.service.js';
import User from '../../../models/User.model.js';

class DeliveryController {

    async createDeliveryRun(req, res, next) {
        try {
            const result = await deliveryService.createDeliveryRun(req.body);
            return res.status(201).json({
                success: true,
                message: 'Delivery run created successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }


    async getDeliveryRuns(req, res, next) {
        try {
            const data = await deliveryService.getDeliveryRuns(req.query);
            return res.status(200).json({
                success: true,
                data: data.deliveryRuns,
                pagination: data.pagination,
            });
        } catch (error) {
            next(error);
        }
    }


    async getDeliveryRunById(req, res, next) {
        try {
            const deliveryRun = await deliveryService.getDeliveryRunById(req.params.id);
            return res.status(200).json({
                success: true,
                data: deliveryRun,
            });
        } catch (error) {
            next(error);
        }
    }


    async updateDeliveryRun(req, res, next) {
        try {
            const updatedRun = await deliveryService.updateDeliveryRun(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: 'Delivery run updated successfully',
                data: updatedRun,
            });
        } catch (error) {
            next(error);
        }
    }


    async deleteDeliveryRun(req, res, next) {
        try {
            const deletedRun = await deliveryService.deleteDeliveryRun(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Delivery run deleted successfully',
                data: deletedRun,
            });
        } catch (error) {
            next(error);
        }
    }


    async assignRider(req, res, next) {
        try {
            const { riderId, riderNameSnapshot } = req.body;
            const updatedRun = await deliveryService.assignRider(req.params.id, riderId, riderNameSnapshot);
            return res.status(200).json({
                success: true,
                message: 'Rider assigned to delivery run successfully',
                data: updatedRun,
            });
        } catch (error) {
            next(error);
        }
    }



    async updateDeliveryStatus(req, res, next) {
        try {
            const updatedRun = await deliveryService.updateDeliveryStatus(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: `Delivery run status updated to ${req.body.status}`,
                data: updatedRun,
            });
        } catch (error) {
            next(error);
        }
    }



    async getRiderRunSheet(req, res, next) {
        try {
            const runSheet = await deliveryService.getRiderRunSheetSummary(req.query);
            return res.status(200).json({
                success: true,
                data: runSheet,
            });
        } catch (error) {
            next(error);
        }
    }



    async createVehicleFuelLog(req, res, next) {
        try {
            let riderId = req.body.riderId || req.user?.id || req.user?._id;
            if (!riderId) {
                const admin = await User.findOne({ role: 'ADMIN' });
                riderId = admin?._id;
            }
            const payload = {
                ...req.body,
                riderId,
                costRupees: Number(req.body.costRupees ?? req.body.amount) || 0,
                vehiclePlate: req.body.vehiclePlate || 'STANDARD',
                shift: req.body.shift || 'MORNING',
            };
            const fuelLog = await deliveryService.createVehicleFuelLog(payload);
            return res.status(201).json({
                success: true,
                message: 'Vehicle fuel log recorded successfully',
                data: fuelLog,
            });
        } catch (error) {
            next(error);
        }
    }



    async getVehicleFuelLogs(req, res, next) {
        try {
            const data = await deliveryService.getVehicleFuelLogs(req.query);
            return res.status(200).json({
                success: true,
                data: data.fuelLogs,
                pagination: data.pagination,
            });
        } catch (error) {
            next(error);
        }
    }



    async getVehicleFuelLogById(req, res, next) {
        try {
            const fuelLog = await deliveryService.getVehicleFuelLogById(req.params.id);
            return res.status(200).json({
                success: true,
                data: fuelLog,
            });
        } catch (error) {
            next(error);
        }
    }



    async updateVehicleFuelLog(req, res, next) {
        try {
            const updatedFuelLog = await deliveryService.updateVehicleFuelLog(req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: 'Vehicle fuel log updated successfully',
                data: updatedFuelLog,
            });
        } catch (error) {
            next(error);
        }
    }


    async deleteVehicleFuelLog(req, res, next) {
        try {
            const deletedFuelLog = await deliveryService.deleteVehicleFuelLog(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Vehicle fuel log deleted successfully',
                data: deletedFuelLog,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DeliveryController();
