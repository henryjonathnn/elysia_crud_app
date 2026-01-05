import { existsSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import { join } from 'path';


interface UploadResult {
    success: boolean;
    path?: string;
    error?: string;
}

export async function uploadImage(image: File): Promise<UploadResult> {
    try {
        // Validate image type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(image.type)) {
            return {
                success: false,
                error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
            };
        }

        // Validate image size (max 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024;
        if (image.size > maxSizeInBytes) {
            return {
                success: false,
                error: 'File size too large. Maximum 5MB.'
            }
        }

        // Geneate a unique file name
        const timestamp = Date.now();
        const sanitizedName = image.name.replace(/\s/g, '-');
        const fileName = `${timestamp}-${sanitizedName}`;
        const uploadPath = join(process.cwd(), 'public', 'uploads', fileName);

        // Save file
        const buffer = await image.arrayBuffer();
        await writeFile(uploadPath, Buffer.from(buffer));

        return {
            success: true,
            path: `/uploads/${fileName}`
        }
    } catch (error) {
        return {
            success: false,
            error: (error as Error).message
        }
    }
}

export async function deleteImage(imagePath: string): Promise<boolean> {
    try {
        if (!imagePath) return false;
        
        const fullPath = join(process.cwd(), 'public', imagePath);

        if (existsSync(fullPath)) {
            await unlink(fullPath);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}

export function getImageUrl(imagePath: string | null, baseUrl: string = 'http://localhost:2500'): string | null {
    return imagePath ? `${baseUrl}${imagePath}` : null
}

export function hasImageFile(image: any): boolean {
    return image && image instanceof File && image.size > 0;
}