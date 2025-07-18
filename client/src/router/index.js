import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import ActiveEmployees from '../components/ActiveEmployees.vue'
import OrderAnomalies from '../components/OrderAnomalies.vue'
import CekAbsenJapati from '@/components/CekAbsenJapati.vue';
import CekDoubleJob from '../components/CekDoubleJob.vue';
import CekDoubleAttendance from '../components/CekDoubleAttendance.vue'
import CekExpiredJob from '../components/CekExpiredJob.vue'
import CekEmptyOrderFlow from '../components/CekEmptyOrderFlow.vue'

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/active-employees', component: ActiveEmployees },
  { path: '/order-anomalies', component: OrderAnomalies },
  {
    path: '/cek-absen-japati',
    name: 'CekAbsenJapati',
    component: CekAbsenJapati
  },
  { path: '/double-jobs', component: CekDoubleJob },
  { path: '/double-attendance', component: CekDoubleAttendance },
  { path: '/expired-jobs', component: CekExpiredJob },
  { path: '/empty-orderflow', component: CekEmptyOrderFlow },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router