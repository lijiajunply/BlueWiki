declare module '@/lib/minio' {
  import * as Minio from 'minio';
  
  export const minioClient: Minio.Client;
  export const BUCKET_NAME: string;
  export function ensureBucketExists(): Promise<void>;
}