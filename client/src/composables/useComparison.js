// client/src/composables/useComparison.js
import { ref } from 'vue'

export function useComparison(periodsEndpoint, comparisonEndpointBuilder) {
  const periods = ref([])
  const loading = ref(false)
  const error = ref('')
  const comparison = ref([])

  async function fetchPeriods() {
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(periodsEndpoint)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        periods.value = data.data
      } else {
        error.value = 'Gagal mengambil daftar periode'
      }
    } catch (e) {
      error.value = 'Gagal mengambil daftar periode'
    } finally {
      loading.value = false
    }
  }

  async function fetchComparison(params) {
    loading.value = true
    error.value = ''
    comparison.value = []
    try {
      const url = comparisonEndpointBuilder(params)
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal mengambil data komparasi')
      const data = await res.json()
      comparison.value = Array.isArray(data) ? data : (data.data || [])
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return { periods, loading, error, comparison, fetchPeriods, fetchComparison }
}
