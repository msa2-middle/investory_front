import publicApi from './publicApi'

// 전체 Stock API
const stockApi = {
  // 1. 종목 기본 정보
  getProductInfo: (code) => publicApi.get(`/stock/${code}/analytics/productInfo`),

  // 2. 주식 기본 정보
  getStockInfo: (code) => publicApi.get(`/stock/${code}/analytics/stock-info`),

  // 3. 대차대조표
  getBalanceSheet: (code) => publicApi.get(`/stock/${code}/analytics/balance-sheet`),

  // 4. 손익계산서
  getIncomeStatement: (code) => publicApi.get(`/stock/${code}/analytics/income-statement`),

  // 5. 재무비율
  getFinancialRatio: (code) => publicApi.get(`/stock/${code}/analytics/financial-ratio`),

  // 6. 수익성 비율
  getProfitRatio: (code) => publicApi.get(`/stock/${code}/analytics/profitability-ratio`),

  // 7. 안정성 비율
  getStabilityRatio: (code) => publicApi.get(`/stock/${code}/analytics/stability-ratio`),

  // 8. 성장성 비율
  getGrowthRatio: (code) => publicApi.get(`/stock/${code}/analytics/growth-ratio`),

  // 9. 주가 정보 가져오기
  getStockPrice: (code) => publicApi.get(`/stock/${code}/price`),
}

export default stockApi
