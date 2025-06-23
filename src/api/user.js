import api from './axios'

// 회원가입
export const signup = (data) => api.post('/users/signup', data)

// 로그인
export const login = (data) => api.post('/users/login', data)

// 마이페이지 조회
export const getMyPage = () => api.get('/users/me')
