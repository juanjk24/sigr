import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateDish,
  validateUpdateDish,
} from '../validations/menu.validation';
import {
  listCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  listDishesHandler,
  createDishHandler,
  updateDishHandler,
  deleteDishHandler,
} from '../controllers/menu.controller';

const router = Router();

router.use(authenticate);

router.get('/categories', listCategoriesHandler);
router.post('/categories', validateCreateCategory, createCategoryHandler);
router.put('/categories/:id', validateUpdateCategory, updateCategoryHandler);
router.delete('/categories/:id', deleteCategoryHandler);

router.get('/dishes', listDishesHandler);
router.post('/dishes', validateCreateDish, createDishHandler);
router.put('/dishes/:id', validateUpdateDish, updateDishHandler);
router.delete('/dishes/:id', deleteDishHandler);

export default router;
