import { getCustomRepository } from 'typeorm'
import Product from '../typeorm/entities/Product'
import { ProductRepository } from '../typeorm/repositories/ProductsRepository'
import AppError from '@shared/exceptions/AppError'
import redisCache from '@shared/cache/RedisCache'

interface IRequest {
  id: string
  name: string
  price: number
  quantity: number
}

class UpdateProductService {
  public async execute({ id, name, price, quantity }: IRequest): Promise<Product> {
    const productRepository = getCustomRepository(ProductRepository)
    const product = await productRepository.findOne(id)
    if (!product) throw new AppError('product not found')
    const productExists = await productRepository.findByName(name)
    if (productExists && name !== product.name) throw new AppError('product already exists')

    await redisCache.invalidate('api-vendas-product-list')

    product.name = name
    product.price = price
    product.quantity = quantity

    await productRepository.save(product)

    return product
  }
}
export default UpdateProductService
