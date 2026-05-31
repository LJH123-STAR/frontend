import request from './index'

export const getEthnicGroups = () => request.get('/compose/ethnic-groups')
export const getLegalScenes = () => request.get('/compose/legal-scenes')
export const generateLyrics = (data) => request.post('/compose/generate', data)
export const uploadAndGenerate = (formData) => request.post('/compose/upload-and-generate', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})