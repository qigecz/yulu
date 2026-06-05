import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '渔路 YULU · 发现你的下一个钓点',
  description: '钓鱼地点分享社区 App。精准坑点标注、路线下载导航、钓技教学分享。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
