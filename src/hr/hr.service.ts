import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { BadRequestException } from '@nestjs/common';
import { DoubleJobQueryDto } from './dto/double-job.dto';
import { DoubleAttendanceQueryDto } from './dto/double-attendance.dto';
import { EmptyOrderFlowQueryDto } from './dto/empty-orderflow.dto';

export interface LocationCheckData {
  flag_location_label: string;
  flag_location: number;
  ref_id: number;
  employee_name: string;
  distance_km: number;
}

export interface LocationCheckResponse {
  success: boolean;
  data: LocationCheckData[];
  total: number;
  date: string;
  message?: string;
}

@Injectable()
export class HrService {
  constructor(
    @Inject('MYSQL_CONNECTION') private readonly connection: Pool,
  ) {}

  async getOrderAnomalies(start: string, end: string): Promise<any[]> {
    const sql = `
      SELECT
        o.order_id,
        o.order_subtype_id as jenisOrder,
        e.id as emp_id,
        au.code as NIK,
        au.name,
        o.order_desc,
        o.xd1 as waktuOrder,
        o.xd2 as waktuClose,
        o.xn5 as status
      FROM orders o
      JOIN act_users au ON au.user_id = o.create_user_id
      JOIN employee e ON e.code = au.code
      JOIN attendance a ON a.ref_id = e.id AND date(o.xd1) = date(a.start_dtm)
      WHERE o.order_subtype_id IN (2101, 2145)
        AND date(o.xd1) BETWEEN ? AND ?
        AND o.order_status_id = 2
        AND a.type_id = 3
        AND o.xn5 = 2
      GROUP BY
        o.order_id,
        o.order_subtype_id,
        e.id,
        au.code,
        au.name,
        o.order_desc,
        o.xd1,
        o.xd2,
        o.xn5
    `;
    const [rows] = await this.connection.query(sql, [start, end]);
    return (rows as any[]).map((row, idx) => ({
      no: idx + 1,
      orderId: row.order_id,
      jenisOrder: row.jenisOrder,
      empId: row.emp_id,
      NIK: row.NIK,
      name: row.name,
      orderDesc: row.order_desc,
      waktuOrder: row.waktuOrder,
      waktuClose: row.waktuClose,
      status: row.status,
    }));
  }

  async testConnection(): Promise<any> {
    const [rows] = await this.connection.query('SELECT 1 as test');
    return rows;
  }

  async getActiveEmployees(query: SearchEmployeeDto): Promise<any[]> {
    let sql = `
      SELECT
        au.code,
        au.user_id,
        au.password,
        au.email,
        e.id AS employee_id,
        au.name AS nama,
        p.id AS person_id,
        o.name AS Divisi,
        op.title AS Jabatan,
        ohp.position_id AS No_Jabatan,
        ohp.organization_id AS No_Divisi,
        ej.start_date as 'Mulai Menjabat',
        ej.end_date as 'Akhir Menjabat'
      FROM 
        act_users au
      LEFT JOIN employee e ON au.code = e.code
      LEFT JOIN person p ON e.person_id = p.id
      LEFT JOIN emp_jobs ej ON e.id = ej.employee_id
      LEFT JOIN org_has_position ohp ON ej.ohp_id = ohp.id
      LEFT JOIN organization o ON ohp.organization_id = o.id
      LEFT JOIN org_position op ON ohp.position_id = op.id
      WHERE e.status_id = 1
        AND (ej.end_date IS NULL OR ej.end_date >= CURDATE())
    `;
    const params: string[] = [];
    if (query.nama) {
      sql += ' AND au.name LIKE ?';
      params.push(`%${query.nama}%`);
    }
    const [rows] = await this.connection.query(sql, params);
    
    return (rows as any[]).map(row => ({
      code: row.code,
      nama: row.nama,
      email: row.email,
      divisi: row.Divisi,
      jabatan: row.Jabatan,
      mulaiMenjabat: row['Mulai Menjabat'],
      akhirMenjabat: row['Akhir Menjabat'],
    }));
  }

  async checkLocationAttendance(date?: string): Promise<LocationCheckResponse> {
    try {
      const checkDate = date || new Date().toISOString().split('T')[0];
      
      const query = `
        SELECT 
            CASE sub.flag_location
                WHEN 1 THEN 'Onsite'
                WHEN 2 THEN 'Kemah'
                WHEN 3 THEN 'SPJ'
                WHEN 4 THEN 'Kemah Plus'
                ELSE CONCAT('Unknown (', sub.flag_location, ')')
            END AS flag_location_label,
            sub.flag_location,
            sub.ref_id,
            sub.employee_name,
            sub.distance_km
        FROM (
            SELECT
                a.ref_id,
                au.name AS employee_name,
                DATE(a.start_dtm) AS attendance_date,
                a.latitude,
                a.longitude,
                a.flag_location,
                (6371 * ACOS(
                    COS(RADIANS(-6.8980691557873355)) * COS(RADIANS(a.latitude)) *
                    COS(RADIANS(a.longitude) - RADIANS(107.61921645309648)) +
                    SIN(RADIANS(-6.8980691557873355)) * SIN(RADIANS(a.latitude))
                )) AS distance_km
            FROM
                attendance a
            JOIN employee e ON e.id = a.ref_id
            JOIN act_users au ON au.code = e.code
            WHERE
                DATE(a.start_dtm) = ?
                AND e.status_id = 1
        ) AS sub
        WHERE sub.distance_km < 0.1
        ORDER BY sub.attendance_date DESC, sub.employee_name
      `;

      const [rows] = await this.connection.query(query, [checkDate]);
      const result = rows as LocationCheckData[];

      if (!result) {
        throw new BadRequestException('Data tidak ditemukan');
      }

      return {
        success: true,
        data: result || [],
        total: result?.length || 0,
        date: checkDate,
        message: result?.length > 0 
          ? `Ditemukan ${result.length} karyawan yang absen di bawah 100 meter dari kantor Japati`
          : 'Tidak ada data absensi valid di bawah 100 meter dari kantor Japati hari ini.'
      };

    } catch (error) {
      console.error('Error checking location attendance:', error);
      return {
        success: false,
        data: [],
        total: 0,
        date: date || new Date().toISOString().split('T')[0],
        message: 'Terjadi error saat mengecek data lokasi absen: ' + error.message
      };
    }
  }


  formatLocationData(data: LocationCheckData[], page: number = 1, limit: number = 50) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      }
    };
  }

  getLocationStats(data: LocationCheckData[]) {
    const stats = data.reduce((acc, item) => {
      const location = item.flag_location_label;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: data.length,
      byLocation: stats,
      averageDistance: data.length > 0 
        ? (data.reduce((sum, item) => sum + item.distance_km, 0) / data.length).toFixed(3)
        : 0
    };
  }

  async getDoubleJobs(query: DoubleJobQueryDto): Promise<any[]> {
    const sql = `
      SELECT
        au.user_id,
        e.id AS emp_id,
        e.person_id,
        au.name AS Nama,
        GROUP_CONCAT(DISTINCT o.name ORDER BY o.name SEPARATOR ', ') AS Divisi,
        GROUP_CONCAT(DISTINCT op.title ORDER BY op.title SEPARATOR ', ') AS Jabatan,
        COUNT(DISTINCT ej.emp_job_id ) AS jumlah_jabatan_aktif
      FROM
        act_users au
      LEFT JOIN employee e ON
        e.code = au.code
      LEFT JOIN person p ON
        p.id = e.person_id
      LEFT JOIN emp_jobs ej ON
        ej.employee_id = e.id
      LEFT JOIN org_has_position ohp ON
        ohp.id = ej.ohp_id
      LEFT JOIN org_position op ON
        op.id = ohp.position_id
      LEFT JOIN organization o ON
        o.id = ohp.organization_id
      LEFT JOIN emp_job_type ejt ON
        ejt.job_type_id = ej.job_type_id
      WHERE
        e.status_id = 1
        AND (ej.end_date IS NULL OR ej.end_date >= NOW())
        AND ej.job_type_id = 1
      GROUP BY
        e.id,
        au.user_id,
        e.person_id,
        au.name
      HAVING
        COUNT(DISTINCT ej.emp_job_id) > 1
      ORDER BY
        au.name;
    `;
    const [rows] = await this.connection.query(sql);
    return rows as any[];
  }

  async getDoubleAttendance(query: DoubleAttendanceQueryDto): Promise<any[]> {
    const sql = `
      SELECT 
        au.user_id,
        au.name as Nama,
        a.ref_id, 
        DATE(a.start_dtm) AS attendance_date,
        COUNT(*) AS duplicate_count
      FROM attendance a
      LEFT JOIN employee e on e.id = a.ref_id
      LEFT JOIN act_users au on au.code = e.code
      WHERE DATE(a.start_dtm) BETWEEN ? AND ?
        AND a.ref_id NOT IN (471,466)
      GROUP BY a.ref_id, DATE(a.start_dtm)
      HAVING COUNT(*) > 1
      ORDER BY attendance_date desc;
    `;
    const [rows] = await this.connection.query(sql, [query.start, query.end]);
    return rows as any[];
  }

  async getExpiredJobs(): Promise<any[]> {
    const sql = `
      SELECT e.id RefID,
        e.code NIK,
        au.name Nama,
        ej.end_date Berakhir,
        o.name as Divisi,
        op.title as Jabatan
      FROM employee e
      LEFT JOIN act_users au ON au.code = e.code
      LEFT JOIN emp_jobs ej ON ej.employee_id = e.id
      LEFT JOIN org_has_position ohp ON ohp.id = ej.ohp_id
      LEFT JOIN org_position op ON op.id = ohp.position_id
      LEFT JOIN organization o ON o.id = ohp.organization_id
      WHERE e.status_id = 1
        AND ej.end_date IS NOT NULL
        AND DATE(ej.end_date) = DATE_ADD(CURDATE(), INTERVAL 1 DAY);
    `;
    const [rows] = await this.connection.query(sql);
    return rows as any[];
  }

  async getEmptyOrderFlow(query: EmptyOrderFlowQueryDto): Promise<any[]> {
    const sql = `
      SELECT o.order_id,
        o.create_user_id UserID,
        o.customer_desc Nama,
        o.order_type_id Tipe,
        o.create_dtm TanggalBuat,
        o.order_status_id statusOpen
      FROM orders o
      LEFT JOIN order_flow of2 on of2.order_id = o.order_id
      WHERE of2.order_id IS NULL
        AND date(o.create_dtm) BETWEEN ? AND ?
    `;
    const [rows] = await this.connection.query(sql, [query.start, query.end]);
    return rows as any[];
  }

  async getPayrollComparison(period_now: string, period_prev: string) {
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
        AND p.instance_id = 62
      GROUP BY e.id, e.code, au.name, p.period, p.instance_id
      ORDER BY e.id ASC, p.period ASC;
    `;
    const [rows]: any = await this.connection.query(sql, [period_now, period_prev]);
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