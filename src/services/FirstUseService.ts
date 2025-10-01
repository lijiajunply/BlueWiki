import { ArticleRepo } from '@/repos/ArticleRepo';
import { TagRepo } from '@/repos/TagRepo';
import { SettingRepo } from '@/repos/SettingRepo';

export class FirstUseService {
  async seedInitialData(adminUserId: number) {
    const settingRepo = new SettingRepo();
    const articleRepo = new ArticleRepo();
    const tagRepo = new TagRepo();

    // Only seed when there's no existing setting (safety)
    const existingSetting = await settingRepo.get();
    if (existingSetting) return;

    // Create a default set of tags
    const defaultTags = ['getting-started', 'announcements', 'guides'];
    for (const t of defaultTags) {
      try {
        await tagRepo.create({ name: t });
      } catch {
        // ignore tag create errors
      }
    }

    // Create a home article/page
    try {
      await articleRepo.create({
        title: '欢迎使用 Blue Wiki',
        path: '/',
        content: '# 欢迎\\n\\n这是一个基于 Blue Wiki 的示例首页。',
        author: { connect: { id: adminUserId } },
      });
    } catch {
      // ignore
    }

    try {
      await articleRepo.create({
        title: '开始使用',
        path: '/getting-started',
        content: '# 开始使用\\n\\n这里有一些入门指南。',
        author: { connect: { id: adminUserId } },
      });
    } catch {
      // ignore
    }

    // Create a basic setting record so next-use detection knows initialization done
    try {
      await settingRepo.upsert({
        smtpServer: '',
        smtpPost: 587,
        smtpEmail: '',
        smtpPassword: '',
        googleKey: ''
      });
    } catch {
      // ignore
    }
  }
}
