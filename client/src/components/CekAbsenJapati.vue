<template>
 <div class="cek-absen-japati">
    <!-- Header -->
    <div class="header-section">
      <h2 class="title"><MapPin style="vertical-align: middle; margin-right: 6px;" />Cek Lokasi Absen Kantor Japati</h2>
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
          <Search style="vertical-align: middle; margin-right: 4px;" />
          {{ loading ? 'Checking...' : 'Cek Lokasi' }}
        </button>
        <button 
          @click="refreshData" 
          :disabled="loading"
          class="btn btn-secondary"
        >
          <RefreshCw style="vertical-align: middle; margin-right: 4px;" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <Loader2 class="loading-spinner" style="display:block; margin:0 auto 12px auto;" />
      <p>Memuat data lokasi absen...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-section">
      <p class="error-message"><AlertCircle style="vertical-align: middle; margin-right: 4px;" />{{ error }}</p>
      <button @click="checkLocation" class="btn btn-retry"><RefreshCw style="vertical-align: middle; margin-right: 4px;" />Coba Lagi</button>
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
            <Download style="vertical-align: middle; margin-right: 4px;" />
            Export Data
          </button>
          <button @click="showDetailedView = !showDetailedView" class="btn btn-toggle">
            <List style="vertical-align: middle; margin-right: 4px;" />
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
      <MapPin class="no-data-icon" />
      <h3>Tidak Ada Data</h3>
      <p>{{ message || 'Tidak ada data absensi valid di bawah 100 meter dari kantor Japati untuk tanggal ini.' }}</p>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { MapPin, Loader2, AlertCircle, Download, List, RefreshCw, Search } from 'lucide-vue-next';

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

<style scoped>
.cek-absen-japati {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px 20px 32px 20px;
}
.header-section {
  text-align: center;
  margin-bottom: 24px;
}
.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 6px;
  color: #007bff;
}
.subtitle {
  color: #555;
  font-size: 1.1rem;
}
.filter-section {
  margin-bottom: 18px;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}
.date-input label {
  margin-right: 8px;
}
.loading-section, .error-section, .no-data-section {
  text-align: center;
  margin: 32px 0 16px 0;
}
.loading-spinner {
  border: 4px solid #eaeaea;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.error-message {
  color: #d32f2f;
  font-weight: 500;
  margin-bottom: 10px;
}
.stats-section {
  margin: 24px 0 18px 0;
}
.stats-grid {
  display: flex;
  gap: 18px;
  justify-content: center;
  margin-bottom: 10px;
}
.stat-card {
  background: #f6f8fa;
  border-radius: 10px;
  padding: 18px 24px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.stat-number {
  font-size: 1.4rem;
  font-weight: bold;
  color: #007bff;
}
.stat-label {
  color: #555;
  font-size: 0.98rem;
}
.location-stats {
  margin-top: 10px;
  text-align: center;
}
.location-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 6px;
}
.location-chip {
  background: #e3eafc;
  color: #007bff;
  border-radius: 16px;
  padding: 4px 14px;
  font-size: 0.98rem;
  font-weight: 500;
}
.location-onsite { background: #e3fcec; color: #219653; }
.location-kemah { background: #fff4e3; color: #e67e22; }
.location-spj { background: #fce3e3; color: #d32f2f; }
.location-kemah-plus { background: #e3eaff; color: #5f27cd; }
.location-unknown { background: #f0f0f0; color: #888; }

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}
.action-buttons {
  display: flex;
  gap: 8px;
}
.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
  margin-top: 12px;
}
.employee-card {
  background: #f6f8fa;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.employee-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
  min-width: 32px;
}
.employee-info {
  flex: 1;
}
.employee-name {
  font-weight: 600;
  font-size: 1.08rem;
  color: #222;
}
.employee-location {
  font-size: 0.98rem;
  margin: 2px 0;
}
.employee-distance {
  color: #555;
  font-size: 0.97rem;
}
.detailed-view .table-container {
  margin-top: 10px;
}
.location-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
}
.distance-cell {
  font-family: monospace;
  color: #007bff;
}
.employee-name-cell {
  font-weight: 600;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 24px 0 0 0;
}
.page-info {
  font-size: 1rem;
  color: #555;
}
.no-data-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}
@media (max-width: 700px) {
  .cek-absen-japati {
    padding: 12px 2px 24px 2px;
  }
  .header-section {
    margin-bottom: 14px;
  }
  .stats-grid {
    flex-direction: column;
    gap: 8px;
  }
  .employee-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>