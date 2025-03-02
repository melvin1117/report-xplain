import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Client;  // Use this consistently

  constructor() {
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'minio',
      port: parseInt(process.env.MINIO_PORT, 10) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    });

    console.log('Minio client initialized:', this.minioClient); // Debugging
  }

  async getFileStream(bucketName: string, fileName: string): Promise<NodeJS.ReadableStream> {
    try {
      console.log(`Fetching file: ${fileName} from bucket: ${bucketName}`); // Debugging
      return await this.minioClient.getObject(bucketName, fileName);
    } catch (error) {
      console.error('Error fetching file stream from Minio:', error);
      throw new InternalServerErrorException('Error retrieving file from storage');
    }
  }

  getClient(): Client {
    return this.minioClient;
  }

  async createBucketIfNotExists(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName, '');
    }
  }
}
