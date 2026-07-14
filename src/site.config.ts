import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'Keshawn',
  author: 'Keshawn',
  description: '中南大学 · 智能科学与技术 · 大模型应用开发',
  favicon: '/favicon/favicon.ico',
  socialCard: '/images/social-card.png',

  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  },

  logo: {
    src: '/src/assets/avatar.jpg',
    alt: 'Keshawn'
  },

  titleDelimiter: '•',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',

  head: [],
  customCss: [],

  header: {
    menu: [
      { title: '首页', link: '/' },
      { title: '博客', link: '/blog' },
      { title: '项目', link: '/projects' },
      { title: '关于', link: '/about' }
    ]
  },

  footer: {
    year: `© ${new Date().getFullYear()}`,
    links: [],
    credits: true,
    social: [
      { icon: 'github', label: 'GitHub', href: 'https://github.com/keshawn082' },
      { icon: 'rss', label: 'RSS', href: '/rss.xml' }
    ]
  },

  content: {
    externalLinks: {
      content: ' ↗',
      properties: { style: 'user-select:none' }
    },
    blogPageSize: 8,
    share: ['weibo', 'x', 'bluesky']
  }
}

export const integ: IntegrationUserConfig = {
  links: {
    logbook: [],
    applyTip: [
      { name: 'Name', val: theme.title },
      { name: 'Desc', val: theme.description || 'Null' },
      { name: 'Link', val: 'https://keshawn.cn' },
      { name: 'Avatar', val: 'https://keshawn.cn/favicon/favicon.ico' }
    ],
    cacheAvatar: false
  },
  pagefind: true,
  quote: {
    server: 'https://dummyjson.com/quotes/random',
    target: `(data) => (data.quote.length > 80 ? \`\${data.quote.slice(0, 80)}...\` : data.quote || 'Error')`
  },
  typography: {
    class: 'prose text-base',
    blockquoteStyle: 'italic',
    inlineCodeBlockStyle: 'modern'
  },
  mediumZoom: {
    enable: true,
    selector: '.prose .zoomable',
    options: { className: 'zoomable' }
  },
  waline: {
    enable: false
  }
}

const config = { ...theme, integ } as Config
export default config

export const terms = {
  title: 'Terms',
  list: [
    { title: 'Privacy Policy', link: '/terms/privacy-policy' },
    { title: 'Terms and Conditions', link: '/terms/terms-and-conditions' }
  ]
}
