<template>
  <div class="dashboard">
    <div class="dashboard-grid">
      <div
        v-for="item in menuItems"
        :key="item.label"
        class="dashboard-item"
        @click="goTo(item.route)"
      >
        <component :is="item.icon" class="dashboard-icon" />
        <div class="dashboard-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Users, ListChecks, FileWarning, CalendarCheck, BarChart2, FileBarChart, BadgePercent, AlarmClock, ClipboardList, RefreshCw, UserPlus } from 'lucide-vue-next';

export default {
  name: "DashboardMenu",
  data() {
    return {
      menuItems: [
        { label: "Order Anomalies", icon: FileWarning, route: "/order-anomalies" },
        { label: "Cek Absen Japati", icon: CalendarCheck, route: "/cek-absen-japati" },
        { label: "Active Employees", icon: Users, route: "/active-employees" },
        { label: "Cek Double Job", icon: UserPlus, route: "/double-jobs" },
        { label: "Cek Double Attendance", icon: ListChecks, route: "/double-attendance" },
        { label: "Cek Expired Job", icon: AlarmClock, route: "/expired-jobs" },
        { label: "Cek Empty Order Flow", icon: RefreshCw, route: "/empty-orderflow" },
        { label: "Komparasi Payroll", icon: BarChart2, route: "/komparasi-payroll" },
        { label: "Komparasi Potongan Trial", icon: BadgePercent, route: "/komparasi-potongan-trial" },
        { label: "Komparasi Potongan Koperasi", icon: BadgePercent, route: "/komparasi-potongan-koperasi" },
        { label: "Komparasi Mart Meal", icon: FileBarChart, route: "/komparasi-mart-meal" },
        { label: "Komparasi Pemantra Attendance", icon: FileBarChart, route: "/komparasi-pemantra-attendance" },
        { label: "Komparasi Lembur", icon: ClipboardList, route: "/komparasi-lembur" },
        { label: "Komparasi Lembur Libur", icon: ClipboardList, route: "/komparasi-lembur-libur" },
      ]
    };
  },
  methods: {
    goTo(route) {
      this.$router.push(route);
    }
  }
};
</script>

<style scoped>
.dashboard {
  text-align: center;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 24px;
  margin-top: 32px;
}
.dashboard-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 24px 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.dashboard-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.dashboard-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: #007bff;
}
.dashboard-label {
  font-size: 15px;
  color: #333;
}
</style>
