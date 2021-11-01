import { Task } from './tasksAcess'
// import { AttachmentUtils } from './attachmentUtils'
import { TaskItem } from '../models/TaskItem'
import { TaskUpdate } from '../models/TaskUpdate'
import { CreateTaskRequest } from '../requests/CreateTaskRequest'
import { UpdateTaskRequest } from '../requests/UpdateTaskRequest'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const task = new Task()

export async function getAllTasks(userId: string): Promise<TaskItem[]> {
  return await task.findAll(userId)
}

export async function createTask(
  createTaskRequest: CreateTaskRequest,
  userId: string
): Promise<TaskItem> {
  const taskId = uuid.v4()

  return await task.create({
    taskId,
    userId,
    done: false,
    createdAt: new Date().toISOString(),
    ...createTaskRequest
  })
}

export async function updateTask(
  updateTaskRequest: UpdateTaskRequest,
  taskId: string,
  userId: string
): Promise<TaskUpdate> {
  return await task.update(taskId, userId, updateTaskRequest)
}

export async function deleteTask(
  taskId: string,
  userId: string
): Promise<Record<string, boolean>> {
  return await task.destroy(taskId, userId)
}
