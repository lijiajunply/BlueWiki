// lib/auth.ts
import jwt from 'jsonwebtoken';
import { getRedisClient } from './redis';
import bcrypt from 'bcryptjs';
import { UserRepo } from '@/repos/UserRepo';
import {User} from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export interface UserPayload {
    userId: string;
    userHash: string;
    role?: string;
}

export class AuthService {
    // 生成 JWT Token
    static generateToken(payload: UserPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    }

    // 验证 JWT Token
    static verifyToken(token: string): UserPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as UserPayload;
        } catch {
            return null;
        }
    }

    // 存储 Token 到 Redis
    static async storeToken(userId: string, token: string): Promise<void> {
        const redis = await getRedisClient();
        // 存储 7 天
        await redis.setEx(`token:${userId}`, 7 * 24 * 60 * 60, token);
    }

    // 验证 Token 是否有效（检查 Redis）
    static async validateToken(userId: string, token: string): Promise<boolean> {
        const redis = await getRedisClient();
        const storedToken = await redis.get(`token:${userId}`);
        return storedToken === token;
    }

    // 注销 Token
    static async revokeToken(userId: string): Promise<void> {
        const redis = await getRedisClient();
        await redis.del(`token:${userId}`);
    }

    // 获取用户信息
    static async getUserFromToken(token: string): Promise<UserPayload | null> {
        const payload = this.verifyToken(token);
        if (!payload) return null;

        const isValid = await this.validateToken(payload.userId, token);
        return isValid ? payload : null;
    }

    // 根据用户ID获取完整用户信息
    static async getUserById(userId: string): Promise<never | null> {
        try {
            const userRepo = new UserRepo();
            const user = await userRepo.findById(parseInt(userId));
            if (!user) return null;
            
            // 移除密码字段
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error('获取用户信息失败:', error);
            return null;
        }
    }

    // 对密码进行加盐哈希
    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, SALT_ROUNDS);
    }

    // 验证密码
    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }
}