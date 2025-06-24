import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import MyPageView from '../views/MyPageView.vue'
import StockInfoView from '../views/StockInfoView.vue'
import ProductInfoView from '@/views/ProductInfoView.vue'
import BalanceSheetView from '@/views/BalanceSheetView.vue'
import IncomeStatementView from '@/views/IncomeStatementView.vue'
import FinancialRatioView from '@/views/FinancialRatioView.vue'
import ProfitRatioView from '@/views/ProfitRatioView.vue'
import StabilityRatioView from '@/views/StabilityRatioView.vue'
import GrowthRatioView from '@/views/GrowthRatioView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: MyPageView,
    },
    {
      path: '/stock/:stockId/stock-info',
      name: 'stockInfo',
      component: StockInfoView,
    },
    {
      path: '/stock/:stockId/product-info',
      name: 'productInfo',
      component: ProductInfoView,
    },
    {
      path: '/stock/:stockId/balance-sheet',
      name: 'balanceSheet',
      component: BalanceSheetView,
    },
    {
      path: '/stock/:stockId/income-statement',
      name: 'incomeStatement',
      component: IncomeStatementView,
    },
    {
      path: '/stock/:stockId/financial-ratio',
      name: 'financialRatio',
      component: FinancialRatioView,
    },
    {
      path: '/stock/:stockId/profitability-ratio',
      name: 'profitabilityRatio',
      component: ProfitRatioView,
    },
    {
      path: '/stock/:stockId/stability-ratio',
      name: 'stabilityRatio',
      component: StabilityRatioView,
    },
    {
      path: '/stock/:stockId/growth-ratio',
      name: 'growthRatio',
      component: GrowthRatioView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
