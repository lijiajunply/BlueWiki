import { UserPayload } from "@/lib/auth";

// 简化的authOptions，用于保持与next-auth的兼容性
export const authOptions = {
  // 这里可以添加实际的next-auth配置
  // 目前我们主要使用自定义的JWT+Cookie+Redis认证系统
};

// 用于类型检查的用户类型
export interface SessionUser extends UserPayload {
  id: string;
  name?: string;
  email?: string;
}