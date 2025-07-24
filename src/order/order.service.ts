import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DoubleJobQueryDto } from './dto/double-job.dto';
import { EmptyOrderFlowQueryDto } from './dto/empty-orderflow.dto';

@Injectable()
export class OrderService {
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
}
