import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import StockInfoView from '../views/StockInfo/StockInfoView.vue'
import ProductInfoView from '@/views/StockInfo/ProductInfoView.vue'
import BalanceSheetView from '@/views/StockInfo/BalanceSheetView.vue'
import IncomeStatementView from '@/views/StockInfo/IncomeStatementView.vue'
import FinancialRatioView from '@/views/StockInfo/FinancialRatioView.vue'
import ProfitRatioView from '@/views/StockInfo/ProfitRatioView.vue'
import StabilityRatioView from '@/views/StockInfo/StabilityRatioView.vue'
import GrowthRatioView from '@/views/StockInfo/GrowthRatioView.vue'
import LoginView from '@/views/user/LoginView.vue'
import SignupView from '@/views/user/SignupView.vue'
import MyPageView from '@/views/user/MyPageView.vue'
import RedirectView from '@/views/user/RedirectView.vue'
import PasswordResetView from '@/views/user/PasswordResetView.vue'

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
      path: '/oauth-success',
      name: 'RedirectView',
      component: RedirectView
    },
    {
      path: '/password-reset',
      name: 'passwordReset',
      component: PasswordResetView
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
