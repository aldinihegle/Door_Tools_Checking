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
}