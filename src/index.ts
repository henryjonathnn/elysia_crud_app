import { Elysia } from "elysia";
import { pool } from "./database/db";

const app = new Elysia()
  .get('/', () => 'Elysia CRUD API')

  // Create Account
  .post('/accounts', async ({ body }) => {
    try {
      const { game_name, username, level, price, description } = body as any

      const result = await pool.query(
        'INSERT INTO game_accounts (game_name, username, level, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [game_name, username, level, price, description]
      );

      return {
        success: true,
        data: result.rows[0]
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  })

  // Read All Accounts
  .get('/accounts', async () => {
    try {
      const result = await pool.query('SELECT * FROM game_accounts ORDER BY created_at DESC');

      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  })

  // Read Single Account
  .get('/accounts/:id', async ({ params: { id } }) => {
    try {
      const result = await pool.query('SELECT * FROM game_accounts WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Account not found'
        };
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  })

  // Update Account
  .put('/accounts/:id', async ({ params: { id }, body }) => {
    try {
      const { game_name, username, level, price, description } = body as any;

      const result = await pool.query(
        'UPDATE game_accounts SET game_name = $1, username = $2, level = $3, price = $4, description = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
        [game_name, username, level, price, description, id]
      )

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Account not found'
        };
      }

      return {
        success: true,
        data: result.rows[0]
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  })

  // Delete Account
  .delete('/accounts/:id', async ({ params: { id } }) => {
    try {
      const result = await pool.query('DELETE FROM game_accounts WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Account not found'
        }
      }

      return {
        success: true,
        message: 'Account deleted successfully',
        data: result.rows[0]
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  })
  .listen(2500);

console.log(`Server running on ${app.server?.hostname} : ${app.server?.port}`);