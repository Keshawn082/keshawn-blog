/**
 * 中英文翻译字典
 * zh: 中文（默认）
 * en: 英文
 */

export const zh: Record<string, string> = {
  // Header
  'header.menu.home': '首页',
  'header.menu.blog': '博客',
  'header.menu.projects': '项目',
  'header.menu.about': '关于',
  'header.search': '搜索',
  'header.lang': 'English',
  'header.lang.tooltip': '切换至英文',

  // Footer
  'footer.powered': '由 Astro & Pure 主题驱动',
  'common.back': '返回',

  // Homepage
  'home.about': '关于',
  'home.posts': '文章',
  'home.education': '教育',
  'home.websites': '网站列表',
  'home.certifications': '证书',
  'home.skills': '技能',
  'home.projects': '项目',
  'home.more_about': '了解更多',
  'home.more_posts': '更多文章',
  'home.location': '长沙',
  'home.source_code': '源代码',
  'home.get_template': '获取模板',
  'home.description': '大模型应用 / Agent 开发',
  'home.bio': '中南大学智能科学与技术硕士在读，方向聚焦大模型应用开发。对 Agent 工作流、RAG、多 Agent 协作等有一定实践经验，热衷于用技术解决实际问题。',
  'home.skills.languages': '编程语言',
  'home.skills.ai': 'AI与Agent',
  'home.skills.tools': '框架与工具',

  // Education section
  'home.edu.heading': '中南大学',
  'home.edu.subheading': '智能科学与技术 · 硕士',
  'home.edu.date': '2024年9月 - 2027年6月',

  // Project cards on homepage
  'home.project.more.heading': '更多项目',
  'home.project.more.subheading': '查看全部项目',
  'home.project.keshawn_blog.subheading': '个人技术博客 · Astro + Hermes Agent 主题',

  // Skills (display names)
  'skill.Html': 'Html',
  'skill.JavaScript': 'JavaScript',
  'skill.CSS': 'CSS',
  'skill.Shell': 'Shell',
  'skill.TypeScript': 'TypeScript',
  'skill.Vite': 'Vite',
  'skill.Astro': 'Astro',
  'skill.Vercel': 'Vercel',
  'skill.Python': 'Python',
  'skill.SQL': 'SQL',
  'skill.FastAPI': 'FastAPI',
  'skill.Git': 'Git',
  'skill.Docker': 'Docker',
  'skill.Claude Code': 'Claude Code',
  'skill.Hermes': 'Hermes',
  'skill.Function Calling': 'Function Calling',
  'skill.Prompt Engineering': 'Prompt Engineering',
  'skill.Harness Engineering': 'Harness Engineering',
  'skill.Loop Engineering': 'Loop Engineering',

  // Certifications
  'home.cert.scholarship1': '研究生学业一等奖学金',
  'home.cert.date.scholarship1': '2024年',
  'home.cert.cet6': 'CET-6',
  'home.cert.date.cet6': '2023年',
  'home.cert.math': '全国大学生数学竞赛省二等奖',
  'home.cert.date.math': '2023年',
  'home.cert.market': '全国大学生市场调查与分析大赛省三等奖',
  'home.cert.date.market': '2023年',
  'home.cert.scholarship2': '国家励志奖学金',
  'home.cert.date.scholarship2': '2023年',

  // About page
  'about.title': '关于',
  'about.description': 'Agent 全栈开发工程师',
  'about.bio': '中南大学智能科学与技术硕士，专注于大模型应用开发与 AI Agent 工程化落地。熟悉 Agent 工作流设计、多 Agent 协作、RAG 应用构建等技术，持续探索前沿 AI 工程实践。',
  'about.motto.prefix': '座右铭：',
  'about.motto.text': 'Keep building, keep shipping.',
  'about.sponsor': '赞助我',
  'about.hobbies': '兴趣爱好',
  'about.tools': '工具',
  'about.social': '社交网络',
  'about.gossips': '闲言碎语',
  'about.blog': '关于博客',
  'about.blog.website_history': '网站历史：',
  'about.blog.credits': '网站的稳定运行和个性化定制也依赖于以下优秀项目/服务提供商提供的资源和技术支持：',
  'about.hobby1': 'AI Agent 框架调研与工程实践',
  'about.hobby2': 'RAG 与检索系统优化',
  'about.hobby3': '多 Agent 协作系统设计',
  'about.hobby4': '阅读前沿论文与技术博客',
  'about.tools.ai': 'AI 与 Agent',
  'about.tools.development': '开发工具',
  'about.tools.devops': '部署与运维',


  // Projects page
  'projects.title': '项目',
  'projects.about_theme': '关于 Astro-Theme-Pure 项目',
  'projects.github_activities': 'GitHub 动态：',
  'projects.collaborate': '如果你觉得可以合作或者有兴趣参与项目，可以通过捐赠支持我的工作或联系我讨论项目。',
  'projects.checkout_sponsorship': '查看赞助',
  'projects.programs': '项目',
  'projects.learnings': '学习',
  'projects.others': '其他',
  'projects.gpg': 'GPG 签名',
  'projects.gpg_desc': '你可以通过验证 GPG 签名来确认我签署的文件的真实性。我的 GPG 密钥是',
  'projects.checkout_key': '查看我的密钥',
  'projects.sponsorship': '赞助',
  'projects.sponsorship.cn': '国内方式：',
  'projects.sponsorship.global': '国际方式：',
  'projects.sponsorship.contact': '赞助后请留言或主动联系我。我的邮箱是',
  'projects.sponsorship.thanks': '感谢以下赞助者：',
  'projects.old_projects': '一些老项目',
  'projects.email_hint': '（点击代码解码 Base64）',
}

export const en: Record<string, string> = {
  // Header
  'header.menu.home': 'Home',
  'header.menu.blog': 'Blog',
  'header.menu.projects': 'Projects',
  'header.menu.about': 'About',
  'header.search': 'Search',
  'header.lang': '中文',
  'header.lang.tooltip': 'Switch to Chinese',

  // Footer
  'footer.powered': 'Powered by Astro & Pure theme',
  'common.back': 'Back',

  // Homepage
  'home.about': 'About',
  'home.posts': 'Posts',
  'home.education': 'Education',
  'home.websites': 'Website List',
  'home.certifications': 'Certifications',
  'home.skills': 'Skills',
  'home.projects': 'Projects',
  'home.more_about': 'More About Me',
  'home.more_posts': 'More Posts',
  'home.location': 'Changsha',
  'home.source_code': 'Source Code',
  'home.get_template': 'Get Template',
  'home.description': 'LLM Application / Agent Development',
  'home.bio': 'Master student in Intelligent Science and Technology at CSU, focusing on LLM application development. Experienced in Agent workflow design, RAG, and multi-agent coordination. Passionate about solving real-world problems with technology.',
  'home.skills.languages': 'Languages',
  'home.skills.ai': 'AI & Agents',
  'home.skills.tools': 'Frameworks & Tools',

  // Education section
  'home.edu.heading': 'Central South University',
  'home.edu.subheading': 'Intelligent Science and Technology · Master',
  'home.edu.date': 'Sep 2024 - Jun 2027',

  // Project cards on homepage
  'home.project.more.heading': 'More Projects',
  'home.project.more.subheading': 'View All Projects',
  'home.project.keshawn_blog.subheading': 'Personal Tech Blog · Astro + Hermes Agent Theme',

  // Skills (display names)
  'skill.Html': 'Html',
  'skill.JavaScript': 'JavaScript',
  'skill.CSS': 'CSS',
  'skill.Shell': 'Shell',
  'skill.TypeScript': 'TypeScript',
  'skill.Vite': 'Vite',
  'skill.Astro': 'Astro',
  'skill.Vercel': 'Vercel',
  'skill.Python': 'Python',
  'skill.SQL': 'SQL',
  'skill.FastAPI': 'FastAPI',
  'skill.Git': 'Git',
  'skill.Docker': 'Docker',
  'skill.Claude Code': 'Claude Code',
  'skill.Hermes': 'Hermes',
  'skill.Function Calling': 'Function Calling',
  'skill.Prompt Engineering': 'Prompt Engineering',
  'skill.Harness Engineering': 'Harness Engineering',
  'skill.Loop Engineering': 'Loop Engineering',

  // Certifications
  'home.cert.scholarship1': 'First-Class Academic Scholarship',
  'home.cert.date.scholarship1': '2024',
  'home.cert.cet6': 'CET-6',
  'home.cert.date.cet6': '2023',
  'home.cert.math': 'National Math Contest - Provincial 2nd Prize',
  'home.cert.date.math': '2023',
  'home.cert.market': 'National Market Survey Contest - Provincial 3rd Prize',
  'home.cert.date.market': '2023',
  'home.cert.scholarship2': 'National Endeavor Scholarship',
  'home.cert.date.scholarship2': '2023',

  // About page
  'about.title': 'About',
  'about.description': 'Agent Full-Stack Developer',
  'about.bio': 'Master student in Intelligent Science and Technology at CSU, specializing in LLM application development and AI Agent engineering. Proficient in Agent workflow design, multi-agent coordination, and RAG application development. Continuously exploring cutting-edge AI engineering practices.',
  'about.motto.prefix': 'Motto: ',
  'about.motto.text': 'Keep building, keep shipping.',
  'about.sponsor': 'Sponsor Me',
  'about.hobbies': 'Hobbies',
  'about.tools': 'Tools',
  'about.social': 'Social Networks',
  'about.gossips': 'Gossips',
  'about.blog': 'About Blog',
  'about.blog.website_history': 'Website history:',
  'about.blog.credits': 'The smooth operation and personalized customization of website also rely on the resources and technical support provided by the following excellent projects/service providers:',
  'about.hobby1': 'AI Agent framework research & engineering',
  'about.hobby2': 'RAG & retrieval system optimization',
  'about.hobby3': 'Multi-agent coordination system design',
  'about.hobby4': 'Reading cutting-edge papers & tech blogs',
  'about.tools.ai': 'AI & Agents',
  'about.tools.development': 'Development Tools',
  'about.tools.devops': 'Deployment & DevOps',


  // Projects page
  'projects.title': 'Projects',
  'projects.about_theme': 'About Astro-Theme-Pure Project',
  'projects.github_activities': 'Github Activities:',
  'projects.collaborate': 'If you think it would be useful or interesting to collaborate on a project, you can donate to support my work or contact me to discuss a project.',
  'projects.checkout_sponsorship': 'Checkout Sponsorship',
  'projects.programs': 'Programs',
  'projects.learnings': 'Learnings',
  'projects.others': 'Others',
  'projects.gpg': 'GPG Signature',
  'projects.gpg_desc': 'You can verify the authenticity of the files I signed by checking the GPG signature. My GPG key is',
  'projects.checkout_key': 'Checkout My Key',
  'projects.sponsorship': 'Sponsorship',
  'projects.sponsorship.cn': 'Chinese methods: ',
  'projects.sponsorship.global': 'Global methods: ',
  'projects.sponsorship.contact': 'Please leave a message or contact me proactively after sponsorship. My email is:',
  'projects.sponsorship.thanks': 'Thanks to the following sponsors:',
  'projects.old_projects': 'Some Old Projects',
  'projects.email_hint': '(click code to transform base64)',
}

export function getTranslations(lang: 'zh-CN' | 'en'): Record<string, string> {
  return lang === 'en' ? en : zh
}
