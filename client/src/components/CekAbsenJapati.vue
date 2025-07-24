<template>
 <div class="cek-absen-japati">
    <!-- Header -->
    <div class="header-section">
      <h2 class="title">📍 Cek Lokasi Absen Kantor Japati</h2>
      <p class="subtitle">Daftar karyawan yang absen di bawah 100 meter dari kantor Japati</p>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-row">
        <div class="date-input">
          <label for="date">Tanggal:</label>
          <input 
            id="date"
            v-model="selectedDate" 
            type="date" 
            @change="checkLocation"
            :max="todayDate"
          >
        </div>
        <button 
          @click="checkLocation" 
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Checking...' : 'Cek Lokasi' }}
        </button>
        <button 
          @click="refreshData" 
          :disabled="loading"
          class="btn btn-secondary"
        >
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>Memuat data lokasi absen...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-section">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="checkLocation" class="btn btn-retry">Coba Lagi</button>
    </div>

    <!-- Stats Section -->
    <div v-if="stats && !loading" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ stats.total }}</div>
          <div class="stat-label">Total Karyawan</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ stats.averageDistance }}</div>
          <div class="stat-label">Rata-rata Jarak (km)</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ Object.keys(stats.byLocation).length }}</div>
          <div class="stat-label">Jenis Lokasi</div>
        </div>
      </div>
      
      <!-- Location Distribution -->
      <div class="location-stats">
        <h4>Distribusi Lokasi:</h4>
        <div class="location-chips">
          <div 
            v-for="(count, location) in stats.byLocation" 
            :key="location"
            class="location-chip"
            :class="getLocationClass(location)"
          >
            {{ location }}: {{ count }}
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="attendanceData.length > 0 && !loading" class="results-section">
      <div class="results-header">
        <h3>Hasil Pengecekan - {{ formatDate(selectedDate) }}</h3>
        <div class="action-buttons">
          <button @click="exportData" class="btn btn-export">
            📥 Export Data
          </button>
          <button @click="showDetailedView = !showDetailedView" class="btn btn-toggle">
            {{ showDetailedView ? '📋 View Simple' : '🔍 View Detail' }}
          </button>
        </div>
      </div>

      <!-- Simple View -->
      <div v-if="!showDetailedView" class="simple-view">
        <div class="employee-grid">
          <div 
            v-for="(item, index) in paginatedData" 
            :key="item.ref_id"
            class="employee-card"
          >
            <div class="employee-number">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</div>
            <div class="employee-info">
              <div class="employee-name">{{ item.employee_name }}</div>
              <div class="employee-location" :class="getLocationClass(item.flag_location_label)">
                {{ item.flag_location_label }}
              </div>
              <div class="employee-distance">{{ item.distance_km.toFixed(3) }} km</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed View -->
      <div v-if="showDetailedView" class="detailed-view">
        <div class="table-container">
          <table class="attendance-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Karyawan</th>
                <th>Lokasi</th>
                <th>Jarak (km)</th>
                <th>Ref ID</th>
                <th>Flag</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="item.ref_id">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td class="employee-name-cell">{{ item.employee_name }}</td>
                <td>
                  <span class="location-badge" :class="getLocationClass(item.flag_location_label)">
                    {{ item.flag_location_label }}
                  </span>
                </td>
                <td class="distance-cell">{{ item.distance_km.toFixed(3) }}</td>
                <td>{{ item.ref_id }}</td>
                <td>{{ item.flag_location }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="btn btn-pagination"
        >
          ← Previous
        </button>
        
        <div class="page-info">
          Halaman {{ currentPage }} dari {{ totalPages }} 
          ({{ attendanceData.length }} total karyawan)
        </div>
        
        <button 
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="btn btn-pagination"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- No Data State -->
    <div v-if="attendanceData.length === 0 && !loading && !error" class="no-data-section">
      <div class="no-data-icon">📍</div>
      <h3>Tidak Ada Data</h3>
      <p>{{ message || 'Tidak ada data absensi valid di bawah 100 meter dari kantor Japati untuk tanggal ini.' }}</p>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const attendanceData = ref([]);
const stats = ref(null);
const loading = ref(false);
const error = ref(null);
const message = ref('');
const showDetailedView = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(20);

const todayDate = computed(() => new Date().toISOString().split('T')[0]);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return attendanceData.value.slice(start, end);
});
const totalPages = computed(() => Math.ceil(attendanceData.value.length / itemsPerPage.value));

onMounted(() => {
  checkLocation();
});

async function checkLocation() {
  loading.value = true;
  error.value = null;
  try {
    let url = `/api/attendance/check-location`;
    if (selectedDate.value) {
      url += `?date=${encodeURIComponent(selectedDate.value)}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      attendanceData.value = data.data;
      stats.value = getLocationStats(attendanceData.value);
      message.value = data.message;
      currentPage.value = 1;
    } else {
      error.value = data.message || 'Gagal memuat data';
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Terjadi kesalahan saat memuat data';
    console.error('Error checking location:', err);
  } finally {
    loading.value = false;
  }
}

async function refreshData() {
  await checkLocation();
}

// async function exportData() {
//   try {
//     const response = await axios.get('/api/hr/check-location/export', {
//       params: {
//         date: this.selectedDate
//       }
//     });
//     
//     if (response.data.success) {
//       const dataStr = JSON.stringify(response.data.data, null, 2);
//       const dataBlob = new Blob([dataStr], { type: 'application/json' });
//       const url = URL.createObjectURL(dataBlob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = response.data.filename;
//       link.click();
//       URL.revokeObjectURL(url);
//     }
//   } catch (error) {
//     console.error('Error exporting data:', error);
//     alert('Gagal mengekspor data');
//   }
// },

function getLocationClass(location) {
  const locationClasses = {
    'Onsite': 'location-onsite',
    'Kemah': 'location-kemah',
    'SPJ': 'location-spj',
    'Kemah Plus': 'location-kemah-plus'
  };
  return locationClasses[location] || 'location-unknown';
}

function getLocationStats(data) {
  const stats = data.reduce((acc, item) => {
    const location = item.flag_location_label;
    acc.byLocation[location] = (acc.byLocation[location] || 0) + 1;
    acc.total += 1;
    acc.sumDistance += item.distance_km;
    return acc;
  }, { byLocation: {}, total: 0, sumDistance: 0 });
  return {
    total: stats.total,
    byLocation: stats.byLocation,
    averageDistance: stats.total > 0 ? (stats.sumDistance / stats.total).toFixed(3) : 0
  };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
</script>