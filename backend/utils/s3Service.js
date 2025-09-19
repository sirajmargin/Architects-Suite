// AWS S3 Service for file storage and management
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('./logger');

class S3Service {
    constructor() {
        this.isEnabled = process.env.FEATURE_S3_STORAGE_ENABLED === 'true' && 
                         process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY;
        
        if (this.isEnabled) {
            this.s3Client = new S3Client({
                region: process.env.AWS_REGION || 'us-west-2',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                }
            });
            
            this.buckets = {
                diagrams: process.env.AWS_S3_BUCKET || 'it-architects-suite-diagrams',
                presentations: process.env.AWS_S3_PPT_BUCKET || 'it-architects-suite-presentations'
            };
            
            this.cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;
            
            logger.info('S3 Service initialized successfully');
        } else {
            logger.warn('S3 Service disabled - missing configuration or feature flag');
        }
    }

    /**
     * Upload diagram file to S3
     */
    async uploadDiagram(fileBuffer, fileName, contentType, metadata = {}) {
        if (!this.isEnabled) {
            throw new Error('S3 service is not enabled');
        }

        try {
            const key = `diagrams/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;
            
            const command = new PutObjectCommand({
                Bucket: this.buckets.diagrams,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
                Metadata: {
                    uploadedAt: new Date().toISOString(),
                    source: 'it-architects-suite',
                    ...metadata
                },
                ServerSideEncryption: 'AES256'
            });

            const result = await this.s3Client.send(command);
            
            const fileUrl = this.cloudFrontUrl 
                ? `${this.cloudFrontUrl}/${key}`
                : `https://${this.buckets.diagrams}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            logger.info(`Diagram uploaded to S3: ${key}`);
            
            return {
                success: true,
                key,
                url: fileUrl,
                etag: result.ETag,
                bucket: this.buckets.diagrams
            };
        } catch (error) {
            logger.error('Error uploading diagram to S3:', error);
            throw error;
        }
    }

    /**
     * Upload PowerPoint presentation to S3
     */
    async uploadPresentation(fileBuffer, fileName, metadata = {}) {
        if (!this.isEnabled) {
            throw new Error('S3 service is not enabled');
        }

        try {
            const key = `presentations/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`;
            
            const command = new PutObjectCommand({
                Bucket: this.buckets.presentations,
                Key: key,
                Body: fileBuffer,
                ContentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                Metadata: {
                    uploadedAt: new Date().toISOString(),
                    source: 'it-architects-suite',
                    ...metadata
                },
                ServerSideEncryption: 'AES256'
            });

            const result = await this.s3Client.send(command);
            
            const fileUrl = this.cloudFrontUrl 
                ? `${this.cloudFrontUrl}/${key}`
                : `https://${this.buckets.presentations}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

            logger.info(`Presentation uploaded to S3: ${key}`);
            
            return {
                success: true,
                key,
                url: fileUrl,
                etag: result.ETag,
                bucket: this.buckets.presentations
            };
        } catch (error) {
            logger.error('Error uploading presentation to S3:', error);
            throw error;
        }
    }

    /**
     * Generate pre-signed URL for secure file access
     */
    async getPresignedUrl(bucket, key, expiresIn = 3600) {
        if (!this.isEnabled) {
            throw new Error('S3 service is not enabled');
        }

        try {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const url = await getSignedUrl(this.s3Client, command, { expiresIn });
            
            logger.info(`Generated pre-signed URL for ${key}`);
            
            return url;
        } catch (error) {
            logger.error('Error generating pre-signed URL:', error);
            throw error;
        }
    }

    /**
     * Delete file from S3
     */
    async deleteFile(bucket, key) {
        if (!this.isEnabled) {
            throw new Error('S3 service is not enabled');
        }

        try {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            await this.s3Client.send(command);
            
            logger.info(`File deleted from S3: ${key}`);
            
            return { success: true };
        } catch (error) {
            logger.error('Error deleting file from S3:', error);
            throw error;
        }
    }

    /**
     * Upload SVG diagram with cloud-native icons
     */
    async uploadSVGDiagram(svgContent, architectureName, metadata = {}) {
        if (!this.isEnabled) {
            return { success: false, reason: 'S3 not enabled' };
        }

        try {
            const fileName = `${architectureName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.svg`;
            const svgBuffer = Buffer.from(svgContent, 'utf8');
            
            const result = await this.uploadDiagram(svgBuffer, fileName, 'image/svg+xml', {
                architectureName,
                type: 'cloud-native-svg',
                generatedAt: new Date().toISOString(),
                ...metadata
            });
            
            return result;
        } catch (error) {
            logger.error('Error uploading SVG diagram:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Upload draw.io XML file
     */
    async uploadDrawioXML(xmlContent, architectureName, metadata = {}) {
        if (!this.isEnabled) {
            return { success: false, reason: 'S3 not enabled' };
        }

        try {
            const fileName = `${architectureName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.drawio`;
            const xmlBuffer = Buffer.from(xmlContent, 'utf8');
            
            const result = await this.uploadDiagram(xmlBuffer, fileName, 'application/xml', {
                architectureName,
                type: 'drawio-xml',
                generatedAt: new Date().toISOString(),
                ...metadata
            });
            
            return result;
        } catch (error) {
            logger.error('Error uploading draw.io XML:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if S3 service is available and configured
     */
    isAvailable() {
        return this.isEnabled;
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            buckets: this.isEnabled ? this.buckets : null,
            cloudFrontEnabled: !!this.cloudFrontUrl,
            region: process.env.AWS_REGION || 'us-west-2'
        };
    }
}

module.exports = new S3Service();