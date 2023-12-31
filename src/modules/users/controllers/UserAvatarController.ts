import { Request, Response } from 'express'
import UpdateUserAvatarService from '../services/UpdateUserAvatarService'

export default class UserAvatarController {
  public async update(req: Request, res: Response): Promise<Response> {
    const updateAvatar = new UpdateUserAvatarService()

    const user = await updateAvatar.execute({ idUser: req.idUser, avatarPath: req.file?.filename })

    return res.json(user)
  }
}
