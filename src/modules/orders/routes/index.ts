import { Router } from 'express'
import OrdersController from '../controllers/OrdersController'
import { celebrate, Joi, Segments } from 'celebrate'
import isAuthenticated from '@shared/middlewares/isAuthenticated'

const orderRouter = Router()
const ordersController = new OrdersController()

orderRouter.use(isAuthenticated)

orderRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  ordersController.show,
)

orderRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      customer_id: Joi.string().uuid().required(),
      products: Joi.required(),
    },
  }),
  ordersController.create,
)

export default orderRouter
