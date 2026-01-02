import { Pool } from 'pg';

export const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'crud_app',
    user: 'postgres',
    password: 'Hyura_01'
});

// Test Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database error connection:', err);
    } else {
        console.log('Database connected:', res.rows[0])
    }
})