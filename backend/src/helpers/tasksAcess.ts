import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TaskItem } from '../models/TaskItem'
import { TaskUpdate } from '../models/TaskUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TasksAccess')

export class Task {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly tasksTable = process.env.TASKS_TABLE
  ) {}

  async findAll(userId: string): Promise<TaskItem[]> {
    logger.info('Getting all tasks', { userId })

    const result = await this.docClient
      .query({
        TableName: this.tasksTable,
        IndexName: 'CreatedAtIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as TaskItem[]
  }

  async create(task: TaskItem): Promise<TaskItem> {
    await this.docClient
      .put({
        TableName: this.tasksTable,
        Item: task
      })
      .promise()

    return task
  }

  async update(
    taskId: string,
    userId: string,
    updatedTask: TaskUpdate
  ): Promise<TaskUpdate> {
    logger.info('taskItem', taskId)

    const key = {
      userId,
      taskId
    }
    await this.docClient
      .update({
        TableName: this.tasksTable,
        Key: key,
        UpdateExpression: 'SET #n = :n, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':n': updatedTask.name,
          ':dueDate': updatedTask.dueDate,
          ':done': updatedTask.done
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()

    return updatedTask
  }

  async destroy(
    taskId: string,
    userId: string
  ): Promise<Record<string, boolean>> {
    const key = {
      userId,
      taskId
    }
    await this.docClient
      .delete({
        TableName: this.tasksTable,
        Key: key
      })
      .promise()

    return {
      message: true
    }
  }
}
