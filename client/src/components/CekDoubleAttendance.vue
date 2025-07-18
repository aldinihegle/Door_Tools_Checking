<template>
  <div>
    <h1>Cek Double Attendance</h1>
    <form @submit.prevent="fetchDoubleAttendance">
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
          <th>User ID</th>
          <th>Nama</th>
          <th>Ref ID</th>
          <th>Tanggal</th>
          <th>Jumlah Duplikat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.user_id + row.attendance_date">
          <td>{{ row.user_id }}</td>
          <td>{{ row.Nama }}</td>
          <td>{{ row.ref_id }}</td>
          <td>{{ row.attendance_date }}</td>
          <td>{{ row.duplicate_count }}</td>
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

async function fetchDoubleAttendance() {
  if (!start.value || !end.value) return
  loading.value = true
  searched.value = false
  try {
    const url = `/api/hr/double-attendance?start=${start.value}&end=${end.value}`
    const res = await fetch(url)
    const json = await res.json()
    data.value = json.data || []
  } finally {
    loading.value = false
    searched.value = true
  }
}
</script>
