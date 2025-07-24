import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';

@Injectable()
export class PayrollService {
  constructor(
    @Inject('MYSQL_CONNECTION') private readonly connection: Pool,
  ) {}

  async getPayrollComparison(period_now: string, period_prev: string, instance_id: string) {
    const sql = `
      SELECT 
        e.id,
        e.code,
        au.name,
        p.period,
        p.instance_id,
        SUM(pd.amount) as total_gaji
      FROM
        payroll_detail pd
      JOIN payroll p ON p.payroll_id = pd.payroll_id
      JOIN payroll_component pc ON pc.component_id = pd.component_id
      JOIN employee e ON e.id = p.ref_id
      JOIN act_users au ON au.code = e.code
      WHERE
        (p.period = ? OR p.period = ?)
        AND pc.component_parent_id = 25
        AND p.instance_id = ?
      GROUP BY e.id, e.code, au.name, p.period, p.instance_id
      ORDER BY e.id ASC, p.period ASC;
    `;
    const [rows]: any = await this.connection.query(sql, [period_now, period_prev, instance_id]);
    // Proses data: group by karyawan dan bandingkan total_gaji period_now vs period_prev
    const grouped = {};
    for (const row of rows) {
      const key = `${row.id}`;
      if (!grouped[key]) {
        grouped[key] = {
          id: row.id,
          code: row.code,
          name: row.name,
          instance_id: row.instance_id,
          total_gaji_now: null,
          total_gaji_prev: null,
        };
      }
      if (row.period === period_now) grouped[key].total_gaji_now = row.total_gaji;
      if (row.period === period_prev) grouped[key].total_gaji_prev = row.total_gaji;
    }
    // Hitung selisih
    const result = Object.values(grouped).map((item: any) => ({
      ...item,
      diff: (item.total_gaji_now ?? 0) - (item.total_gaji_prev ?? 0),
    }));
    return result;
  }

  async getPayrollInstances() {
    const sql = `
      SELECT instance_id, name, instance_status, description, start_date, end_date
      FROM payroll_instances
      ORDER BY start_date DESC
    `;
    const [rows]: any = await this.connection.query(sql);
    return rows;
  }

  async getPayrollPeriods() {
    const sql = `
      SELECT DISTINCT period
      FROM payroll
      WHERE instance_id = 62
      ORDER BY period DESC
    `;
    const [rows]: any = await this.connection.query(sql);
    return rows.map((row: any) => row.period);
  }

  async getTrialDeductionComparison(period_now: string, period_prev: string) {
    const sql = `
      SELECT
        e.code,
        au.name,
        p.period,
        pd.amount
      FROM
        payroll_detail pd
      JOIN payroll p ON p.payroll_id = pd.payroll_id
      JOIN employee e ON e.id = p.ref_id
      JOIN act_users au ON au.code = e.code
      WHERE
        (p.period = ? OR p.period = ?)
        AND pd.component_id = 74
        AND p.instance_id = 62
      ORDER BY au.name ASC, p.period ASC
    `;
    const [rows]: any = await this.connection.query(sql, [period_now, period_prev]);
    // Group by code, compare amount for both periods
    const grouped = {};
    for (const row of rows) {
      const key = row.code;
      if (!grouped[key]) {
        grouped[key] = {
          code: row.code,
          name: row.name,
          amount_now: null,
          amount_prev: null,
        };
      }
      if (row.period === period_now) grouped[key].amount_now = row.amount;
      if (row.period === period_prev) grouped[key].amount_prev = row.amount;
    }
    // Calculate diff
    const result = Object.values(grouped).map((item: any) => ({
      ...item,
      diff: (item.amount_now ?? 0) - (item.amount_prev ?? 0),
    }));
    return result;
  }

  async getKoperasiDeductionComparison(period_now: string, period_prev: string) {
    const sql = `
      SELECT
        e.code,
        au.name,
        p.period,
        pd.amount
      FROM
        payroll_detail pd
      JOIN payroll p ON p.payroll_id = pd.payroll_id
      JOIN employee e ON e.id = p.ref_id
      JOIN act_users au ON au.code = e.code
      WHERE
        (p.period = ? OR p.period = ?)
        AND pd.component_id = 31
        AND p.instance_id = 62
      ORDER BY au.name ASC, p.period ASC
    `;
    const [rows]: any = await this.connection.query(sql, [period_now, period_prev]);
    // Group by code, compare amount for both periods
    const grouped = {};
    for (const row of rows) {
      const key = row.code;
      if (!grouped[key]) {
        grouped[key] = {
          code: row.code,
          name: row.name,
          amount_now: null,
          amount_prev: null,
        };
      }
      if (row.period === period_now) grouped[key].amount_now = row.amount;
      if (row.period === period_prev) grouped[key].amount_prev = row.amount;
    }
    // Calculate diff
    const result = Object.values(grouped).map((item: any) => ({
      ...item,
      diff: (item.amount_now ?? 0) - (item.amount_prev ?? 0),
    }));
    return result;
  }

  async getMartMealComparison(period: string) {
    const sql = `
      SELECT
        au.name,
        e.code,
        ma.meal_amount as mart,
        pd.amount as payroll,
        p.period
      FROM
        payroll p
      JOIN payroll_detail pd ON p.payroll_id = pd.payroll_id
      JOIN payroll_component pc ON pd.component_id = pc.component_id
      JOIN mart_attendance ma ON p.ref_id = ma.emp_id and ma.period = p.period
      JOIN employee e ON p.ref_id = e.id
      JOIN act_users au ON e.code = au.code
      WHERE
        p.period = ?
        AND pd.component_id = 34
        AND p.instance_id = 62
      ORDER BY au.name ASC
    `;
    const [rows]: any = await this.connection.query(sql, [period]);
    return rows;
  }

  async getPemantraAttendanceComparison(period: string) {
    const sql = `
      SELECT
        au.name,
        e.code,
        ma.amount_attendance as mart_pemantra,
        pd.amount as payroll,
        p.period
      FROM
        payroll p
      JOIN payroll_detail pd ON p.payroll_id = pd.payroll_id
      JOIN payroll_component pc ON pd.component_id = pc.component_id
      JOIN mart_attendance ma ON p.ref_id = ma.emp_id and ma.period = p.period
      JOIN employee e ON p.ref_id = e.id
      JOIN act_users au ON e.code = au.code
      WHERE
        p.period = ?
        AND pd.component_id = 38
        AND p.instance_id = 62
      ORDER BY au.name ASC
    `;
    const [rows]: any = await this.connection.query(sql, [period]);
    return rows;
  }

  // Lembur Hari Kerja
  async getOvertimeComparison(period: string) {
    const sql = `
      SELECT
        au.name,
        e.code,
        (mo.amount_reguler+mo.amount_late) AS mart,
        pd.amount as payroll,
        p.period
      FROM
        payroll p
      JOIN payroll_detail pd ON p.payroll_id = pd.payroll_id
      JOIN payroll_component pc ON pd.component_id = pc.component_id
      JOIN mart_overtime mo ON p.ref_id = mo.emp_id and mo.period = p.period 
      JOIN employee e ON p.ref_id = e.id
      JOIN act_users au ON e.code = au.code
      WHERE
        p.period = ?
        AND pd.component_id = 36
        AND p.instance_id = 62
      ORDER BY au.name ASC
    `;
    const [rows]: any = await this.connection.query(sql, [period]);
    return rows;
  }

  // Lembur Hari Libur
  async getHolidayOvertimeComparison(period: string) {
    const sql = `
      SELECT
        au.name,
        e.code,
        mo.amount_holiday AS mart,
        pd.amount as payroll,
        p.period
      FROM
        payroll p
      JOIN payroll_detail pd ON p.payroll_id = pd.payroll_id
      JOIN payroll_component pc ON pd.component_id = pc.component_id
      JOIN mart_overtime mo ON p.ref_id = mo.emp_id and mo.period = p.period 
      JOIN employee e ON p.ref_id = e.id
      JOIN act_users au ON e.code = au.code
      WHERE
        p.period = ?
        AND pd.component_id = 37
        AND p.instance_id = 62
      ORDER BY au.name ASC
    `;
    const [rows]: any = await this.connection.query(sql, [period]);
    return rows;
  }
}
