import { apiEndpoint } from '../config'
import { Task } from '../types/Task'
import { CreateTaskRequest } from '../types/CreateTaskRequest'
import Axios from 'axios'
import { UpdateTaskRequest } from '../types/UpdateTaskRequest'

export async function getTasks(idToken: string): Promise<Task[]> {
  console.log('Fetching tasks')

  const response = await Axios.get(`${apiEndpoint}/tasks`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  console.log('Tasks:', response.data)
  return response.data.items
}

export async function createTask(
  idToken: string,
  newTask: CreateTaskRequest
): Promise<Task> {
  const response = await Axios.post(
    `${apiEndpoint}/tasks`,
    JSON.stringify(newTask),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.item
}

export async function patchTask(
  idToken: string,
  taskId: string,
  updatedTask: UpdateTaskRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/tasks/${taskId}`,
    JSON.stringify(updatedTask),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

export async function deleteTask(
  idToken: string,
  taskId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/tasks/${taskId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  taskId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/tasks/${taskId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file)
}
