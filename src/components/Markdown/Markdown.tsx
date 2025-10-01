import React from 'react';
import './markdown.css';

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
        const markdownItEmoji = await import('markdown-it-emoji');
        const markdownItExpandTabs = (await import('markdown-it-expand-tabs')).default;
        const markdownItFootnote = await import('markdown-it-footnote');
        const markdownItImsize = (await import('markdown-it-imsize')).default;
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

        // 使用插件
        md.use(markdownItAbbr)
          .use(markdownItAttrs)
          .use(markdownItDecorate)
          .use(markdownItEmoji.default || markdownItEmoji)
          .use(markdownItExpandTabs)
          .use(markdownItFootnote.default || markdownItFootnote)
          .use(markdownItImsize)
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