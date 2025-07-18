<template>
  <div>
    <h1>Daftar Employee Aktif</h1>
    <form @submit.prevent="fetchEmployees">
      <input v-model="searchNama" placeholder="Cari nama employee..." />
      <button type="submit">Cari</button>
    </form>
    <table v-if="employees.length">
      <thead>
        <tr>
          <th>Kode</th>
          <th>Nama</th>
          <th>Email</th>
          <th>Divisi</th>
          <th>Jabatan</th>
          <th>Mulai Menjabat</th>
          <th>Akhir Menjabat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="emp in employees" :key="emp.employee_id">
          <td>{{ emp.code }}</td>
          <td>{{ emp.nama }}</td>
          <td>{{ emp.email }}</td>
        <td>{{ emp.divisi }}</td>
        <td>{{ emp.jabatan }}</td>
        <td>{{ emp.mulaiMenjabat }}</td>
        <td>{{ emp.akhirMenjabat }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else>
      <span v-if="isSearched">Data tidak ditemukan.</span>
      <span v-else>Loading...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const employees = ref([])
const searchNama = ref('')
const isSearched = ref(false)

async function fetchEmployees() {
  let url = 'http://localhost:3000/api/hr/active-employees'
  if (searchNama.value) {
    url += `?nama=${encodeURIComponent(searchNama.value)}`
  }
  const res = await fetch(url)
  employees.value = await res.json()
  isSearched.value = true
}

onMounted(fetchEmployees)
</script>