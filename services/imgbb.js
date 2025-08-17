import axios from 'axios';
import { ErrorHandler } from '../utils/index.js';

class ImgBBService {
    constructor() {
        this.apiKey = process.env.IMGBB_API_KEY;
        this.baseUrl = 'https://api.imgbb.com/1/upload';

        if (!this.apiKey) {
            throw new Error('IMGBB_API_KEY environment variable is required');
        }
    }

    /**
     * Upload a single image to ImgBB
     * @param {Buffer} imageBuffer - Image buffer from multer
     * @param {string} filename - Original filename
     * @returns {Promise<Object>} ImgBB response data
     */
    async uploadImage(imageBuffer, filename) {
        try {
            // Convert buffer to base64
            const base64Image = imageBuffer.toString('base64');

            const formData = new FormData();
            formData.append('image', base64Image);
            formData.append('key', this.apiKey);
            formData.append('name', filename);

            const response = await axios.post(this.baseUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                };
            } else {
                throw new ErrorHandler('Failed to upload image to ImgBB', 500);
            }
        } catch (error) {
            if (error instanceof ErrorHandler) {
                throw error;
            }
            throw new ErrorHandler(`Image upload failed: ${error.message}`, 500);
        }
    }

    /**
     * Upload multiple images to ImgBB
     * @param {Array} files - Array of files from multer
     * @returns {Promise<Array>} Array of uploaded image data
     */
    async uploadMultipleImages(files) {
        try {
            const uploadPromises = files.map((file) =>
                this.uploadImage(file.buffer, file.originalname)
            );

            const results = await Promise.all(uploadPromises);

            // Extract only the successful uploads
            const successfulUploads = results
                .filter((result) => result.success)
                .map((result) => ({
                    url: result.data.url,
                    display_url: result.data.display_url,
                    thumb_url: result.data.thumb.url,
                    medium_url: result.data.medium.url,
                    delete_url: result.data.delete_url,
                    filename: result.data.image.filename,
                    size: result.data.size,
                    width: result.data.width,
                    height: result.data.height,
                }));

            return {
                success: true,
                data: successfulUploads,
            };
        } catch (error) {
            throw new ErrorHandler(
                `Multiple image upload failed: ${error.message}`,
                500
            );
        }
    }
}

export default ImgBBService;
