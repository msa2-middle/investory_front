<template>
  <header class="stock-header">
    <div class="header-container">
      <!-- 왼쪽: Investory 이니셜 -->
      <div class="header-left">
        <div class="logo">
          <router-link to="/" class="logo-text">Investory</router-link>
        </div>
      </div>

      <!-- 중앙: 홈, 검색 input, 검색 -->
      <div class="header-center">
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" active-class="active">홈</router-link>
        </nav>

        <div class="search-container">
          <div class="search-input-wrapper">
            <input
              type="text"
              class="search-input"
              placeholder="종목명/종목코드 검색"
              v-model="searchQuery"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keyup.enter="performSearch"
            />
            <button class="search-btn" @click="performSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <ul v-if="showAutocomplete && searchResults.length > 0" class="autocomplete-list">
              <li v-for="item in searchResults" :key="item.ticker || item.code" class="autocomplete-item" @mousedown.prevent="goToStockDetail(item)">
                <span class="autocomplete-stockId">{{ item.stockId }}</span>
                <span class="autocomplete-stockName">{{ item.stockName }}</span>
              </li>
            </ul>
          </div>
        </div>

        <nav class="nav-menu">
          <!-- <a href="#" class="nav-item">검색</a> -->
        </nav>
      </div>

      <!-- 오른쪽: 회원가입, 로그인 -->
      <div class="header-right">
        <div class="auth-buttons">
          <template v-if="authStore.token">
            <div class="dropdown" ref="dropdownRef" @click="toggleDropdown" style="position: relative;">
              <button class="btn-login dropdown-toggle" type="button">
                {{ authStore.userName }}님
              </button>
              <ul class="dropdown-menu show" v-if="dropdownOpen" style="right: 0; left: auto;">
                <li>
                  <router-link to="/mypage" class="dropdown-item">마이페이지</router-link>
                </li>
                <li>
                  <button class="dropdown-item" @click.stop="logout">로그아웃</button>
                </li>
              </ul>
            </div>
            <Alarm />
          </template>

          <template v-else>
            <button class="btn-signup" @click="goToSignup">회원가입</button>
            <button class="btn-login" @click="goToLogin">로그인</button>
          </template>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Alarm from '@/components/Alarm.vue'
import stockApi from '@/api/stockApi'

const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const authStore = useAuthStore() // 전역 로그인 상태 (Pinia)
const router = useRouter() // 라우터 이동 기능 사용

watch(
  () => authStore.token,
  (newToken) => {
    if (newToken) {
      dropdownOpen.value = false
    }
  }
)

// 검색창 상태 (반응형 상태)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const searchResults = ref([])
const showAutocomplete = ref(false)
let searchTimeout = null

// 자동완성 API 호출
async function fetchAutocomplete() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showAutocomplete.value = false
    return
  }
  try {
    const res = await stockApi.searchStocks(searchQuery.value.trim(), 100)
    searchResults.value = res.data || []
    showAutocomplete.value = true
  } catch {
    searchResults.value = []
    showAutocomplete.value = false
  }
}

// 검색창 입력시 자동완성
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  if (!val.trim()) {
    searchResults.value = []
    showAutocomplete.value = false
    return
  }
  searchTimeout = setTimeout(fetchAutocomplete, 200)
})


// 외부 클릭 감지 함수
function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

// 컴포넌트 마운트 시 이벤트 리스너 추가
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 검색창 이벤트
function onSearchFocus() {
  isSearchFocused.value = true
  if (searchResults.value.length > 0) showAutocomplete.value = true
}

function onSearchBlur() {
  isSearchFocused.value = false
  setTimeout(() => { showAutocomplete.value = false }, 150)
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

// 로그아웃 (스토어 초기화 + 페이지 이동)
function logout() {
  authStore.clearToken()
  router.push('/login')
}

function goToLogin() {
  router.push('/login')
}

function goToSignup() {
  router.push('/signup')
}

function performSearch() {
  if (searchQuery.value.trim()) {
    // 검색어에서 공백 제거하고 대문자로 변환 (종목코드 형식)
    const ticker = searchQuery.value.trim().toUpperCase();
    router.push(`/stock/${ticker}/stock-info`);
    searchQuery.value = ''; // 검색 후 입력창 초기화
  }
}

// 자동완성 항목 클릭 시 상세페이지 이동
function goToStockDetail(stock) {
  router.push(`/stock/${stock.stockId}/stock-info`)
  searchQuery.value = ''
  showAutocomplete.value = false
}
</script>

<style scoped>
.welcome-text {
  margin-right: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #ffffff;
}
.stock-header {
  background-color: #1a1a1a;
  color: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  flex: 1;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.header-center {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 32px;
}

.nav-menu {
  display: flex;
  gap: 24px;
}

.search-container {
  flex: 1;
  max-width: 400px;
  display: flex;
  justify-content: center;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 360px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  padding-right: 44px;
  background-color: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 24px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: #a0aec0;
}

.search-input:focus {
  border-color: #3b82f6;
  background-color: #374151;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.search-btn:hover {
  color: #3b82f6;
}

.nav-item {
  color: #9ca3af;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
}

.nav-item:hover {
  color: white;
}

.nav-item.active {
  color: white;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.auth-buttons {
  display: flex;
  gap: 12px;
}

.btn-signup,
.btn-login {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #374151;
}

.btn-signup {
  background-color: transparent;
  color: #9ca3af;
  border: 1px solid #374151;
}

.btn-signup:hover {
  background-color: #374151;
  color: white;
}

.btn-login {
  color: white;
}

.btn-login:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
  }

  .header-center {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .search-container {
    order: 2;
    max-width: none;
  }

  .nav-menu {
    gap: 20px;
    justify-content: center;
  }

  .nav-item {
    font-size: 14px;
  }

  .auth-buttons {
    gap: 8px;
  }

  .btn-signup,
  .btn-login {
    padding: 6px 12px;
    font-size: 13px;
  }

  .search-input {
    font-size: 16px; /* iOS에서 줌 방지 */
  }
}

.autocomplete-list {
  position: absolute;
  left: 0;
  right: 0;
  top: 40px;
  background: #23263a;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 100;
  max-height: 260px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
}
.autocomplete-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  transition: background 0.15s;
}
.autocomplete-item:hover {
  background: #374151;
}
.autocomplete-ticker {
  font-weight: bold;
  color: #60a5fa;
  margin-right: 8px;
}
.autocomplete-name {
  color: #fff;
  font-size: 1rem;
}
.autocomplete-stockId {
  font-weight: bold;
  color: #60a5fa;
  font-size: .7rem;
  margin-right: 10px;
  letter-spacing: 1px;
}
.autocomplete-stockName {
  color: #fff;
  font-size: .7rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
