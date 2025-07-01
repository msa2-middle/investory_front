import publicApi from './publicApi'

// 해외 채권/금리 데이터 조회
export const getForeignFixedIncome = () => publicApi.get('main/fixed-income/foreign')

// 국내 채권/금리 데이터 조회
export const getDomesticFixedIncome = () => publicApi.get('main/fixed-income/domestic')

// KOSPI 주요지수 데이터 조회
export const getKospi = () => publicApi.get('/main/kospi')

// KOSDAQ 주요지수 데이터 조회
export const getKosdaq = () => publicApi.get('/main/kosdaq')

// KOSPI200 주요지수 데이터 조회
export const getKospi200 = () => publicApi.get('/main/kospi200')
