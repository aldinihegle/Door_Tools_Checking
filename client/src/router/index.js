import { createRouter, createWebHistory } from 'vue-router'
import HelloWorld from '../components/HelloWorld.vue'
import ActiveEmployees from '../components/ActiveEmployees.vue'
import OrderAnomalies from '../components/OrderAnomalies.vue'
import CekAbsenJapati from '@/components/CekAbsenJapati.vue';
import CekDoubleJob from '../components/CekDoubleJob.vue';
import CekDoubleAttendance from '../components/CekDoubleAttendance.vue'
import CekExpiredJob from '../components/CekExpiredJob.vue'
import CekEmptyOrderFlow from '../components/CekEmptyOrderFlow.vue'
import KomparasiPayroll from '../components/KomparasiPayroll.vue';
import KomparasiPotonganTrial from '../components/KomparasiPotonganTrial.vue';
import KomparasiPotonganKoperasi from '../components/KomparasiPotonganKoperasi.vue';
import KomparasiMartMeal from '../components/KomparasiMartMeal.vue';
import KomparasiPemantraAttendance from '../components/KomparasiPemantraAttendance.vue';
import KomparasiLembur from '../components/KomparasiLembur.vue';
import KomparasiLemburLibur from '../components/KomparasiLemburLibur.vue';

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
  { path: '/komparasi-payroll', name: 'KomparasiPayroll', component: KomparasiPayroll },
  { path: '/komparasi-potongan-trial', name: 'KomparasiPotonganTrial', component: KomparasiPotonganTrial },
  { path: '/komparasi-potongan-koperasi', name: 'KomparasiPotonganKoperasi', component: KomparasiPotonganKoperasi },
  { path: '/komparasi-mart-meal', name: 'KomparasiMartMeal', component: KomparasiMartMeal },
  { path: '/komparasi-pemantra-attendance', name: 'KomparasiPemantraAttendance', component: KomparasiPemantraAttendance },
  { path: '/komparasi-lembur', name: 'KomparasiLembur', component: KomparasiLembur },
  { path: '/komparasi-lembur-libur', name: 'KomparasiLemburLibur', component: KomparasiLemburLibur },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router