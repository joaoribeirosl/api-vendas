import AppError from '@shared/exceptions/AppError'
import { getCustomRepository } from 'typeorm'
import User from '../typeorm/entities/User'
import UserRepository from '../typeorm/repositories/UserRepository'
import { hash } from 'bcryptjs'
import { instanceToInstance } from 'class-transformer'

interface IRequest {
  name: string
  email: string
  password: string
}

class CreateUserService {
  public async execute({ name, email, password }: IRequest): Promise<User> {
    const usersRepository = getCustomRepository(UserRepository)
    const emailExists = await usersRepository.findByEmail(email)

    if (emailExists) throw new AppError('Email address already used.')

    const hashedPassword = await hash(password, 8)

    const user = usersRepository.create({ name, email, password: hashedPassword })

    await usersRepository.save(instanceToInstance(user))

    return user
  }
}

export default CreateUserService
