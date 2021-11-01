import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTaskRequest } from '../../requests/CreateTaskRequest'
import { getUserId } from '../utils'
import { createTask } from '../../helpers/tasks'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTask: CreateTaskRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const task = await createTask(newTask, userId)
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: task
      })
    }
  }
)

handler.use(
  cors({
    credentials: true,
    origin: '*'
  })
)
