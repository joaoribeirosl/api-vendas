import { getCustomRepository } from 'typeorm'
import Product from '../typeorm/entities/Product'
import { ProductRepository } from '../typeorm/repositories/ProductsRepository'
import redisCache from '@shared/cache/RedisCache'
class ListProductService {
  public async execute(): Promise<Product[]> {
    const productRepository = getCustomRepository(ProductRepository)

    let products = await redisCache.recover<Product[]>('api-vendas-product-list')
    if (!products) {
      products = await productRepository.find()
      await redisCache.save('api-vendas-product-list', products)
    }
    return products
  }
}
export default ListProductService
