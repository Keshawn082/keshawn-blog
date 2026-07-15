# Keshawn Blog

Keshawn 的个人技术博客与主页，站点地址：<https://keshawn.cn>。

本项目基于 Astro 与 Astro Theme Pure 搭建，主要用于展示个人介绍、教育经历、实习经历、技术文章、项目与技能。当前内容方向聚焦大模型应用开发、AI Agent、RAG、多 Agent 协作与 AI 工程化实践。

## 功能特性

- 个人主页：头像、简介、教育经历、实习经历、证书、技能与项目入口
- 博客系统：基于 Astro Content Collections 管理 Markdown / MDX 文章
- 项目页：展示项目、学习记录与 GitHub 动态
- 关于页：展示个人介绍、工具栈与博客历史
- 中英文切换：通过客户端 i18n 字典切换页面固定文案
- 暗色模式：支持亮色 / 暗色 / 系统主题
- 搜索：使用 Pagefind 构建静态全文搜索
- RSS：自动生成 `/rss.xml`
- SEO：Canonical、Open Graph、Twitter Card、favicon、sitemap 等基础配置
- Markdown 增强：Shiki 代码高亮、复制按钮、代码块折叠、数学公式 KaTeX、标题锚点

## 技术栈

- [Astro](https://astro.build/) 6
- [TypeScript](https://www.typescriptlang.org/)
- [Astro Theme Pure / astro-pure](https://github.com/cworld1/astro-theme-pure)
- [UnoCSS](https://unocss.dev/)
- [Pagefind](https://pagefind.app/)
- [Shiki](https://shiki.style/)
- [KaTeX](https://katex.org/)
- [Vercel](https://vercel.com/) 部署适配

## 目录结构

```text
.
├── src/
│   ├── assets/              # 头像、favicon、工具/学校/公司图标、项目图片等
│   ├── components/          # 页面组件与自定义组件
│   ├── content/             # Astro 内容集合
│   │   ├── blog/            # 博客文章
│   │   └── docs/            # 文档集合占位/未来文档
│   ├── i18n/                # 中英文翻译字典与客户端切换逻辑
│   ├── layouts/             # 页面布局
│   ├── pages/               # Astro 路由页面
│   ├── plugins/             # Markdown / Shiki / rehype 插件
│   └── site.config.ts       # 站点与主题配置
├── public/                  # 静态资源、favicon、RSS XSL 等
├── packages/pure/           # astro-pure 主题源码/组件包副本
├── astro.config.ts          # Astro 配置
├── uno.config.ts            # UnoCSS 配置
└── package.json
```

## 本地开发

环境要求：

- Node.js 18+
- npm

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

类型检查：

```bash
npm run check
```

生产构建：

```bash
npm run build
```

预览构建产物：

```bash
npm run preview
```

## 常用维护入口

### 修改站点基础信息

编辑：

```text
src/site.config.ts
```

这里包含站点标题、作者、描述、导航菜单、footer、RSS、Pagefind、Waline、MediumZoom 等配置。

### 修改首页内容

编辑：

```text
src/pages/index.astro
```

首页包含：关于、教育、实习、文章、项目、证书、技能等模块。

### 修改中英文固定文案

编辑：

```text
src/i18n/translations.ts
```

页面中通过 `data-i18n` 绑定翻译 key。

### 新增博客文章

在目录中新增 Markdown 或 MDX 文件：

```text
src/content/blog/
```

文章 frontmatter 示例：

```md
---
title: '文章标题'
description: '文章描述，建议不超过 160 字'
publishDate: 2026-07-15
tags: ['AI Agent', 'RAG']
draft: false
comment: true
---

正文内容。
```

内容集合 schema 定义在：

```text
src/content.config.ts
```

### 修改图标与图片资源

常用资源目录：

```text
src/assets/tools/       # 工具图标
src/assets/schools/     # 学校图标
src/assets/companies/   # 公司图标
src/assets/projects/    # 项目卡片图片
public/favicon/         # 浏览器 favicon 与 PWA 图标
```

## 部署

项目为静态站点输出：

```text
output: 'static'
```

构建产物输出到：

```text
dist/
```

可部署到 Vercel 或其他静态站点托管平台。

## 当前内容状态

- 首页已个人化为 Keshawn 的个人主页
- 博客已有 Hermes Agent 深度解析文章
- 关于页展示 AI Agent / 开发 / 运维相关工具栈
- 项目页仍保留部分主题模板项目内容，后续可继续替换为个人真实项目
- Waline 评论组件代码保留，但当前配置为关闭

## Credits

本项目基于以下开源项目构建：

- [Astro](https://astro.build/)
- [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure)
- [Pagefind](https://pagefind.app/)
- [UnoCSS](https://unocss.dev/)

## License

本仓库保留原模板的 Apache 2.0 License。个人内容、图片与简历信息请勿未经授权复用。
