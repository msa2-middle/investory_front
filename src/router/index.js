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
import StockPriceHistoryView from '@/views/StockInfo/StockPriceHistoryView.vue'

import LoginView from '@/views/user/LoginView.vue'
import SignupView from '@/views/user/SignupView.vue'
import MyPageView from '@/views/user/MyPageView.vue'
import MyAllActivityView from '@/views/user/MyAllActivityView.vue'
import RedirectView from '@/views/user/RedirectView.vue'
import PasswordResetView from '@/views/user/PasswordResetView.vue'

import PostView from '@/views/post/PostView.vue'
import PostDetailView from '@/views/post/PostDetailView.vue'
import StockLayout from '@/views/StockInfo/StockLayout.vue'

import { useAuthStore } from '@/stores/auth'

const PriceView = {
  template:
    '<div style="text-align:center;padding:40px 0;font-size:1.5rem;">가격 차트/정보 영역(임시)</div>',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // User routes
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
      component: RedirectView,
    },
    {
      path: '/password-reset',
      name: 'passwordReset',
      component: PasswordResetView,
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
      path: '/my-activities',
      name: 'myAllActivity',
      component: MyAllActivityView,
    },
    {
      path: '/stock/:stockId/price',
      component: () => import('@/views/StockInfo/StockPriceView.vue'),
    },

    // Stock routes with nested structure
    {
      path: '/stock/:stockId',
      component: StockLayout,
      children: [
        // 기본 리디렉션: /stock/:stockId -> /stock/:stockId/price
        {
          path: '',
          redirect: (to) => `/stock/${to.params.stockId}/price`,
        },
        {
          path: 'price',
          name: 'stockPrice',
          component: PriceView,
        },
        {
          path: 'stock-info',
          name: 'stockInfo',
          component: StockInfoView,
          children: [
            // 기본 리디렉션: /stock/:stockId/stock-info -> /stock/:stockId/stock-info/product-info
            {
              path: '',
              redirect: (to) => `/stock/${to.params.stockId}/stock-info/product-info`,
            },
            {
              path: 'product-info',
              name: 'productInfo',
              component: ProductInfoView,
            },
            {
              path: 'balance-sheet',
              name: 'balanceSheet',
              component: BalanceSheetView,
            },
            {
              path: 'income-statement',
              name: 'incomeStatement',
              component: IncomeStatementView,
            },
            {
              path: 'financial-ratio',
              name: 'financialRatio',
              component: FinancialRatioView,
            },
            {
              path: 'profitability-ratio',
              name: 'profitabilityRatio',
              component: ProfitRatioView,
            },
            {
              path: 'stability-ratio',
              name: 'stabilityRatio',
              component: StabilityRatioView,
            },
            {
              path: 'growth-ratio',
              name: 'growthRatio',
              component: GrowthRatioView,
            },
          ],
        },
        {
          path: 'community',
          name: 'community',
          component: PostView,
        },
        {
          path: 'history',
          name: 'stockPriceHistory',
          component: StockPriceHistoryView,
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/community/posts/:postId',
      name: 'postDetail',
      component: PostDetailView,
    },
    {
      path: '/admin',
      name: 'adminHome',
      component: () => import('@/views/admin/AdminHomeView.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/users',
      name: 'adminUsers',
      component: () => import('@/views/admin/AdminUserList.vue'),
      meta: { requiresAdmin: true }
    },
    {
      path: '/admin/users/:id',
      name: 'adminUserDetail',
      component: () => import('@/views/admin/UserDetailView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/posts',
      name: 'adminPosts',
      component: () => import('@/views/admin/PostsListView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/posts/:id',
      name: 'adminPostDetail',
      component: () => import('@/views/admin/PostDetailView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/comments',
      name: 'adminComments',
      component: () => import('@/views/admin/AdminCommentList.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/comments/:id',
      name: 'adminCommentDetail',
      component: () => import('@/views/admin/AdminCommentDetail.vue'),
      meta: { requiresAdmin: true }
    },
    // 에러 라우트
    {
      path: '/error/404',
      name: 'error404',
      component: () => import('@/views/errors/ErrorNotFound.vue'),
    },
    {
      path: '/error/500',
      name: 'error500',
      component: () => import('@/views/errors/ServerError.vue'),
    },
    // 모든 잘못된 경로 catch → 404 페이지로 리디렉션
    {
      path: '/:pathMatch(.*)*',
      redirect: '/error/404',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAdmin && authStore.role !== 'ADMIN') {
    return next('/')
  }
  next()
})

export default router
