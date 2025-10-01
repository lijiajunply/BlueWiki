import { prisma } from '@/lib/prisma';
import { Setting, Prisma } from '@prisma/client';

export class SettingRepo {
  /**
   * 获取系统设置（只会有一个设置记录）
   * @returns 系统设置或null
   */
  async get(): Promise<Setting | null> {
    const settings = await prisma.setting.findMany({
      take: 1,
    });
    
    return settings.length > 0 ? settings[0] : null;
  }

  /**
   * 创建或更新系统设置
   * @param data 设置数据
   * @returns 更新后的设置
   */
  async upsert(data: Prisma.SettingCreateInput): Promise<Setting> {
    const existingSetting = await this.get();
    
    if (existingSetting) {
      return prisma.setting.update({
        where: { id: existingSetting.id },
        data: data as Prisma.SettingUpdateInput,
      });
    } else {
      return prisma.setting.create({
        data,
      });
    }
  }

  /**
   * 更新系统设置
   * @param data 更新数据
   * @returns 更新后的设置
   */
  async update(data: Prisma.SettingUpdateInput): Promise<Setting> {
    const existingSetting = await this.get();
    
    if (!existingSetting) {
      throw new Error('No existing setting found to update');
    }
    
    return prisma.setting.update({
      where: { id: existingSetting.id },
      data,
    });
  }
}