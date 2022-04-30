import path from 'path'
import express from 'express'
import { fileExists } from '@sasjs/utils'
import { WebController } from '../../controllers/web'
import { getWebBuildFolderPath, loginWebValidation } from '../../utils'

const webRouter = express.Router()

webRouter.get('/', async (req, res) => {
  const indexHtmlPath = path.join(getWebBuildFolderPath(), 'index.html')

  if (await fileExists(indexHtmlPath)) {
    res.cookie('XSRF-TOKEN', req.csrfToken())
    return res.sendFile(indexHtmlPath)
  }

  return res.send('Web Build is not present')
})

webRouter.post('/login', async (req, res) => {
  const { error, value: body } = loginWebValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  const controller = new WebController()
  try {
    const response = await controller.login(req, body)
    res.send(response)
  } catch (err: any) {
    res.status(400).send(err.toString())
  }
})

webRouter.get('/logout', async (req, res) => {
  const controller = new WebController()
  try {
    await controller.logout(req)
    res.status(200).send()
  } catch (err: any) {
    res.status(400).send(err.toString())
  }
})

export default webRouter
