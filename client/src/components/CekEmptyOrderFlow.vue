<template>
  <div>
    <h1>Order Tanpa Flow</h1>
    <form @submit.prevent="fetchEmptyOrderFlow">
      <label>
        Start Date:
        <input type="date" v-model="start" required>
      </label>
      <label>
        End Date:
        <input type="date" v-model="end" required>
      </label>
      <button type="submit">Cari</button>
    </form>
    <div v-if="loading">Mengambil data...</div>
    <table v-else-if="data.length">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>User ID</th>
          <th>Nama</th>
          <th>Tipe</th>
          <th>Tanggal Buat</th>
          <th>Status Open</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.order_id">
          <td>{{ row.order_id }}</td>
          <td>{{ row.UserID }}</td>
          <td>{{ row.Nama }}</td>
          <td>{{ row.Tipe }}</td>
          <td>{{ row.TanggalBuat }}</td>
          <td>{{ row.statusOpen }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="searched">Data tidak ditemukan.</div>
    <div v-else>Silakan pilih periode dan klik Cari.</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const data = ref([])
const start = ref('')
const end = ref('')
const searched = ref(false)
const loading = ref(false)

async function fetchEmptyOrderFlow() {
  if (!start.value || !end.value) return
  loading.value = true
  searched.value = false
  try {
    const url = `/api/hr/empty-orderflow?start=${start.value}&end=${end.value}`
    const res = await fetch(url)
    const json = await res.json()
    data.value = json.data || []
  } finally {
    loading.value = false
    searched.value = true
  }
}
</script>
