import express from 'express'
import { executeProgramRawValidation } from '../../utils'
import { STPController } from '../../controllers/'
import { FileUploadController } from '../../controllers/internal'

const stpRouter = express.Router()

const fileUploadController = new FileUploadController()
const controller = new STPController()

stpRouter.get('/execute', async (req, res) => {
  const { error, value: query } = executeProgramRawValidation(req.query)
  if (error) return res.status(400).send(error.details[0].message)

  try {
    const response = await controller.executeReturnRaw(req, query._program)

    if (response instanceof Buffer) {
      res.writeHead(200, (req as any).sasHeaders)
      return res.end(response)
    }

    res.send(response)
  } catch (err: any) {
    const statusCode = err.code

    delete err.code

    res.status(statusCode).send(err)
  }
})

stpRouter.post(
  '/execute',
  fileUploadController.preUploadMiddleware,
  fileUploadController.getMulterUploadObject().any(),
  async (req: any, res: any) => {
    const { error: errQ, value: query } = executeProgramRawValidation(req.query)
    const { error: errB, value: body } = executeProgramRawValidation(req.body)

    if (errQ && errB) return res.status(400).send(errB.details[0].message)

    try {
      const response = await controller.executeReturnJson(
        req,
        body,
        query?._program
      )

      if (response instanceof Buffer) {
        res.writeHead(200, (req as any).sasHeaders)
        return res.end(response)
      }

      res.send(response)
    } catch (err: any) {
      const statusCode = err.code

      delete err.code

      res.status(statusCode).send(err)
    }
  }
)

export default stpRouter
