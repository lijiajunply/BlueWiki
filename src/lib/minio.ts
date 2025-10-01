import * as Minio from 'minio';

// MinIO 配置
const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
};

// 创建 MinIO 客户端实例
export const minioClient = new Minio.Client(minioConfig);

// 存储桶名称
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'blue-wiki-files';

// 确保存储桶存在
export async function ensureBucketExists(): Promise<void> {
  const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
  if (!bucketExists) {
    await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
  }
}