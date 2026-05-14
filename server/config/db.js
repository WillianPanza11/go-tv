// server/config/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// paso 2. Equivalente al DataSource de Spring Boot
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Equivalente al ddl-auto=update de Spring Boot
const initDB = async () => {
  try {

    // ─── Tabla: categories ───────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id         SERIAL PRIMARY KEY,
        nombre     VARCHAR(100) NOT NULL,
        color      VARCHAR(7)   NOT NULL DEFAULT '#3B82F6',
        created_at TIMESTAMP             DEFAULT NOW()
      );
    `);

    // ─── Tabla: videos ───────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id           SERIAL PRIMARY KEY,
        titulo       VARCHAR(255) NOT NULL,
        descripcion  TEXT,
        filename     VARCHAR(255) NOT NULL,
        categoria_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at   TIMESTAMP DEFAULT NOW()
      );
    `);

    // ─── Tabla: watched ──────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watched (
        session_id VARCHAR(100) NOT NULL,
        video_id   INTEGER      NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        watched_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (session_id, video_id)
      );
    `);

    // ─── Tabla: comments ─────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id         SERIAL PRIMARY KEY,
        video_id   INTEGER      NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
        autor      VARCHAR(100) NOT NULL,
        texto      TEXT         NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // ─── Tabla: documents ─────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id          SERIAL PRIMARY KEY,
        nombre      VARCHAR(255) NOT NULL,
        descripcion TEXT,
        mimetype    VARCHAR(100) NOT NULL,
        size        INTEGER      NOT NULL,
        data        BYTEA        NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // ─── Tabla: apks ──────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS apks (
        id          SERIAL PRIMARY KEY,
        nombre      VARCHAR(255) NOT NULL,
        descripcion TEXT,
        size        INTEGER      NOT NULL,
        data        BYTEA        NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tablas verificadas/creadas correctamente');

  } catch (err) {
    console.error('❌ Error creando tablas:', err.message);
    process.exit(1); // Detiene el servidor si algo falla
  }
};

// paso 3. Verificar conexión al iniciar — igual que cuando Spring Boot arranca
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
    console.error('   Verifica tu .env y que PostgreSQL esté corriendo');
    process.exit(1);
  }
  console.log('✅ Conectado a PostgreSQL correctamente');
  release();
  await initDB(); //paso 4. Crea las tablas
});

export default pool;