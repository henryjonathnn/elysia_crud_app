import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { pool } from "./database/db";
import staticPlugin from "@elysiajs/static";
import { deleteImage, hasImageFile, uploadImage } from "./utils/imageHandler";
import { formatMultipleResponse, formatResponse } from "./utils/helpers";

const app = new Elysia()

  .use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }))

  .use(staticPlugin({
    assets: 'public',
    prefix: '/'
  }))

  .get('/', () => 'Elysia CRUD API')

  // Create Account
  .post('/accounts', async ({ body }) => {
    try {
      const { game_name, username, level, price, description, image } = body as any

      let imagePath = null;

      // Handle image upload
      if (image && image instanceof File) {
        const uploadResult = await uploadImage(image);

        if (!uploadResult.success) {
          return {
            success: false,
            error: uploadResult.error
          }
        }

        imagePath = uploadResult.path;
      }

      const result = await pool.query(
        'INSERT INTO game_accounts (game_name, username, level, price, description, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [game_name, username, level, price, description, imagePath]
      );

      return {
        success: true,
        data: formatResponse(result.rows[0])
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
        data: formatMultipleResponse(result.rows)
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
        data: formatResponse(result.rows[0])
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
      const { game_name, username, level, price, description, image } = body as any;

      const oldData = await pool.query('SELECT * FROM game_accounts WHERE id = $1', [id])

      if (oldData.rows.length === 0) {
        return {
          success: false,
          error: 'Account not found'
        }
      }

      let imagePath = oldData.rows[0].image; // Keep old image path by default

      // Handle new image upload
      if (hasImageFile(image)) {
        const uploadResult = await uploadImage(image);

        if (!uploadResult.success) {
          return {
            success: false,
            error: uploadResult.error
          }
        }

        // Delete old image if exists
        if (oldData.rows[0].image) {
          await deleteImage(oldData.rows[0].image)
        }

        imagePath = uploadResult.path;
      }

      const result = await pool.query(
        'UPDATE game_accounts SET game_name = $1, username = $2, level = $3, price = $4, description = $5, image = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
        [game_name, username, level, price, description, imagePath, id]
      )

      return {
        success: true,
        data: formatResponse(result.rows[0])
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

      const data = result.rows[0];

      // Delete associated image if exists
      if (data.image) {
        await deleteImage(data.image);
      }

      return {
        success: true,
        message: 'Account deleted successfully',
        data: formatResponse(data)
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