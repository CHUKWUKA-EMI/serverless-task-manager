import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTask } from '../../helpers/tasks'
import { UpdateTaskRequest } from '../../requests/UpdateTaskRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const taskId = event.pathParameters.taskId
    const updatedTask: UpdateTaskRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const updated = await updateTask(updatedTask, taskId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify(updated)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true,
    origin: '*'
  })
)
