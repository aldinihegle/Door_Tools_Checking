<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-title">Tools-Checking</div>
      <div class="navbar-links">
        <router-link to="/">Dashboard</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
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
  background: #f6f8fa;
  min-height: 100vh;
  margin: 0;
}
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #007bff;
  color: #fff;
  padding: 18px 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.navbar-title {
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 1px;
}
.navbar-links a {
  color: #fff;
  text-decoration: none;
  font-size: 1rem;
  margin-left: 18px;
  transition: text-decoration 0.2s;
}
.navbar-links a:hover {
  text-decoration: underline;
}
.main-content {
  max-width: 1200px;
  margin: 40px auto 0 auto;
  padding: 0 16px;
}
.table-container {
  width: 100%;
  overflow-x: auto;
  margin: 24px 0;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  margin: 0 auto 24px auto;
  font-size: 15px;
  overflow: hidden;
}
thead {
  background: #007bff;
  color: #fff;
}
th, td {
  padding: 12px 16px;
  border-bottom: 1px solid #eaeaea;
  text-align: left;
}
th:first-child, td:first-child {
  border-top-left-radius: 10px;
}
th:last-child, td:last-child {
  border-top-right-radius: 10px;
}
tbody tr:hover {
  background: #f6f8fa;
}
tbody tr:last-child td {
  border-bottom: none;
}
@media (max-width: 700px) {
  table, thead, tbody, th, td, tr {
    display: block;
  }
  th, td {
    padding: 10px 8px;
    font-size: 14px;
  }
  table {
    border-radius: 0;
    box-shadow: none;
  }
}
button, .btn {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  margin: 4px 0;
  outline: none;
  display: inline-block;
}
button:hover, .btn:hover, button:focus, .btn:focus {
  background: #0056b3;
}
button:disabled, .btn:disabled {
  background: #b3d1fa;
  color: #fff;
  cursor: not-allowed;
}
input[type="text"], input[type="date"], input[type="number"], select {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 1rem;
  margin: 4px 0 12px 0;
  outline: none;
  transition: border 0.2s;
  background: #fff;
}
input[type="text"]:focus, input[type="date"]:focus, input[type="number"]:focus, select:focus {
  border: 1.5px solid #007bff;
}
label {
  font-weight: 500;
  margin-bottom: 4px;
  display: inline-block;
  color: #333;
}
form {
  margin-bottom: 18px;
}
</style>
