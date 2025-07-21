<template>
  <div>
    <h2>Komparasi Mart Meal vs Payroll</h2>
    <form @submit.prevent="fetchComparison">
      <div>
        <label>Periode:</label>
        <select v-model="period" required>
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
          <th>Nama</th>
          <th>Kode</th>
          <th>Mart</th>
          <th>Payroll</th>
          <th>Periode</th>
          <th>Selisih (Mart - Payroll)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in comparison" :key="row.code">
          <td>{{ row.name }}</td>
          <td>{{ row.code }}</td>
          <td>{{ row.mart ?? 0 }}</td>
          <td>{{ row.payroll ?? 0 }}</td>
          <td>{{ row.period }}</td>
          <td :style="{ color: (row.mart - row.payroll) > 0 ? 'green' : (row.mart - row.payroll) < 0 ? 'red' : 'black' }">
            {{ (row.mart ?? 0) - (row.payroll ?? 0) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && !error">Tidak ada data komparasi.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const periods = ref([])
const period = ref('')
const comparison = ref([])
const loading = ref(false)
const error = ref('')

async function fetchPeriods() {
  try {
    const res = await fetch('/api/hr/payroll-periods')
    const data = await res.json()
    if (data.success && Array.isArray(data.data)) {
      periods.value = data.data
      if (periods.value.length > 0) {
        period.value = periods.value[0]
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
    const url = `/api/hr/compare-mart-meal?period=${period.value}`
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
