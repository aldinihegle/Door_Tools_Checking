<template>
  <div>
    <h2>Komparasi Potongan Trial</h2>
    <form @submit.prevent="handleSubmit">
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
          <th>Potongan Trial Sekarang</th>
          <th>Potongan Trial Sebelumnya</th>
          <th>Selisih</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in comparison" :key="row.code">
          <td>{{ row.code }}</td>
          <td>{{ row.name }}</td>
          <td>{{ formatRupiah(row.amount_now ?? 0) }}</td>
          <td>{{ formatRupiah(row.amount_prev ?? 0) }}</td>
          <td :style="{ color: row.diff > 0 ? 'green' : row.diff < 0 ? 'red' : 'black' }">{{ formatRupiah(row.diff) }}</td>
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

const periodNow = ref('')
const periodPrev = ref('')

const {
  periods,
  loading,
  error,
  comparison,
  fetchPeriods,
  fetchComparison
} = useComparison(
  '/api/payroll/periods',
  ({ period_now, period_prev }) => `/api/payroll/compare-trial-deduction?period_now=${period_now}&period_prev=${period_prev}`
)

onMounted(async () => {
  await fetchPeriods()
  if (periods.value.length > 1) {
    periodNow.value = periods.value[0]
    periodPrev.value = periods.value[1]
  } else if (periods.value.length === 1) {
    periodNow.value = periods.value[0]
    periodPrev.value = periods.value[0]
  }
  if (periodNow.value && periodPrev.value) fetchComparison({ period_now: periodNow.value, period_prev: periodPrev.value })
});

function handleSubmit() {
  fetchComparison({ period_now: periodNow.value, period_prev: periodPrev.value })
}
</script> 