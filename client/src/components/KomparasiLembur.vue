<template>
  <div>
    <h2>Komparasi Lembur Hari Kerja</h2>
    <form @submit.prevent="handleSubmit">
      <label>Periode:</label>
      <select v-model="period" required>
        <option v-for="p in periods" :key="p" :value="p">{{ p }}</option>
      </select>
      <button type="submit" :disabled="loading">Cek Komparasi</button>
    </form>
    <div v-if="loading">Memuat data...</div>
    <div v-if="error" style="color:red">{{ error }}</div>
    <table v-if="comparison.length">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Kode</th>
          <th>Mart (Reguler+Late)</th>
          <th>Payroll</th>
          <th>Periode</th>
          <th>Selisih</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in comparison" :key="row.code">
          <td>{{ row.name }}</td>
          <td>{{ row.code }}</td>
          <td>{{ formatRupiah(row.mart ?? 0) }}</td>
          <td>{{ formatRupiah(row.payroll ?? 0) }}</td>
          <td>{{ row.period }}</td>
          <td :style="{ color: (row.mart - row.payroll) > 0 ? 'green' : (row.mart - row.payroll) < 0 ? 'red' : 'black' }">
            {{ formatRupiah((row.mart ?? 0) - (row.payroll ?? 0)) }}
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading && !error">Tidak ada data komparasi.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useComparison } from '@/composables/useComparison'
import { formatRupiah } from '@/composables/formatRupiah'

const period = ref('')

const {
  periods,
  loading,
  error,
  comparison,
  fetchPeriods,
  fetchComparison
} = useComparison(
  '/api/payroll/periods',
  ({ period }) => `/api/payroll/compare-overtime?period=${period}`
)

onMounted(async () => {
  await fetchPeriods()
  if (periods.value.length > 0) period.value = periods.value[0]
  if (period.value) fetchComparison({ period: period.value })
});

function handleSubmit() {
  fetchComparison({ period: period.value })
}
</script>
