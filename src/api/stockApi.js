import publicApi from './publicApi'

// 전체 Stock API
const stockApi = {
  getStockInfo: (code) => publicApi.get(`/stock/${code}/analytics/stock-info`),

}

export default stockApi
