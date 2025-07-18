<template>
  <div class="hello">
    <h1>Form Sederhana (Composition API)</h1>
    <form @submit.prevent="submitForm">
      <div>
        <label>Nama:</label>
        <input v-model="nama" type="text" required />
      </div>
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      <button type="submit">Kirim</button>
    </form>
    <div v-if="submitted">
      <h3>Hasil Input:</h3>
      <p>Nama: {{ nama }}</p>
      <p>Email: {{ email }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nama = ref('')
const email = ref('')
const submitted = ref(false)

function submitForm() {
  submitted.value = true
}
</script>

<style scoped>
form {
  margin-bottom: 20px;
}
div {
  margin-bottom: 10px;
}
label {
  display: inline-block;
  width: 60px;
}
input {
  padding: 4px;
}
button {
  padding: 6px 12px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
}
</style>
