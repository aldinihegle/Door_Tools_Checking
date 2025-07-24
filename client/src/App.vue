<template>
  <h1>Tools-Checking</h1>
  <router-link to="/order-anomalies">Order Anomalies</router-link> |
  <router-link to="/cek-absen-japati">Absen Japati</router-link> |
  <router-link to="/double-jobs">Double Job</router-link> |
  <router-link to="/double-attendance">Double Attendance</router-link> |
  <router-link to="/expired-jobs">Expired Job</router-link> |
  <router-link to="/empty-orderflow">Empty Order Flow</router-link> |
  <router-link to="/komparasi-payroll">Komparasi Payroll</router-link> |
  <router-link to="/komparasi-potongan-trial">Komparasi Potongan Trial</router-link> |
  <router-link to="/komparasi-potongan-koperasi">Komparasi Potongan Koperasi</router-link> |
  <router-link to="/komparasi-mart-meal">Komparasi Mart Meal</router-link> |
  <router-link to="/komparasi-pemantra-attendance">Komparasi Pemantra Attendance</router-link> |
  <router-link to="/komparasi-lembur">Komparasi Lembur</router-link> |
  <router-link to="/komparasi-lembur-libur">Komparasi Lembur Libur</router-link> |
 <router-view />
</template>
  
<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
