import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { DoubleAttendanceQueryDto } from './dto/double-attendance.dto';

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
export class AttdService {
  constructor(
    @Inject('MYSQL_CONNECTION') private readonly connection: Pool,
  ) {}

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
}
