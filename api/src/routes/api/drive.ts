import express from 'express'
import { deleteFile } from '@sasjs/utils'

import { publishAppStream } from '../appStream'

import { multerSingle } from '../../middlewares/multer'
import { DriveController } from '../../controllers/'
import {
  deployValidation,
  fileBodyValidation,
  fileParamValidation
} from '../../utils'

const controller = new DriveController()

const driveRouter = express.Router()

driveRouter.post('/deploy', async (req, res) => {
  const { error, value: body } = deployValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  try {
    const response = await controller.deploy(body)

    if (body.streamWebFolder) {
      const { streamServiceName } = await publishAppStream(
        body.appLoc,
        body.streamWebFolder,
        body.streamServiceName,
        body.streamLogo
      )
      response.streamServiceName = streamServiceName
    }

    res.send(response)
  } catch (err: any) {
    const statusCode = err.code

    delete err.code

    res.status(statusCode).send(err)
  }
})

driveRouter.get('/file', async (req, res) => {
  const { error: errQ, value: query } = fileParamValidation(req.query)
  const { error: errB, value: body } = fileBodyValidation(req.body)

  if (errQ && errB) return res.status(400).send(errQ.details[0].message)

  try {
    await controller.getFile(req, query._filePath, body.filePath)
  } catch (err: any) {
    res.status(403).send(err.toString())
  }
})

driveRouter.delete('/file', async (req, res) => {
  const { error: errQ, value: query } = fileParamValidation(req.query)

  if (errQ) return res.status(400).send(errQ.details[0].message)

  try {
    const response = await controller.deleteFile(query._filePath)
    res.send(response)
  } catch (err: any) {
    res.status(403).send(err.toString())
  }
})

driveRouter.post(
  '/file',
  (...arg) => multerSingle('file', arg),
  async (req, res) => {
    const { error: errQ, value: query } = fileParamValidation(req.query)
    const { error: errB, value: body } = fileBodyValidation(req.body)

    if (errQ && errB) {
      if (req.file) await deleteFile(req.file.path)
      return res.status(400).send(errQ.details[0].message)
    }

    if (!req.file) return res.status(400).send('"file" is not present.')

    try {
      const response = await controller.saveFile(
        req.file,
        query._filePath,
        body.filePath
      )
      res.send(response)
    } catch (err: any) {
      await deleteFile(req.file.path)
      res.status(403).send(err.toString())
    }
  }
)

driveRouter.patch(
  '/file',
  (...arg) => multerSingle('file', arg),
  async (req, res) => {
    const { error: errQ, value: query } = fileParamValidation(req.query)
    const { error: errB, value: body } = fileBodyValidation(req.body)

    if (errQ && errB) {
      if (req.file) await deleteFile(req.file.path)
      return res.status(400).send(errQ.details[0].message)
    }

    if (!req.file) return res.status(400).send('"file" is not present.')

    try {
      const response = await controller.updateFile(
        req.file,
        query._filePath,
        body.filePath
      )
      res.send(response)
    } catch (err: any) {
      await deleteFile(req.file.path)
      res.status(403).send(err.toString())
    }
  }
)

driveRouter.get('/fileTree', async (req, res) => {
  try {
    const response = await controller.getFileTree()
    res.send(response)
  } catch (err: any) {
    res.status(403).send(err.toString())
  }
})

export default driveRouter
