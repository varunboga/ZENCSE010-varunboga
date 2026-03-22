/**
 * Axios instance for the Admin Dashboard.
 *
 * TODO (Students):
 * 1. Create an axios instance with:
 *    - baseURL from import.meta.env.VITE_API_URL
 *    - default Content-Type: application/json header
 *
 * 2. Add a request interceptor that attaches the X-API-Key header
 *    on every request, reading the key from import.meta.env.VITE_API_KEY
 *
 * 3. Add a response interceptor that:
 *    - Returns response.data directly (unwraps axios response)
 *    - On 401: alerts "Invalid API Key" or redirects to a config page
 *    - On 422: returns the error so the form can show field-level errors
 *    - On other errors: throws a readable error message
 *
 * Hint:
 *   import axios from 'axios'
 *
 *   const apiClient = axios.create({
 *     baseURL: import.meta.env.VITE_API_URL,
 *     headers: { 'Content-Type': 'application/json' },
 *   })
 *
 *   apiClient.interceptors.request.use((config) => {
 *     config.headers['X-API-Key'] = import.meta.env.VITE_API_KEY
 *     return config
 *   })
 *
 *   export default apiClient
 *
 * Usage in components:
 *   import apiClient from '../api/client'
 *   const stats = await apiClient.get('/api/v1/stats')
 */

// TODO: implement axios client here
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  config.headers['X-API-Key'] = import.meta.env.VITE_API_KEY
  return config
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      alert('Invalid API Key. Check your VITE_API_KEY in .env')
      return Promise.reject(error)
    }
    if (error.response?.status === 422) {
      return Promise.reject(error)
    }
    return Promise.reject(new Error(error.response?.data?.error || 'Something went wrong'))
  }
)

export default apiClient