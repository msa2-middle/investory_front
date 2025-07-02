<!-- users-list.vue -->
<template>
  <div class="container py-5 text-dark">
    <h2 class="mb-4 text-center">유저 관리</h2>

    <!-- 검색창 -->
    <div class="mb-3">
      <input
        v-model="searchText"
        type="text"
        class="form-control"
        placeholder="이메일, 이름 등으로 검색"
      />
    </div>

    <!-- 유저 목록 테이블 -->
    <div class="bg-white p-3 rounded">
      <Vue3Datatable
        :rows="users"
        :columns="columns"
        :page-size="rowsPerPage"
        :page-size-options="rowsPerPageOptions"
        :layout="{ table: true, bottom: ['info', 'pagination'] }"
        :search="searchText"
        skin="bh-table-hover"
        :sortable="true"
      >
        <!-- actions 슬롯 -->
        <template #actions="data">
          <div class="d-flex gap-2">
            <router-link
              :to="`/admin/users/${data.value.userId}`"
              class="btn btn-sm btn-primary"
            >
              상세
            </router-link>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click="deleteUser(data.value)"
            >
              삭제
            </button>
          </div>
        </template>
      </Vue3Datatable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Vue3Datatable from '@bhplugin/vue3-datatable'
import '@bhplugin/vue3-datatable/dist/style.css'
import adminApi from '@/api/adminApi'

const searchText = ref('')
const users = ref([])

const rowsPerPage = ref(10)
const rowsPerPageOptions = [5, 10, 20, 50]

const columns = [
  { title: 'ID', field: 'userId', sortable: true },
  { title: '이메일', field: 'email', sortable: true },
  { title: '이름', field: 'name', sortable: true },
  { title: '권한', field: 'role', sortable: true },
  { title: '가입일', field: 'createdAt', sortable: true },
  { title: '관리', field: 'actions' },
]

onMounted(async () => {
  try {
    const res = await adminApi.getAllUsers()
    users.value = res.data.map((u) => ({
      userId: u.userId,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: formatDate(u.createdAt || u.created_at),
    }))
  } catch (e) {
    console.error(e)
    alert('유저 목록을 불러오는데 실패했습니다.')
  }
})

async function deleteUser(user) {
  if (confirm(`정말로 유저(${user.name})를 삭제하시겠습니까?`)) {
    try {
      await adminApi.deleteUser(user.userId);
      alert('삭제 완료!');

      // 삭제 후 목록 갱신
      const res = await adminApi.getAllUsers();
      users.value = res.data.map((u) => ({
        userId: u.userId,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: formatDate(u.createdAt || u.created_at),
      }));
    } catch (e) {
      console.error(e);
      alert('삭제 실패!');
    }
  }
}


function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString()
}
</script>

<style scoped>
.container {
  max-width: 1000px;
}
</style>
