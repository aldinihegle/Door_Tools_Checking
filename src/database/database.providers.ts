import { createPool } from 'mysql2/promise';

export const databaseProviders = [
  {
    provide: 'MYSQL_CONNECTION',
    useFactory: async () => {
      return await createPool({
        host: '139.99.53.185',
        port: 3306,
        user: 'naf_u295',
        password: 'hVFZXkAMudFDrDI',
        database: 'naf_u295',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    },
  },
];