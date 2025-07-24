<template>
  <div>
    <h1>Order Anomalies</h1>
    <form @submit.prevent="fetchAnomalies">
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
    <table v-else-if="orders.length">
      <thead>
        <tr>
          <th>No</th>
          <th>Order ID</th>
          <th>Jenis Order</th>
          <th>Pegawai ID</th>
          <th>NIK</th>
          <th>Nama</th>
          <th>Deskripsi</th>
          <th>Waktu Order</th>
          <th>Waktu Close</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.orderId">
          <td>{{ order.no }}</td>
          <td>{{ order.orderId }}</td>
          <td>{{ order.jenisOrder }}</td>
          <td>{{ order.empId }}</td>
          <td>{{ order.NIK }}</td>
          <td>{{ order.name }}</td>
          <td>{{ order.orderDesc }}</td>
          <td>{{ order.waktuOrder }}</td>
          <td>{{ order.waktuClose }}</td>
          <td>{{ order.status }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="searched">Data tidak ditemukan.</div>
    <div v-else>Silakan pilih periode dan klik Cari.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

function today() {
  return new Date().toISOString().split('T')[0];
}

const orders = ref([])
const start = ref(today())
const end = ref(today())
const searched = ref(false)
const loading = ref(false) // ← Tambahkan ini

async function fetchAnomalies() {
  if (!start.value || !end.value) return
  loading.value = true // Mulai loading
  searched.value = false
  try {
    const url = `/api/order/anomalies?start=${start.value}&end=${end.value}`
    const res = await fetch(url)
    const json = await res.json()
    orders.value = json || []
  } finally {
    loading.value = false // Selesai loading
    searched.value = true
  }
}

onMounted(() => {
  fetchAnomalies();
});
</script>