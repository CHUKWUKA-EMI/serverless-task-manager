export interface TaskItem {
  userId: string
  taskId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
