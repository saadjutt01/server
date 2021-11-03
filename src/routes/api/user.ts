import express from 'express'
import { createUser } from '../../controllers/createUser'
import { registerUserValidation } from '../../utils'

const userRouter = express.Router()

userRouter.post('/', async (req, res) => {
  const { error, value: data } = registerUserValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  try {
    const savedUser = await createUser(data)
    res.send({
      displayname: savedUser.displayname,
      username: savedUser.username,
      isadmin: savedUser.isadmin,
      isactive: savedUser.isactive,
      tokens: []
    })
  } catch (err: any) {
    res.status(403).send(err.toString())
  }
})

export default userRouter
