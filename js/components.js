'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────

function escAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Cross-client email button (table-based, Outlook-compatible)
function emailButton(text, href, opts) {
  const o = Object.assign({ bgColor: '#4f8ef7', textColor: '#ffffff', borderRadius: 6, fontSize: 15, padding: '14px 32px', align: 'center' }, opts);
  return `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
<tr><td align="center" bgcolor="${o.bgColor}" style="border-radius:${o.borderRadius}px;">
<a href="${escAttr(href)}" target="_blank" style="background-color:${o.bgColor};border-radius:${o.borderRadius}px;color:${o.textColor};display:inline-block;font-family:Arial,sans-serif;font-size:${o.fontSize}px;font-weight:700;line-height:1.2;text-decoration:none;padding:${o.padding};mso-padding-alt:0px;">${text}</a>
</td></tr></table>`;
}

// Outer section table (full-width)
function section(innerHtml, bgColor, padding) {
  return `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color:${bgColor || '#ffffff'};">
<tr><td style="padding:${padding || '0'};">${innerHtml}</td></tr>
</table>`;
}

// Social icon: colored circle with platform letter (works in all clients)
const SNS_LETTER = {
  twitter: 'X', instagram: 'ig', facebook: 'f', youtube: '▶',
  linkedin: 'in', pinterest: 'P', github: 'gh', snapchat: 'S',
  vimeo: 'V', medium: 'M', soundcloud: 'SC', dribbble: 'D',
};

// 外部 CDN URL（email クライアントで安定動作）
const SNS_CDN = {
  'twitter':   'https://logo.clearbit.com/x.com',
  'x-twitter': 'https://logo.clearbit.com/x.com',
  'instagram': 'https://logo.clearbit.com/instagram.com',
  'facebook':  'https://logo.clearbit.com/facebook.com',
  'youtube':   'https://logo.clearbit.com/youtube.com',
  'line':      'https://logo.clearbit.com/line.me',
  'tiktok':    'https://logo.clearbit.com/tiktok.com',
  'linkedin':  'https://logo.clearbit.com/linkedin.com',
  'github':    'https://logo.clearbit.com/github.com',
  'pinterest': 'https://logo.clearbit.com/pinterest.com',
};

const SNS_BGCOLOR = {
  'twitter': '#000', 'x-twitter': '#000', 'instagram': '#E1306C',
  'facebook': '#1877F2', 'youtube': '#FF0000', 'line': '#06C755',
  'tiktok': '#010101', 'linkedin': '#0A66C2', 'github': '#24292e',
  'pinterest': '#E60023',
};

// アイコン画像ヘルパー: CDN → data URI → 文字フォールバック
function _iconImg(name, size) {
  const cdnUrl = SNS_CDN[name];
  if (cdnUrl) {
    return `<img src="${cdnUrl}" width="${size}" height="${size}" alt="${name}" style="display:block;border:0;border-radius:${Math.round(size/5)}px;">`;
  }
  const dataUri = (typeof ICON_DATA !== 'undefined' && ICON_DATA[name]) ? ICON_DATA[name] : null;
  if (dataUri) {
    return `<img src="${dataUri}" width="${size}" height="${size}" alt="${name}" style="display:block;border:0;">`;
  }
  const letter = SNS_LETTER[name] || name[0].toUpperCase();
  return `<span style="display:block;color:#fff;font-size:${Math.round(size*.45)}px;font-weight:700;font-family:Arial,sans-serif;line-height:${size}px;text-align:center;">${letter}</span>`;
}

// propSchema field types:
// color | text | textarea | url | number | select | toggle | image | social-list | section-divider

const COMPONENTS = [

  // ── ヘッダー ────────────────────────────────────────────────────────────────
  {
    id: 'header', name: 'ヘッダー', icon: '🏷️',
    defaultProps: {
      bgColor: '#1a1a2e', logoText: 'Brand Name', logoImageUrl: '',
      textColor: '#ffffff', fontSize: 22, align: 'center', padding: '20px 30px',
    },
    propSchema: [
      { key: 'bgColor',      type: 'color',  label: '背景色' },
      { key: 'logoText',     type: 'text',   label: 'ロゴテキスト' },
      { key: 'logoImageUrl', type: 'image',  label: 'ロゴ画像URL' },
      { key: 'textColor',    type: 'color',  label: 'テキスト色' },
      { key: 'fontSize',     type: 'number', label: 'フォントサイズ', min: 12, max: 48 },
      { key: 'align',        type: 'select', label: '配置', options: [{ value: 'left', label: '左' }, { value: 'center', label: '中央' }, { value: 'right', label: '右' }] },
    ],
    toHTML(p) {
      const logo = p.logoImageUrl
        ? `<img src="${escAttr(p.logoImageUrl)}" alt="${escAttr(p.logoText)}" width="160" style="max-width:160px;height:auto;display:block;" class="fluid">`
        : `<span style="font-size:${p.fontSize}px;font-weight:700;color:${p.textColor};font-family:Arial,sans-serif;">${p.logoText}</span>`;
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
<tr><td align="${p.align}">${logo}</td></tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── ヒーロー ────────────────────────────────────────────────────────────────
  {
    id: 'hero', name: 'ヒーロー', icon: '🖼️',
    defaultProps: {
      bgColor: '#4f8ef7', title: 'タイトルをここに入れる', titleColor: '#ffffff', titleSize: 28,
      subtitle: 'サブテキストをここに記述します。', subtitleColor: 'rgba(255,255,255,.85)',
      showButton: true, buttonText: '詳しく見る', buttonUrl: '#',
      buttonBgColor: '#ffffff', buttonTextColor: '#4f8ef7', padding: '50px 30px',
    },
    propSchema: [
      { key: 'bgColor',         type: 'color',  label: '背景色' },
      { key: 'title',           type: 'text',   label: 'タイトル' },
      { key: 'titleColor',      type: 'color',  label: 'タイトル色' },
      { key: 'titleSize',       type: 'number', label: 'タイトルサイズ', min: 16, max: 60 },
      { key: 'subtitle',        type: 'text',   label: 'サブテキスト' },
      { key: 'subtitleColor',   type: 'color',  label: 'サブテキスト色' },
      { key: 'showButton',      type: 'toggle', label: 'ボタン表示' },
      { key: 'buttonText',      type: 'text',   label: 'ボタンテキスト' },
      { key: 'buttonUrl',       type: 'url',    label: 'ボタンURL' },
      { key: 'buttonBgColor',   type: 'color',  label: 'ボタン背景色' },
      { key: 'buttonTextColor', type: 'color',  label: 'ボタン文字色' },
    ],
    toHTML(p) {
      const btnRow = p.showButton
        ? `<tr><td align="center" style="padding-top:24px;">${emailButton(p.buttonText, p.buttonUrl, { bgColor: p.buttonBgColor, textColor: p.buttonTextColor, borderRadius: 6 })}</td></tr>`
        : '';
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
<tr><td align="center" style="font-family:Arial,sans-serif;color:${p.titleColor};font-size:${p.titleSize}px;font-weight:700;line-height:1.3;">${p.title}</td></tr>
<tr><td align="center" style="font-family:Arial,sans-serif;color:${p.subtitleColor};font-size:15px;padding-top:12px;">${p.subtitle}</td></tr>
${btnRow}</table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── 見出し ──────────────────────────────────────────────────────────────────
  {
    id: 'heading', name: '見出し', icon: '📌',
    defaultProps: {
      bgColor: '#ffffff', text: 'セクション見出し', textColor: '#1a1a2e',
      fontSize: 22, align: 'left', padding: '30px 30px 8px',
    },
    propSchema: [
      { key: 'bgColor',   type: 'color',  label: '背景色' },
      { key: 'text',      type: 'text',   label: '見出しテキスト' },
      { key: 'textColor', type: 'color',  label: 'テキスト色' },
      { key: 'fontSize',  type: 'number', label: 'フォントサイズ', min: 14, max: 48 },
      { key: 'align',     type: 'select', label: '配置', options: [{ value: 'left', label: '左' }, { value: 'center', label: '中央' }, { value: 'right', label: '右' }] },
    ],
    toHTML(p) {
      return section(
        `<span style="font-family:Arial,sans-serif;font-size:${p.fontSize}px;font-weight:700;color:${p.textColor};display:block;text-align:${p.align};">${p.text}</span>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── テキスト ────────────────────────────────────────────────────────────────
  {
    id: 'text', name: 'テキスト', icon: '📝',
    defaultProps: {
      bgColor: '#ffffff', body: '本文テキストをここに入力します。読者に伝えたいメッセージをわかりやすく記述してください。',
      textColor: '#4a4a4a', fontSize: 15, lineHeight: 1.7, padding: '8px 30px 30px',
    },
    propSchema: [
      { key: 'bgColor',    type: 'color',    label: '背景色' },
      { key: 'body',       type: 'textarea', label: '本文 (HTMLタグ可)' },
      { key: 'textColor',  type: 'color',    label: 'テキスト色' },
      { key: 'fontSize',   type: 'number',   label: 'フォントサイズ', min: 11, max: 24 },
      { key: 'lineHeight', type: 'number',   label: '行間', min: 1, max: 3, step: 0.1 },
    ],
    toHTML(p) {
      return section(
        `<div style="font-family:Arial,sans-serif;font-size:${p.fontSize}px;color:${p.textColor};line-height:${p.lineHeight};">${p.body}</div>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── 画像 ────────────────────────────────────────────────────────────────────
  {
    id: 'image', name: '画像', icon: '🖼',
    defaultProps: {
      bgColor: '#ffffff', src: 'https://placehold.co/600x300/e8e8e8/888?text=Image',
      alt: '', href: '', borderRadius: 0, width: 0, fluidOnMobile: true, padding: '20px 30px',
    },
    propSchema: [
      { key: 'bgColor',       type: 'color',  label: '背景色' },
      { key: 'src',           type: 'image',  label: '画像（URLまたはファイル）' },
      { key: 'alt',           type: 'text',   label: 'Alt テキスト' },
      { key: 'href',          type: 'url',    label: 'リンクURL' },
      { key: 'width',         type: 'number', label: '幅 (px、0=全幅)', min: 0, max: 600 },
      { key: 'borderRadius',  type: 'number', label: '角丸 (px)', min: 0, max: 50 },
      { key: 'fluidOnMobile', type: 'toggle', label: 'モバイルで全幅' },
    ],
    toHTML(p) {
      const w      = p.width > 0 ? `width="${p.width}" ` : '';
      const wStyle = p.width > 0 ? `max-width:${p.width}px;` : 'max-width:100%;';
      const br     = p.borderRadius > 0 ? `border-radius:${p.borderRadius}px;` : '';
      const fluid  = p.fluidOnMobile !== false ? ' fluid' : '';
      const img    = `<img src="${escAttr(p.src)}" alt="${escAttr(p.alt)}" ${w}style="${wStyle}height:auto;display:block;${br}" class="${fluid.trim()}">`;
      const inner  = p.href ? `<a href="${escAttr(p.href)}" style="display:block;">${img}</a>` : img;
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="center">${inner}</td></tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── ロゴ画像 ────────────────────────────────────────────────────────────────
  {
    id: 'logo', name: 'ロゴ画像', icon: '🏷',
    defaultProps: {
      bgColor: '#ffffff', src: '', alt: 'ロゴ', href: '',
      width: 120, align: 'left', padding: '16px 24px',
    },
    propSchema: [
      { key: 'bgColor', type: 'color', label: '背景色' },
      { key: 'src',     type: 'image', label: '画像（URLまたはファイル）' },
      { key: 'alt',     type: 'text',  label: 'Alt テキスト' },
      { key: 'href',    type: 'url',   label: 'リンクURL（省略可）' },
      { key: 'width',   type: 'select', label: 'サイズ', options: [
        { value: 60,  label: 'XS (60px)' }, { value: 90,  label: 'S  (90px)' },
        { value: 120, label: 'M  (120px)' }, { value: 180, label: 'L  (180px)' },
        { value: 240, label: 'XL (240px)' },
      ]},
      { key: 'align', type: 'select', label: '配置', options: [
        { value: 'left', label: '左' }, { value: 'center', label: '中央' }, { value: 'right', label: '右' },
      ]},
    ],
    toHTML(p) {
      const w   = parseInt(p.width, 10) || 120;
      const img = `<img src="${escAttr(p.src)}" alt="${escAttr(p.alt)}" width="${w}" style="max-width:${w}px;height:auto;display:block;">`;
      const inner = p.href ? `<a href="${escAttr(p.href)}" style="display:inline-block;">${img}</a>` : img;
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="${p.align}">${inner}</td></tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── 画像ボタン (CTA) ────────────────────────────────────────────────────────
  {
    id: 'image-button', name: '画像ボタン (CTA)', icon: '🖱',
    defaultProps: {
      bgColor: '#ffffff',
      src: 'https://placehold.co/560x80/6C47FF/ffffff?text=Click+Here',
      alt: 'CTA', href: '#', borderRadius: 8, align: 'center', padding: '16px 24px',
    },
    propSchema: [
      { key: 'bgColor',      type: 'color',  label: '背景色' },
      { key: 'src',          type: 'image',  label: '画像（URLまたはファイル）' },
      { key: 'alt',          type: 'text',   label: 'Alt テキスト' },
      { key: 'href',         type: 'url',    label: 'リンクURL' },
      { key: 'borderRadius', type: 'number', label: '角丸 (px)', min: 0, max: 40 },
      { key: 'align',        type: 'select', label: '配置', options: [
        { value: 'center', label: '中央' }, { value: 'left', label: '左' }, { value: 'right', label: '右' },
      ]},
    ],
    toHTML(p) {
      const br  = p.borderRadius > 0 ? `border-radius:${p.borderRadius}px;overflow:hidden;` : '';
      const img = `<img src="${escAttr(p.src)}" alt="${escAttr(p.alt)}" style="max-width:100%;height:auto;display:block;${br}" class="fluid">`;
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="${p.align}"><a href="${escAttr(p.href)}" style="display:inline-block;${br}">${img}</a></td></tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── ボタン ──────────────────────────────────────────────────────────────────
  {
    id: 'button', name: 'ボタン', icon: '🔘',
    defaultProps: {
      bgColor: '#ffffff', buttonText: 'アクションボタン', buttonUrl: '#',
      buttonBgColor: '#4f8ef7', buttonTextColor: '#ffffff',
      fontSize: 15, borderRadius: 6, align: 'center', padding: '20px 30px',
    },
    propSchema: [
      { key: 'bgColor',         type: 'color',  label: 'セクション背景色' },
      { key: 'buttonText',      type: 'text',   label: 'ボタンテキスト' },
      { key: 'buttonUrl',       type: 'url',    label: 'ボタンURL' },
      { key: 'buttonBgColor',   type: 'color',  label: 'ボタン背景色' },
      { key: 'buttonTextColor', type: 'color',  label: 'ボタン文字色' },
      { key: 'fontSize',        type: 'number', label: 'フォントサイズ', min: 11, max: 24 },
      { key: 'borderRadius',    type: 'number', label: '角丸 (px)', min: 0, max: 50 },
      { key: 'align',           type: 'select', label: '配置', options: [{ value: 'left', label: '左' }, { value: 'center', label: '中央' }, { value: 'right', label: '右' }] },
    ],
    toHTML(p) {
      const btn = emailButton(p.buttonText, p.buttonUrl, {
        bgColor: p.buttonBgColor, textColor: p.buttonTextColor,
        fontSize: p.fontSize, borderRadius: p.borderRadius,
      });
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td align="${p.align}">${btn}</td></tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── フォームCTA ─────────────────────────────────────────────────────────────
  {
    id: 'form-cta', name: 'フォームCTA', icon: '📋',
    defaultProps: {
      bgColor: '#F5F3FF',
      title: '今すぐ無料登録',
      subtitle: '30秒で完了 · スパムなし · いつでも解除可能',
      namePlaceholder: 'お名前',
      emailPlaceholder: 'メールアドレス',
      buttonText: '登録する →',
      buttonBgColor: '#6C47FF',
      formUrl: '#',
      disclaimer: 'ご登録いただくことで利用規約に同意したものとみなされます。',
      padding: '40px 24px',
    },
    propSchema: [
      { key: 'bgColor',          type: 'color', label: '背景色' },
      { key: 'title',            type: 'text',  label: 'タイトル' },
      { key: 'subtitle',         type: 'text',  label: 'サブタイトル' },
      { key: '__inputs', type: 'section-divider', label: '─ 入力フィールド' },
      { key: 'namePlaceholder',  type: 'text',  label: '名前 プレースホルダー' },
      { key: 'emailPlaceholder', type: 'text',  label: 'Email プレースホルダー' },
      { key: '__btn', type: 'section-divider', label: '─ ボタン' },
      { key: 'buttonText',       type: 'text',  label: 'ボタンテキスト' },
      { key: 'buttonBgColor',    type: 'color', label: 'ボタン色' },
      { key: 'formUrl',          type: 'url',   label: 'フォームURL（遷移先）' },
      { key: 'disclaimer',       type: 'text',  label: '注記テキスト' },
    ],
    toHTML(p) {
      const inputStyle = 'display:block;width:100%;padding:13px 16px;border:2px solid #D8D0FF;border-radius:10px;font-size:15px;font-family:Arial,sans-serif;box-sizing:border-box;outline:none;margin-bottom:10px;';
      const btn = emailButton(p.buttonText, p.formUrl, {
        bgColor: p.buttonBgColor, textColor: '#fff', borderRadius: 50, fontSize: 15, padding: '14px 40px',
      });
      // Inputs hidden from Outlook via MSO conditional comment
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
<tr><td align="center" style="font-family:Arial,sans-serif;font-size:24px;font-weight:800;color:#1A1033;padding-bottom:8px;">${p.title}</td></tr>
<tr><td align="center" style="font-family:Arial,sans-serif;font-size:13px;color:#7A6E9A;padding-bottom:24px;">${p.subtitle}</td></tr>
<tr><td><!--[if !mso]><!-->
<input type="text" placeholder="${escAttr(p.namePlaceholder)}" style="${inputStyle}">
<input type="email" placeholder="${escAttr(p.emailPlaceholder)}" style="${inputStyle}margin-bottom:20px;">
<!--<![endif]--></td></tr>
<tr><td align="center">${btn}</td></tr>
<tr><td align="center" style="font-family:Arial,sans-serif;font-size:11px;color:#aaa;padding-top:16px;">${p.disclaimer}</td></tr>
</table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── 2カラム ─────────────────────────────────────────────────────────────────
  {
    id: 'twocol', name: '2カラム', icon: '⬛⬛',
    defaultProps: {
      bgColor: '#ffffff',
      leftImageUrl: '', leftTitle: '左タイトル', leftBody: '左側のコンテンツを記述します。', leftButtonText: '', leftButtonUrl: '#', leftButtonColor: '#4f8ef7',
      rightImageUrl: '', rightTitle: '右タイトル', rightBody: '右側のコンテンツを記述します。', rightButtonText: '', rightButtonUrl: '#', rightButtonColor: '#4f8ef7',
      padding: '30px 20px',
    },
    propSchema: [
      { key: 'bgColor', type: 'color', label: '背景色' },
      { key: '__left', type: 'section-divider', label: '─ 左カラム' },
      { key: 'leftImageUrl',    type: 'image',    label: '左: 画像' },
      { key: 'leftTitle',       type: 'text',     label: '左: タイトル' },
      { key: 'leftBody',        type: 'textarea', label: '左: テキスト' },
      { key: 'leftButtonText',  type: 'text',     label: '左: ボタンテキスト（空で非表示）' },
      { key: 'leftButtonUrl',   type: 'url',      label: '左: ボタンURL' },
      { key: 'leftButtonColor', type: 'color',    label: '左: ボタン色' },
      { key: '__right', type: 'section-divider', label: '─ 右カラム' },
      { key: 'rightImageUrl',    type: 'image',    label: '右: 画像' },
      { key: 'rightTitle',       type: 'text',     label: '右: タイトル' },
      { key: 'rightBody',        type: 'textarea', label: '右: テキスト' },
      { key: 'rightButtonText',  type: 'text',     label: '右: ボタンテキスト（空で非表示）' },
      { key: 'rightButtonUrl',   type: 'url',      label: '右: ボタンURL' },
      { key: 'rightButtonColor', type: 'color',    label: '右: ボタン色' },
    ],
    toHTML(p) {
      function colHtml(imgUrl, title, body, btnText, btnUrl, btnColor) {
        const img = imgUrl ? `<img src="${escAttr(imgUrl)}" alt="${escAttr(title)}" width="100%" style="max-width:100%;height:auto;display:block;"><br>` : '';
        const btn = btnText ? `<br>${emailButton(btnText, btnUrl, { bgColor: btnColor, textColor: '#fff', fontSize: 14 })}` : '';
        return `${img}<span style="font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#1a1a2e;">${title}</span><br><br><span style="font-family:Arial,sans-serif;font-size:14px;color:#4a4a4a;line-height:1.7;">${body}</span>${btn}`;
      }
      const left  = colHtml(p.leftImageUrl,  p.leftTitle,  p.leftBody,  p.leftButtonText,  p.leftButtonUrl,  p.leftButtonColor);
      const right = colHtml(p.rightImageUrl, p.rightTitle, p.rightBody, p.rightButtonText, p.rightButtonUrl, p.rightButtonColor);
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
<tr>
<td width="50%" valign="top" style="padding:0 10px 0 0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td valign="top">${left}</td></tr></table>
</td>
<td width="50%" valign="top" style="padding:0 0 0 10px;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td valign="top">${right}</td></tr></table>
</td>
</tr>
</table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── 区切り線 ────────────────────────────────────────────────────────────────
  {
    id: 'divider', name: '区切り線', icon: '➖',
    defaultProps: { borderColor: '#e0e0e0', borderWidth: 1, padding: '0 30px' },
    propSchema: [
      { key: 'borderColor', type: 'color',  label: '線の色' },
      { key: 'borderWidth', type: 'number', label: '線の太さ (px)', min: 1, max: 8 },
    ],
    toHTML(p) {
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td style="border-top:${p.borderWidth}px solid ${p.borderColor};font-size:0;line-height:0;">&nbsp;</td></tr></table>`,
        'transparent', p.padding
      );
    },
  },

  // ── スペーサー ───────────────────────────────────────────────────────────────
  {
    id: 'spacer', name: 'スペーサー', icon: '↕️',
    defaultProps: { height: 30, bgColor: 'transparent' },
    propSchema: [
      { key: 'height',  type: 'number', label: '高さ (px)', min: 4, max: 120 },
      { key: 'bgColor', type: 'color',  label: '背景色' },
    ],
    toHTML(p) {
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr><td height="${p.height}" style="font-size:0;line-height:0;">&nbsp;</td></tr></table>`,
        p.bgColor || 'transparent', '0'
      );
    },
  },

  // ── SNS（アイコン＋テキスト） ───────────────────────────────────────────────
  {
    id: 'social-text', name: 'SNS（アイコン＋テキスト）', icon: '🔗',
    defaultProps: {
      bgColor: '#f8f8f8', iconSize: 22, align: 'center', padding: '20px 30px', textColor: '#4a4a4a',
      items: [
        { name: 'twitter',   href: '#', label: 'X',        iconBg: '#000000' },
        { name: 'instagram', href: '#', label: 'Instagram', iconBg: '#E1306C' },
        { name: 'facebook',  href: '#', label: 'Facebook',  iconBg: '#1877F2' },
      ],
    },
    propSchema: [
      { key: 'bgColor',   type: 'color',  label: '背景色' },
      { key: 'textColor', type: 'color',  label: 'テキスト色' },
      { key: 'iconSize',  type: 'number', label: 'アイコンサイズ (px)', min: 16, max: 48 },
      { key: 'items',     type: 'social-list', label: 'SNSアカウント' },
    ],
    toHTML(p) {
      const half = Math.round(p.iconSize / 2);
      const cols = p.items.map(it => {
        const imgOrLetter = _iconImg(it.name, p.iconSize);
        const bg = SNS_BGCOLOR[it.name] || it.iconBg || '#555';
        const isCDN = imgOrLetter.includes('clearbit.com') || imgOrLetter.includes('logo.');
        const cell = isCDN
          ? `<td align="center" bgcolor="${bg}" width="${p.iconSize}" height="${p.iconSize}" style="border-radius:${half}px;">${imgOrLetter}</td>`
          : imgOrLetter.startsWith('<img')
            ? `<td align="center" width="${p.iconSize}" height="${p.iconSize}" style="border-radius:${half}px;overflow:hidden;">${imgOrLetter}</td>`
            : `<td align="center" bgcolor="${bg}" width="${p.iconSize}" height="${p.iconSize}" style="border-radius:${half}px;">${imgOrLetter}</td>`;
        return `<td align="center" style="padding:0 6px;">
<a href="${escAttr(it.href)}" style="text-decoration:none;display:inline-block;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr>
${cell}
<td style="padding-left:6px;font-family:Arial,sans-serif;font-size:13px;color:${p.textColor};vertical-align:middle;">${it.label ? `<a href="${escAttr(it.href)}" style="color:${p.textColor};text-decoration:none;">${it.label}</a>` : ''}</td>
</tr></table>
</a>
</td>`;
      }).join('');
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;"><tr>${cols}</tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── SNS（アイコンのみ） ─────────────────────────────────────────────────────
  {
    id: 'social-icons', name: 'SNS（アイコンのみ）', icon: '⬡',
    defaultProps: {
      bgColor: '#f8f8f8', iconSize: 32, align: 'center', padding: '20px 30px',
      items: [
        { name: 'twitter',   href: '#', label: '', iconBg: '#000000' },
        { name: 'instagram', href: '#', label: '', iconBg: '#E1306C' },
        { name: 'facebook',  href: '#', label: '', iconBg: '#1877F2' },
      ],
    },
    propSchema: [
      { key: 'bgColor',  type: 'color',  label: '背景色' },
      { key: 'iconSize', type: 'number', label: 'アイコンサイズ (px)', min: 20, max: 60 },
      { key: 'items',    type: 'social-list', label: 'SNSアカウント（ラベル不使用）' },
    ],
    toHTML(p) {
      const half = Math.round(p.iconSize / 2);
      const cols = p.items.map(it => {
        const imgOrLetter = _iconImg(it.name, p.iconSize);
        const bg = SNS_BGCOLOR[it.name] || it.iconBg || '#555';
        const isCDN = imgOrLetter.includes('clearbit.com') || imgOrLetter.includes('logo.');
        const cell = isCDN
          ? `<td align="center" bgcolor="${bg}" width="${p.iconSize}" height="${p.iconSize}" style="border-radius:${half}px;">${imgOrLetter}</td>`
          : imgOrLetter.startsWith('<img')
            ? `<td align="center" width="${p.iconSize}" height="${p.iconSize}" style="border-radius:${half}px;overflow:hidden;">${imgOrLetter}</td>`
            : `<td align="center" bgcolor="${bg}" width="${p.iconSize}" height="${p.iconSize}" style="border-radius:${half}px;">${imgOrLetter}</td>`;
        return `<td align="center" style="padding:0 4px;">
<a href="${escAttr(it.href)}" style="text-decoration:none;display:block;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr>
${cell}
</tr></table>
</a>
</td>`;
      }).join('');
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;"><tr>${cols}</tr></table>`,
        p.bgColor, p.padding
      );
    },
  },

  // ── フッター ────────────────────────────────────────────────────────────────
  {
    id: 'footer', name: 'フッター', icon: '📋',
    defaultProps: {
      bgColor: '#1a1a2e', textColor: 'rgba(255,255,255,.6)', linkColor: '#4f8ef7',
      companyName: 'Company Name', address: '〒000-0000 東京都○○区○○町1-1-1',
      showAddress: true, unsubscribeText: '配信停止', unsubscribeUrl: '#',
      padding: '24px 30px',
    },
    propSchema: [
      { key: 'bgColor',         type: 'color',  label: '背景色' },
      { key: 'textColor',       type: 'color',  label: 'テキスト色' },
      { key: 'linkColor',       type: 'color',  label: 'リンク色' },
      { key: 'companyName',     type: 'text',   label: '会社名' },
      { key: 'showAddress',     type: 'toggle', label: '住所表示' },
      { key: 'address',         type: 'text',   label: '住所' },
      { key: 'unsubscribeText', type: 'text',   label: '配信停止テキスト' },
      { key: 'unsubscribeUrl',  type: 'url',    label: '配信停止URL' },
    ],
    toHTML(p) {
      const addr = p.showAddress ? `<br>${p.address}` : '';
      const year = new Date().getFullYear();
      return section(
        `<table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tr>
<td align="center" style="font-family:Arial,sans-serif;font-size:12px;color:${p.textColor};line-height:1.8;">
© ${year} ${p.companyName}. All rights reserved.${addr}<br>
<a href="${escAttr(p.unsubscribeUrl)}" style="color:${p.linkColor};text-decoration:underline;">${p.unsubscribeText}</a>
</td></tr></table>`,
        p.bgColor, p.padding
      );
    },
  },
];
