import { prisma } from '@/lib/prisma';
import { User, Prisma } from '@prisma/client';
import { AuthService } from '@/lib/auth';

export class UserRepo {
  /**
   * 创建用户
   * @param data 用户数据
   * @returns 创建的用户
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    // 如果提供了密码，则对其进行哈希处理
    if ('password' in data && data.password) {
      data.password = await AuthService.hashPassword(data.password as string);
    }
    
    return prisma.user.create({
        data,
    });
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户信息或null
   */
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
        where: {id},
    });
  }

  /**
   * 根据邮箱获取用户
   * @param email 用户邮箱
   * @returns 用户信息或null
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: {email},
    });
  }

  /**
   * 根据手机号获取用户
   * @param phone 用户手机号
   * @returns 用户信息或null
   */
  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
        where: {phone},
    });
  }

  /**
   * 获取用户列表
   * @param params 查询参数
   * @returns 用户列表
   */
  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    where?: Prisma.UserWhereInput;
  }): Promise<{ users: User[]; total: number }> {
    const { skip, take, orderBy, where } = params;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        orderBy,
        where,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * 更新用户
   * @param id 用户ID
   * @param data 更新数据
   * @returns 更新后的用户
   */
  async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    // 如果提供了密码，则对其进行哈希处理
    if ('password' in data && data.password) {
      data.password = await AuthService.hashPassword(data.password as string);
    }
    
    return prisma.user.update({
        where: {id},
        data,
    });
  }

  /**
   * 删除用户
   * @param id 用户ID
   * @returns 删除的用户
   */
  async delete(id: number): Promise<User> {
    return prisma.user.delete({
        where: {id},
    });
  }

  /**
   * 验证用户凭据
   * @param email 用户邮箱
   * @param password 密码
   * @returns 用户信息或null
   */
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 使用 bcrypt 比较密码
    if (user && await AuthService.verifyPassword(password, user.password)) {
      return user;
    }

    return null;
  }
}