import api from './axios'

export function fetchUsers(params = {}) {
  return api.get('/users', { params })
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`)
}

export function fetchUser(id) {
  return api.get(`/users/${id}`)
}

export function updateUser(id, payload) {
  return api.patch(`/users/${id}`, payload)
}
