import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const dbPath = process.env.DB_STORAGE || path.join(__dirname, '../fdrflow.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
  console.log(`📁 Connected to SQLite database at: ${dbPath}`);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'fdrflow',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
  console.log(`🐬 Connected to MySQL database on ${process.env.DB_HOST || 'localhost'}`);
}

export default sequelize;
