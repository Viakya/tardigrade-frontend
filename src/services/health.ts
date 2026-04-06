import apiClient from './api'

export const wakeupBackend = async () => {
  try {
    await apiClient.get('/wakeup', { timeout: 8000 })
  } catch {
    // ignore wakeup errors to avoid blocking login
  }
}
