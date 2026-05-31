import request from './index'

export const createProject = (data) => request.post('/projects/', data)
export const getProjects = (params) => request.get('/projects', { params })
export const getProjectDetail = (id) => request.get(`/projects/${id}`)
export const getProjectVersions = (id) => request.get(`/projects/${id}/versions`)
export const updateProjectStatus = (id, status) => request.patch(`/projects/${id}/status?status=${status}`)