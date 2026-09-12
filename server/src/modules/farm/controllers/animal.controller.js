import animalService from '../services/animal.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';

class AnimalController {
  /**
   * POST /api/farm/animals
   * Register a new animal in the livestock directory.
   */
  async createAnimal(req, res, next) {
    try {
      const animal = await animalService.createAnimal(req.body);

      return sendSuccess(res, 201, 'Animal registered successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/farm/animals
   * List all animals with filtering, search, and pagination.
   */
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

  /**
   * GET /api/farm/animals/stats
   * Get aggregate statistics for the livestock directory.
   */
  async getAnimalStats(req, res, next) {
    try {
      const stats = await animalService.getAnimalStats();

      return sendSuccess(res, 200, 'Animal statistics retrieved successfully', stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/farm/animals/:id
   * Get a single animal by ID.
   */
  async getAnimalById(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const animal = await animalService.getAnimalById(params.id);

      return sendSuccess(res, 200, 'Animal retrieved successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/farm/animals/:id
   * Update an existing animal.
   */
  async updateAnimal(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const animal = await animalService.updateAnimal(params.id, req.body);

      return sendSuccess(res, 200, 'Animal updated successfully', animal);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/farm/animals/:id
   * Soft-delete an animal (set isActive = false).
   */
  async deleteAnimal(req, res, next) {
    try {
      const params = req._validated?.params || req.params;
      const animal = await animalService.deleteAnimal(params.id);

      return sendSuccess(res, 200, 'Animal deactivated successfully', animal);
    } catch (error) {
      next(error);
    }
  }
}

export default new AnimalController();
