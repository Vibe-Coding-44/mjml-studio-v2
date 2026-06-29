'use strict';

function _newSec(type, propsOverride) {
  const comp = COMPONENTS.find(c => c.id === type);
  return { id: crypto.randomUUID(), type, props: { ...comp.defaultProps, ...propsOverride } };
}

const PRESET_TEMPLATES = [
  {
    id: 'blank',
    name: 'ブランク',
    desc: '空白から開始',
    svg: `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" fill="#f4f4f4"/><text x="60" y="44" text-anchor="middle" font-size="12" fill="#aaa">BLANK</text></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: [],
  },
  {
    id: '002',
    name: 'ベーシックニュース',
    desc: 'Header + Hero + Text + SNS + Footer',
    svg: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="160" fill="#fff"/><rect y="0" width="120" height="18" fill="#1a1a2e"/><rect y="22" width="120" height="40" fill="#4f8ef7"/><rect x="10" y="68" width="100" height="5" rx="2" fill="#ddd"/><rect x="10" y="76" width="80" height="4" rx="2" fill="#eee"/><rect x="10" y="83" width="90" height="4" rx="2" fill="#eee"/><rect y="100" width="120" height="16" fill="#f8f8f8"/><rect y="120" width="120" height="16" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('header'),
      _newSec('hero'),
      _newSec('text'),
      _newSec('social-text'),
      _newSec('footer'),
    ],
  },
  {
    id: '003',
    name: '画像フォーカス',
    desc: 'Header + Image + 2カラム + SNS + Footer',
    svg: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="160" fill="#fff"/><rect y="0" width="120" height="18" fill="#1a1a2e"/><rect y="22" width="120" height="35" fill="#dde4ee"/><rect x="10" y="62" width="45" height="28" fill="#e8e8e8"/><rect x="62" y="62" width="48" height="28" fill="#e8e8e8"/><rect y="100" width="120" height="16" fill="#f8f8f8"/><rect y="120" width="120" height="16" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('header'),
      _newSec('image'),
      _newSec('twocol'),
      _newSec('social-text'),
      _newSec('footer'),
    ],
  },
  {
    id: '004',
    name: 'マルチカラム',
    desc: 'Header + 見出し + 3カラム + SNS + Footer',
    svg: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="160" fill="#fff"/><rect y="0" width="120" height="18" fill="#1a1a2e"/><rect x="10" y="24" width="70" height="8" rx="2" fill="#bbb"/><rect x="5" y="38" width="34" height="40" fill="#e8e8e8"/><rect x="43" y="38" width="34" height="40" fill="#e8e8e8"/><rect x="81" y="38" width="34" height="40" fill="#e8e8e8"/><rect y="86" width="120" height="16" fill="#f8f8f8"/><rect y="106" width="120" height="16" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('header'),
      _newSec('heading', { text: 'セクション見出し' }),
      _newSec('twocol'),
      _newSec('social-text'),
      _newSec('footer'),
    ],
  },
  {
    id: '005',
    name: 'プロモーション',
    desc: '大画像 + 2カラム（ボタン）+ SNS + Footer',
    svg: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="160" fill="#fff"/><rect y="0" width="120" height="45" fill="#dde4ee"/><rect x="5" y="52" width="50" height="36" fill="#e8e8e8"/><rect x="62" y="52" width="53" height="36" fill="#e8e8e8"/><rect x="20" y="96" width="30" height="8" rx="3" fill="#4f8ef7"/><rect x="70" y="96" width="30" height="8" rx="3" fill="#4f8ef7"/><rect y="112" width="120" height="14" fill="#f8f8f8"/><rect y="130" width="120" height="14" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('image', { src: 'https://placehold.co/600x300/4f8ef7/fff?text=PROMOTION' }),
      _newSec('twocol', { leftButtonText: 'もっと見る', rightButtonText: '購入する' }),
      _newSec('social-text'),
      _newSec('footer'),
    ],
  },
  {
    id: '006',
    name: 'コンテンツリッチ',
    desc: 'Header + Hero + 区切り + Text + Button + SNS + Footer',
    svg: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="180" fill="#fff"/><rect y="0" width="120" height="16" fill="#1a1a2e"/><rect y="20" width="120" height="36" fill="#4f8ef7"/><rect y="60" width="120" height="1" fill="#ddd"/><rect x="10" y="67" width="80" height="5" rx="2" fill="#ddd"/><rect x="10" y="75" width="100" height="4" rx="2" fill="#eee"/><rect x="10" y="82" width="90" height="4" rx="2" fill="#eee"/><rect x="40" y="94" width="40" height="10" rx="4" fill="#4f8ef7"/><rect y="112" width="120" height="14" fill="#f8f8f8"/><rect y="130" width="120" height="14" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('header'),
      _newSec('hero'),
      _newSec('divider'),
      _newSec('text'),
      _newSec('button'),
      _newSec('social-text'),
      _newSec('footer'),
    ],
  },
  {
    id: '007',
    name: '画像多用型',
    desc: 'Header + Image + 2カラム x2 + Footer',
    svg: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="180" fill="#fff"/><rect y="0" width="120" height="16" fill="#1a1a2e"/><rect y="20" width="120" height="32" fill="#dde4ee"/><rect x="5" y="58" width="50" height="32" fill="#e8e8e8"/><rect x="63" y="58" width="52" height="32" fill="#e8e8e8"/><rect x="5" y="98" width="50" height="32" fill="#e8e8e8"/><rect x="63" y="98" width="52" height="32" fill="#e8e8e8"/><rect y="138" width="120" height="14" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f4f4f4', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('header'),
      _newSec('image'),
      _newSec('twocol', { leftImageUrl: 'https://placehold.co/280x200/dde4ee/888?text=L', rightImageUrl: 'https://placehold.co/280x200/dde4ee/888?text=R' }),
      _newSec('twocol', { leftImageUrl: 'https://placehold.co/280x200/dde4ee/888?text=L', rightImageUrl: 'https://placehold.co/280x200/dde4ee/888?text=R' }),
      _newSec('footer'),
    ],
  },
  {
    id: '008',
    name: 'シンプルお知らせ',
    desc: 'Header + Heading + Text + Button + Footer',
    svg: `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="160" fill="#fff"/><rect y="0" width="120" height="16" fill="#1a1a2e"/><rect x="10" y="22" width="60" height="8" rx="2" fill="#bbb"/><rect x="10" y="36" width="100" height="4" rx="2" fill="#eee"/><rect x="10" y="43" width="95" height="4" rx="2" fill="#eee"/><rect x="10" y="50" width="85" height="4" rx="2" fill="#eee"/><rect x="40" y="62" width="40" height="10" rx="4" fill="#4f8ef7"/><rect y="86" width="120" height="14" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#ffffff', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#4f8ef7', maxWidth: 600 },
    sections: () => [
      _newSec('header'),
      _newSec('heading', { text: 'お知らせタイトル' }),
      _newSec('text'),
      _newSec('button'),
      _newSec('footer'),
    ],
  },
  {
    id: '009',
    name: 'ECメルマガ',
    desc: '商品紹介・ショッピングサイト向け',
    svg: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="180" fill="#f9f9f9"/><rect y="0" width="120" height="16" fill="#1a1a2e"/><rect y="20" width="120" height="38" fill="#ffe8e8"/><rect x="5" y="64" width="52" height="36" fill="#e8e8e8"/><rect x="63" y="64" width="52" height="36" fill="#e8e8e8"/><rect x="5" y="106" width="52" height="36" fill="#e8e8e8"/><rect x="63" y="106" width="52" height="36" fill="#e8e8e8"/><rect x="35" y="150" width="50" height="10" rx="4" fill="#e53e3e"/><rect y="168" width="120" height="12" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#f9f9f9', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#e53e3e', maxWidth: 600 },
    sections: () => [
      _newSec('header', { logoText: 'SHOP' }),
      _newSec('hero', { bgColor: '#ffe8e8', title: '今週のおすすめ商品', titleColor: '#c0392b', subtitle: '期間限定セール開催中', subtitleColor: '#e53e3e', buttonText: '今すぐ購入', buttonBgColor: '#e53e3e', buttonTextColor: '#ffffff' }),
      _newSec('twocol', { leftImageUrl: 'https://placehold.co/280x200/ffe8e8/c0392b?text=商品A', rightImageUrl: 'https://placehold.co/280x200/ffe8e8/c0392b?text=商品B' }),
      _newSec('twocol', { leftImageUrl: 'https://placehold.co/280x200/ffe8e8/c0392b?text=商品C', rightImageUrl: 'https://placehold.co/280x200/ffe8e8/c0392b?text=商品D' }),
      _newSec('button', { buttonText: 'すべての商品を見る', buttonBgColor: '#e53e3e' }),
      _newSec('footer'),
    ],
  },
  {
    id: '010',
    name: 'イベント案内',
    desc: 'セミナー・展示会・ライブイベント向け',
    svg: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="180" fill="#0f0f1a"/><rect y="0" width="120" height="16" fill="#1a1230"/><rect y="20" width="120" height="55" fill="#2d1b69"/><rect x="10" y="82" width="50" height="7" rx="2" fill="#805ad5"/><rect x="10" y="95" width="100" height="4" rx="2" fill="#444"/><rect x="10" y="103" width="90" height="4" rx="2" fill="#444"/><rect x="10" y="111" width="95" height="4" rx="2" fill="#444"/><rect x="30" y="124" width="60" height="11" rx="4" fill="#805ad5"/><rect y="148" width="120" height="12" fill="#1a1230"/></svg>`,
    globalStyle: { bgColor: '#0f0f1a', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#805ad5', maxWidth: 600 },
    sections: () => [
      _newSec('header', { bgColor: '#1a1230', textColor: '#c4b5fd' }),
      _newSec('hero', { bgColor: '#2d1b69', title: 'EVENT TITLE', titleColor: '#ffffff', subtitle: '2024年12月XX日（土）開催', subtitleColor: '#c4b5fd', buttonText: '参加申込はこちら', buttonBgColor: '#805ad5', buttonTextColor: '#ffffff' }),
      _newSec('heading', { bgColor: '#0f0f1a', text: 'イベント詳細', textColor: '#c4b5fd' }),
      _newSec('text', { bgColor: '#0f0f1a', textColor: '#cccccc' }),
      _newSec('button', { bgColor: '#0f0f1a', buttonText: '詳細・申込ページへ', buttonBgColor: '#805ad5' }),
      _newSec('footer', { bgColor: '#1a1230', textColor: '#888888' }),
    ],
  },
  {
    id: '011',
    name: '定期メルマガ',
    desc: '記事まとめ・週刊ダイジェスト形式',
    svg: `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="200" fill="#fff"/><rect y="0" width="120" height="16" fill="#1a1a2e"/><rect x="10" y="22" width="70" height="7" rx="2" fill="#2d6a4f"/><rect x="10" y="35" width="100" height="3" rx="1" fill="#eee"/><rect x="10" y="41" width="95" height="3" rx="1" fill="#eee"/><rect x="10" y="47" width="85" height="3" rx="1" fill="#eee"/><rect y="57" width="120" height="1" fill="#ddd"/><rect x="10" y="64" width="65" height="6" rx="2" fill="#2d6a4f"/><rect x="10" y="76" width="100" height="3" rx="1" fill="#eee"/><rect x="10" y="82" width="90" height="3" rx="1" fill="#eee"/><rect x="10" y="88" width="95" height="3" rx="1" fill="#eee"/><rect y="98" width="120" height="1" fill="#ddd"/><rect x="35" y="106" width="50" height="9" rx="3" fill="#2d6a4f"/><rect y="124" width="120" height="12" fill="#f4f4f4"/><rect y="140" width="120" height="12" fill="#1a1a2e"/></svg>`,
    globalStyle: { bgColor: '#ffffff', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#2d6a4f', maxWidth: 600 },
    sections: () => [
      _newSec('header', { bgColor: '#1a1a2e' }),
      _newSec('heading', { text: '今週のダイジェスト', textColor: '#2d6a4f' }),
      _newSec('text'),
      _newSec('divider'),
      _newSec('heading', { text: 'トピック 2', textColor: '#2d6a4f' }),
      _newSec('text'),
      _newSec('divider'),
      _newSec('button', { buttonText: '記事をすべて読む', buttonBgColor: '#2d6a4f' }),
      _newSec('social-text'),
      _newSec('footer'),
    ],
  },
  {
    id: '012',
    name: '季節キャンペーン',
    desc: '期間限定セール・季節イベント向け',
    svg: `<svg viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="180" fill="#fffbf0"/><rect y="0" width="120" height="16" fill="#7b4f12"/><rect y="20" width="120" height="48" fill="#f6ad55"/><rect x="10" y="74" width="65" height="7" rx="2" fill="#7b4f12"/><rect x="10" y="87" width="100" height="3" rx="1" fill="#ddd"/><rect x="10" y="93" width="90" height="3" rx="1" fill="#ddd"/><rect x="5" y="104" width="52" height="9" rx="3" fill="#dd6b20"/><rect x="63" y="104" width="52" height="9" rx="3" fill="#7b4f12"/><rect y="124" width="120" height="14" fill="#f4f4f4"/><rect y="142" width="120" height="14" fill="#7b4f12"/></svg>`,
    globalStyle: { bgColor: '#fffbf0', fontFamily: 'Helvetica Neue, Arial, sans-serif', primaryColor: '#dd6b20', maxWidth: 600 },
    sections: () => [
      _newSec('header', { bgColor: '#7b4f12', textColor: '#fffbf0', logoText: 'CAMPAIGN' }),
      _newSec('hero', { bgColor: '#f6ad55', title: '季節限定キャンペーン', titleColor: '#7b4f12', subtitle: '期間限定！お見逃しなく', subtitleColor: '#92400e', showButton: false }),
      _newSec('heading', { text: 'キャンペーン詳細', textColor: '#7b4f12', bgColor: '#fffbf0' }),
      _newSec('text', { bgColor: '#fffbf0', textColor: '#4a3000' }),
      _newSec('twocol', { leftButtonText: '今すぐ購入', rightButtonText: '詳細を見る' }),
      _newSec('social-text'),
      _newSec('footer', { bgColor: '#7b4f12', textColor: '#fffbf0' }),
    ],
  },
];

function templateGetAll() { return PRESET_TEMPLATES; }
function templateGet(id) { return PRESET_TEMPLATES.find(t => t.id === id) || null; }
function templateBuild(id) {
  const t = templateGet(id);
  if (!t) return null;
  const sections = typeof t.sections === 'function' ? t.sections() : [];
  return { globalStyle: { ...t.globalStyle }, sections };
}
