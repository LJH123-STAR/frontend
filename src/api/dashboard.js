import request from './index'

export const getStats = () => request.get('/dashboard/stats')