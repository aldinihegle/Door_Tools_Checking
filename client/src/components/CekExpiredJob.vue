<template>
  <div>
    <h1>Jabatan Berakhir Besok</h1>
    <table v-if="data.length">
      <thead>
        <tr>
          <th>RefID</th>
          <th>NIK</th>
          <th>Nama</th>
          <th>Berakhir</th>
          <th>Divisi</th>
          <th>Jabatan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.RefID + row.Berakhir">
          <td>{{ row.RefID }}</td>
          <td>{{ row.NIK }}</td>
          <td>{{ row.Nama }}</td>
          <td>{{ row.Berakhir }}</td>
          <td>{{ row.Divisi }}</td>
          <td>{{ row.Jabatan }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else>Data tidak ditemukan.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const data = ref([])
const loading = ref(false)
const error = ref('')

async function fetchExpiredJobs() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/order/expired-jobs')
    const json = await res.json()
    if(json.success) {
      data.value = json.data || []
    } else {
      error.value = json.message || 'Gagal mengambil data'
    }
  } catch (e) {
    console.error('Error fetching expired jobs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchExpiredJobs)
</script>
