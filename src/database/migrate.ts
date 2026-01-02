import { readFileSync } from 'fs';
import { join } from 'path'
import { pool } from './db';

async function migrate() {
    try {
        // Baca file schema.sql
        const schemaPath = join(process.cwd(), './src/database/schema.sql');
        const schema = readFileSync(schemaPath, 'utf-8');

        // Execute schema
        await pool.query(schema);

        console.log('Migration Successful!');

        // Close Connection setelah selesai
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Migration Faied:', error);
        await pool.end();
        process.exit(1);
    }
}

migrate();