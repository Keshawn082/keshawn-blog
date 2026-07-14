/**
 * 客户端中英文切换引擎
 *
 * 工作方式：
 * 1. 页面加载时从 localStorage 读取语言偏好（默认 'zh-CN'）
 * 2. 查找所有带 data-i18n 属性的元素，替换其文本内容
 * 3. 点击语言切换按钮时切换语言
 */

import { getTranslations } from './translations'

const STORAGE_KEY = 'keshawn-lang'
const DEFAULT_LANG: 'zh-CN' | 'en' = 'zh-CN'

/**
 * 获取当前语言
 */
function getCurrentLang(): 'zh-CN' | 'en' {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'zh-CN') return stored
  return DEFAULT_LANG
}

/**
 * 应用翻译到页面
 */
function applyTranslations(lang: 'zh-CN' | 'en') {
  const dict = getTranslations(lang)

  // 更新 html lang 属性
  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'

  // 更新所有带 data-i18n 的元素
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')
    if (!key) return

    const translation = dict[key]
    if (translation !== undefined) {
      // 如果是 input/button，设置 value
      if (el instanceof HTMLInputElement || el instanceof HTMLButtonElement) {
        if (el.type === 'button' || el.type === 'submit' || !el.type) {
          el.value = translation
        }
      }
      // 否则设置 textContent（保留子元素）
      else {
        el.textContent = translation
      }
    }
  })

  // 更新带 data-i18n-heading / data-i18n-subheading / data-i18n-date 的元素
  // 这些用于 Card / ProjectCard 等组件内部嵌套文本的翻译
  document.querySelectorAll<HTMLElement>('[data-i18n-heading]').forEach((el) => {
    const key = el.getAttribute('data-i18n-heading')
    if (!key) return
    const translation = dict[key]
    if (translation !== undefined) {
      const h = el.querySelector('h2, h3, h4')
      if (h) h.textContent = translation
    }
  })
  document.querySelectorAll<HTMLElement>('[data-i18n-subheading]').forEach((el) => {
    const key = el.getAttribute('data-i18n-subheading')
    if (!key) return
    const translation = dict[key]
    if (translation !== undefined) {
      const h = el.querySelector('p')
      if (h) h.textContent = translation
    }
  })
  document.querySelectorAll<HTMLElement>('[data-i18n-date]').forEach((el) => {
    const key = el.getAttribute('data-i18n-date')
    if (!key) return
    const translation = dict[key]
    if (translation !== undefined) {
      const ps = el.querySelectorAll('p')
      if (ps.length >= 2) ps[1].textContent = translation
    }
  })

  // 更新语言切换按钮文本
  const langBtn = document.getElementById('langToggle')
  if (langBtn) {
  langBtn.setAttribute('data-lang', lang === 'en' ? 'zh-CN' : 'en')
    langBtn.setAttribute('title', lang === 'en' ? dict['header.lang.tooltip'] || 'Switch to 中文' : '切换至英文')

    // 更新按钮内的文本
    const textSpan = langBtn.querySelector('.lang-text')
    if (textSpan) {
      textSpan.textContent = lang === 'en' ? '中文' : 'EN'
    }
    const tooltipSpan = langBtn.querySelector('.lang-tooltip')
    if (tooltipSpan) {
      tooltipSpan.textContent = lang === 'en' ? '中文' : 'English'
    }
  }
}

/**
 * 切换语言
 */
function toggleLang() {
  const current = getCurrentLang()
  const next: 'zh-CN' | 'en' = current === 'zh-CN' ? 'en' : 'zh-CN'
  localStorage.setItem(STORAGE_KEY, next)
  applyTranslations(next)
}

/**
 * 初始化 i18n
 */
export function initI18n() {
  // 应用保存的语言偏好
  const lang = getCurrentLang()
  applyTranslations(lang)

  // 绑定语言切换按钮
  const langBtn = document.getElementById('langToggle')
  langBtn?.addEventListener('click', toggleLang)
}

// 页面加载完成后初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n)
  } else {
    initI18n()
  }
}
