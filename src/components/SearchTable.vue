<template>
  <div>
    <div class="mb-3 d-flex justify-content-end">
      <input
        v-model="searchTerm"
        type="text"
        class="form-control w-25"
        :placeholder="searchPlaceholder"
      />
    </div>

    <table class="table custom-table table-hover rounded">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.field"
            @click="sortBy(col.field)"
            style="cursor:pointer"
          >
            {{ col.label }}
            <span v-if="sortField === col.field">
              {{ sortDirection === 'asc' ? '▲' : '▼' }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in pagedItems" :key="item[columns[0].field]">
          <td v-for="col in columns" :key="col.field">
            {{ item[col.field] }}
          </td>
        </tr>
        <tr v-if="pagedItems.length === 0">
          <td :colspan="columns.length" class="text-center text-muted">
            데이터가 없습니다.
          </td>
        </tr>
      </tbody>
    </table>

    <nav v-if="totalPages > 1">
      <ul class="pagination justify-content-center">
        <li
          class="page-item"
          :class="{ disabled: currentPage === 1 }"
          @click="prevPage"
        >
          <a class="page-link" href="#">이전</a>
        </li>
        <li
          v-for="n in totalPages"
          :key="n"
          class="page-item"
          :class="{ active: currentPage === n }"
          @click="goToPage(n)"
        >
          <a class="page-link" href="#">{{ n }}</a>
        </li>
        <li
          class="page-item"
          :class="{ disabled: currentPage === totalPages }"
          @click="nextPage"
        >
          <a class="page-link" href="#">다음</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  items: Array,
  columns: Array,
  searchPlaceholder: String,
})

const searchTerm = ref('')
const sortField = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)
const rowsPerPage = 5

const filteredItems = computed(() => {
  if (!searchTerm.value) return props.items
  return props.items.filter(item =>
    props.columns.some(col =>
      String(item[col.field] || '').toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  )
})

const sortedItems = computed(() => {
  if (!sortField.value) return filteredItems.value
  return [...filteredItems.value].sort((a, b) => {
    const valA = a[sortField.value] || ''
    const valB = b[sortField.value] || ''
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(sortedItems.value.length / rowsPerPage))
)

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage
  return sortedItems.value.slice(start, start + rowsPerPage)
})

function sortBy(field) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function goToPage(n) {
  currentPage.value = n
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

watch(searchTerm, () => {
  currentPage.value = 1
})
</script>
