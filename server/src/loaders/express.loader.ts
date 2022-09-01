import express, { NextFunction } from 'express'
import cors from 'cors'
import routes from '../api'
import { appConfig } from '../config'

interface IExpress {
  app: express.Router
}

export default ({ app }: IExpress): void => {
  /**
   * Health Check endpoints
   */
  app.get('/status', (req, res) => {
    res.status(200).end()
  })

  // Enable cors
  app.use(
    cors({
      origin: [appConfig.FRONT_URL, appConfig.DEV_URL],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )

  // Transforms the raw string of req.body into json
  app.use(express.json())

  // Load API routes
  app.use(appConfig.API.PREFIX, routes())

  /// catch 404 and forward to error handler
  app.use((req, res, next: NextFunction) => {
    next({
      message: 'Not Found',
      status: 404
    })
  })

  /// error handlers
  app.use((err: any, req: any, res: any, next: NextFunction) => {
    /**
     * Handle 401 thrown by express-jwt library
     */
    if (err.name === 'UnauthorizedError') {
      return res
        .status(err.status)
        .send({ message: err.message })
        .end()
    }
    return next(err)
  })

  app.use((err: any, req: any, res: any, next: NextFunction) => {
    res.status(err.status || 500)
    res.json({
      errors: {
        message: err.message
      }
    })
  })
}
