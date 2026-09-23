import animalService from '../services/animal.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class AnimalController {
  async createAnimal(req, res, next) {
    try {
      const animal = await animalService.createAnimal(req.body);

      return sendSuccess(res, 201, 'Animal registered successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  async getAllAnimals(req, res, next) {
    try {
      const query = req._validated?.query || req.query;
      const { animals, total, page, limit } = await animalService.getAllAnimals(query);

      return sendSuccess(
        res,
        200,
        'Animals retrieved successfully',
        animals,
        { page, limit, total }
      );
    } catch (error) {
      next(error);
    }
  }

  async getAnimalStats(req, res, next) {
    try {
      const stats = await animalService.getAnimalStats();

      return sendSuccess(res, 200, 'Animal statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  async getAnimalById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const animal = await animalService.getAnimalById(params.id);

      return sendSuccess(res, 200, 'Animal retrieved successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  async updateAnimal(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const animal = await animalService.updateAnimal(params.id, req.body);

      return sendSuccess(res, 200, 'Animal updated successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  async deleteAnimal(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const animal = await animalService.deleteAnimal(params.id);

      return sendSuccess(res, 200, 'Animal deleted successfully', animal);
    } catch (error) {
      next(error);
    }
  }
}

export default new AnimalController();
