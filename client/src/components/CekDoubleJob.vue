<template>
  <div>
    <h1>Daftar Pegawai Double Job</h1>
    <table v-if="doubleJobs.length">
      <thead>
        <tr>
          <th>User ID</th>
          <th>Emp ID</th>
          <th>Person ID</th>
          <th>Nama</th>
          <th>Divisi</th>
          <th>Jabatan</th>
          <th>Jumlah Jabatan Aktif</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="job in doubleJobs" :key="job.emp_id">
          <td>{{ job.user_id }}</td>
          <td>{{ job.emp_id }}</td>
          <td>{{ job.person_id }}</td>
          <td>{{ job.Nama }}</td>
          <td>{{ job.Divisi }}</td>
          <td>{{ job.Jabatan }}</td>
          <td>{{ job.jumlah_jabatan_aktif }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else-if="!loading">Data tidak ditemukan.</div>
    <div v-else>Loading...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const doubleJobs = ref([])
const loading = ref(true)

async function fetchDoubleJobs() {
  loading.value = true
  const res = await fetch('/api/hr/double-jobs')
  const data = await res.json()
  doubleJobs.value = data.data || []
  loading.value = false
}

onMounted(fetchDoubleJobs)
</script>
