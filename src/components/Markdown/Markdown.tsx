'use client';

import React from 'react';
import type { PluginSimple } from 'markdown-it';
import './Markdown.css';

interface MarkdownProps {
  content: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  const [htmlContent, setHtmlContent] = React.useState<string>('');

  React.useEffect(() => {
    const renderMarkdown = async () => {
      try {
        // 动态导入 markdown-it 和相关插件以避免 SSR 问题
        const MarkdownIt = (await import('markdown-it')).default;
        const markdownItAbbr = (await import('markdown-it-abbr')).default;
        const markdownItAttrs = (await import('markdown-it-attrs')).default;
        const markdownItDecorate = (await import('markdown-it-decorate')).default;
        const markdownItEmojiModule = await import('markdown-it-emoji');
        // markdown-it-emoji exports multiple variants (e.g., { bare, full, light }), prefer `full` if present
        const markdownItEmoji = (((markdownItEmojiModule as unknown) as { full?: PluginSimple; default?: PluginSimple }).full ?? ((markdownItEmojiModule as unknown) as { default?: PluginSimple }).default ?? ((markdownItEmojiModule as unknown) as PluginSimple)) as PluginSimple;
        const markdownItExpandTabs = (await import('markdown-it-expand-tabs')).default;
        const markdownItFootnoteModule = await import('markdown-it-footnote');
        const markdownItFootnote = (((markdownItFootnoteModule as unknown) as { default?: PluginSimple }).default ?? ((markdownItFootnoteModule as unknown) as PluginSimple)) as PluginSimple;
        // markdown-it-imsize depends on Node's `fs` and will break client bundling.
        // Skip loading it in the browser build.
        const markdownItMark = (await import('markdown-it-mark')).default;
        const markdownItMultimdTable = (await import('markdown-it-multimd-table')).default;
        const markdownItSub = (await import('markdown-it-sub')).default;
        const markdownItSup = (await import('markdown-it-sup')).default;
        const markdownItTaskLists = (await import('markdown-it-task-lists')).default;

        // 初始化 markdown-it
        const md = new MarkdownIt({
          html: true,
          linkify: true,
          typographer: true,
        });

        // 使用插件（不包含依赖 Node fs 的 markdown-it-imsize）
        md.use(markdownItAbbr)
          .use(markdownItAttrs)
          .use(markdownItDecorate)
          .use(markdownItEmoji)
          .use(markdownItExpandTabs)
          .use(markdownItFootnote)
          .use(markdownItMark)
          .use(markdownItMultimdTable)
          .use(markdownItSub)
          .use(markdownItSup)
          .use(markdownItTaskLists);

        // 渲染 Markdown 内容为 HTML
        const html = md.render(content);
        setHtmlContent(html);
      } catch (error) {
        console.error('Failed to render Markdown:', error);
        setHtmlContent('<p>Failed to render Markdown content.</p>');
      }
    };

    if (content) {
      renderMarkdown();
    }
  }, [content]);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default Markdown;