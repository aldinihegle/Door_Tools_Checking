<template>
  <div>
    <h2>Komparasi Payroll</h2>
    <form @submit.prevent="fetchComparison">
      <div>
        <label>Periode Sekarang:</label>
        <select v-model="periodNow" required>
          <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <div>
        <label>Periode Sebelumnya:</label>
        <select v-model="periodPrev" required>
          <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
        </select>
      </div>
      <button type="submit" :disabled="loading">Cek Komparasi</button>
    </form>

    <div v-if="loading">Memuat data...</div>
    <div v-if="error" style="color:red">{{ error }}</div>

    <table v-if="comparison.length">
      <thead>
        <tr>
          <th>Kode</th>
          <th>Nama</th>
          <th>Total Gaji Periode Sekarang</th>
          <th>Total Gaji Periode Sebelumnya</th>
          <th>Selisih</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in comparison" :key="row.code">
          <td>{{ row.code }}</td>
          <td>{{ row.name }}</td>
          <td>{{ row.total_gaji_now ?? 0 }}</td>
          <td>{{ row.total_gaji_prev ?? 0 }}</td>
          <td :style="{ color: row.diff > 0 ? 'green' : row.diff < 0 ? 'red' : 'black' }">{{ row.diff }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && !error">Tidak ada data komparasi.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const periods = ref([])
const periodNow = ref('')
const periodPrev = ref('')
const comparison = ref([])
const loading = ref(false)
const error = ref('')

async function fetchPeriods() {
  try {
    const res = await fetch('/api/payroll/periods')
    const data = await res.json()
    if (data.success && Array.isArray(data.data)) {
      periods.value = data.data
      if (periods.value.length > 1) {
        periodNow.value = periods.value[0]
        periodPrev.value = periods.value[1]
      } else if (periods.value.length === 1) {
        periodNow.value = periods.value[0]
        periodPrev.value = periods.value[0]
      }
    } else {
      error.value = 'Gagal mengambil daftar periode'
    }
  } catch (e) {
    error.value = 'Gagal mengambil daftar periode'
  }
}

async function fetchComparison() {
  loading.value = true
  error.value = ''
  comparison.value = []
  try {
    const url = `/api/payroll/compare?period_now=${periodNow.value}&period_prev=${periodPrev.value}&instance_id=62`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal mengambil data komparasi')
    const data = await res.json()
    comparison.value = Array.isArray(data) ? data : (data.data || [])
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchPeriods)
</script>
