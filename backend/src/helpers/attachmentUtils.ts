import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AttachmentUtils')

export class AttachmentUtils {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly tasksTable = process.env.TASKS_TABLE,
    private readonly imagesTable = process.env.IMAGES_TABLE,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })
  ) {}

  async createImage(
    taskId: string,
    imageId: string,
    event: any,
    userId: string
  ): Promise<any> {
    const timestamp = new Date().toISOString()
    const newImage = JSON.parse(event.body)
    const imageUrl = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
    logger.info('taskItem', { taskId, imageId, userId, event })
    const key = {
      userId,
      taskId
    }
    const newItem = {
      taskId,
      timestamp,
      imageId,
      ...newImage,
      imageUrl
    }
    logger.info('Saving new item: ', newItem)
    await this.docClient
      .put({
        TableName: this.imagesTable,
        Item: newItem
      })
      .promise()

    const updateUrlOnTask = {
      TableName: this.tasksTable,
      Key: key,
      UpdateExpression: 'set attachmentUrl = :a',
      ExpressionAttributeValues: {
        ':a': imageUrl
      },
      ReturnValues: 'UPDATED_NEW'
    }
    await this.docClient.update(updateUrlOnTask).promise()

    return newItem
  }

  async checkIftaskExists(taskId: string, userId: string) {
    logger.info('userId', { userId, taskId })

    const result = await this.docClient
      .get({
        TableName: this.tasksTable,
        Key: {
          taskId,
          userId
        }
      })
      .promise()

    logger.info('Get task: ', result)
    return !!result.Item
  }

  async getUploadUrl(imageId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: imageId,
      Expires: Number(this.urlExpiration)
    })
  }
}
