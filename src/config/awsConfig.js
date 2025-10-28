import AWS from 'aws-sdk';
import dotenv from 'dotenv';
dotenv.config();

const s3 = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/**
 * Upload file to S3 with dynamic folder path
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} mimetype - File MIME type
 * @param {string} folder - Folder path (e.g., 'blogs', 'users', 'products')
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
export const uploadToS3 = async (
  fileBuffer,
  fileName,
  mimetype,
  folder = 'general'
) => {
  // Sanitize folder name and fileName
  const sanitizedFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '');
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, '');

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${sanitizedFolder}/${Date.now()}-${sanitizedFileName}`,
    Body: fileBuffer,
    ContentType: mimetype,
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    return result.Location; // Returns the public URL
  } catch (err) {
    throw new Error(`S3 Upload Failed: ${err.message}`);
  }
};

/**
 * Delete file from S3
 * @param {string} fileUrl - The full S3 URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1)); // Remove leading slash

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
    return true;
  } catch (err) {
    throw new Error(`S3 Delete Failed: ${err.message}`);
  }
};

/**
 * Extract S3 key from URL (utility function)
 * @param {string} fileUrl - S3 file URL
 * @returns {string} - S3 key
 */
export const getS3KeyFromUrl = (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    return decodeURIComponent(url.pathname.substring(1));
  } catch (err) {
    // If it's not a full URL, return as is (might already be a key)
    return fileUrl;
  }
};

export default s3;
