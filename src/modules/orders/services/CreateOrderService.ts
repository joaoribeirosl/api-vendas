import CustomersRepository from '@module/customers/typeorm/repositories/CustomerRepository'
import { ProductRepository } from '@module/products/typeorm/repositories/ProductsRepository'
import AppError from '@shared/exceptions/AppError'
import { getCustomRepository } from 'typeorm'
import Order from '../typeorm/entities/Order'
import OrdersRepository from '../typeorm/repositories/OrdersRepository'

interface IProduct {
  id: string
  quantity: number
}

interface IRequest {
  customer_id: string
  products: IProduct[]
}

class CreateOrderService {
  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const ordersRepository = getCustomRepository(OrdersRepository)
    const customersRepository = getCustomRepository(CustomersRepository)
    const productsRepository = getCustomRepository(ProductRepository)

    const customerExists = await customersRepository.findById(customer_id)
    if (!customerExists) throw new AppError('Customer not found!')

    const productsExists = await productsRepository.findAllByIds(products)
    if (!productsExists.length) throw new AppError('Products not found!')

    const productsExistsIds = productsExists.map(product => product.id)
    const checkInexistentProducts = products.filter(product => !productsExistsIds.includes(product.id))
    if (checkInexistentProducts.length) throw new AppError(`Could not find product ${checkInexistentProducts[0].id}.`)

    const quantityAvailable = products.filter(product => productsExists.filter(p => p.id === product.id)[0].quantity < product.quantity)

    if (quantityAvailable.length) throw new AppError(`The quantity ${quantityAvailable[0].quantity}is not available for ${quantityAvailable[0].id}.`)

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: productsExists.filter(p => p.id === product.id)[0].price,
    }))

    const order = await ordersRepository.createOrder({
      customer: customerExists,
      products: serializedProducts,
    })

    const { order_products } = order

    const updatedProductQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity: productsExists.filter(p => p.id === product.product_id)[0].quantity - product.quantity,
    }))

    await productsRepository.save(updatedProductQuantity)

    return order
  }
}

export default CreateOrderService
