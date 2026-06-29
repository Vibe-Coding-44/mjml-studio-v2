'use strict';

function sectionToHTML(section, gs) {
  const comp = COMPONENTS.find(c => c.id === section.type);
  return comp ? comp.toHTML(section.props, gs) : '';
}

function buildEmailHTML(sections, gs) {
  const fontFamily    = String(gs.fontFamily    || 'Helvetica Neue, Arial, sans-serif').replace(/"/g, "'");
  const bgColor       = String(gs.bgColor       || '#f4f4f4').replace(/["<>]/g, '');
  const primaryColor  = String(gs.primaryColor  || '#4f8ef7').replace(/["<>]/g, '');
  const mw            = parseInt(gs.maxWidth, 10)   || 600;
  const fs            = parseInt(gs.baseFontSize, 10) || 15;
  const lh            = parseFloat(gs.lineHeight)    || 1.8;

  const body = sections.map(s => sectionToHTML(s, gs)).filter(Boolean).join('\n');

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="ja">
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title></title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<![endif]-->
<style>
*{box-sizing:border-box}
body,#bodyTable{margin:0;padding:0;width:100%}
body{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:${bgColor};font-family:${fontFamily};font-size:${fs}px;line-height:${lh};color:#333}
table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt}
img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block}
a{color:${primaryColor};text-decoration:none}
p{margin:0 0 1em}
.email-container{max-width:${mw}px;margin:0 auto}
@media only screen and (max-width:${mw}px){
  .email-container{width:100%!important}
  .fluid{max-width:100%!important;height:auto!important;width:100%!important}
  .stack-col{display:block!important;width:100%!important;max-width:100%!important;padding-right:0!important;padding-left:0!important}
}
</style>
</head>
<body>
<table id="bodyTable" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color:${bgColor};">
<tr><td align="center" valign="top">
<!--[if mso]><table border="0" cellpadding="0" cellspacing="0" width="${mw}"><tr><td><![endif]-->
<div class="email-container">
${body}
</div>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

let _lastHtml = '';
scheduleRender._timer = null;

function renderToIframe(sections, globalStyle, iframeEl) {
  try {
    const html = buildEmailHTML(sections, globalStyle);
    _lastHtml  = html;
    const doc  = iframeEl.contentDocument || iframeEl.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    return { ok: true, errors: [] };
  } catch (err) {
    return { ok: false, errors: [{ message: err.message }] };
  }
}

function scheduleRender(sections, globalStyle, iframeEl, errorEl) {
  clearTimeout(scheduleRender._timer);
  scheduleRender._timer = setTimeout(() => {
    const { ok, errors } = renderToIframe(sections, globalStyle, iframeEl);
    if (!ok || errors.length > 0) {
      errorEl.textContent = errors.map(e => `⚠️ ${e.message}`).join('\n');
      errorEl.classList.remove('hidden');
    } else {
      errorEl.classList.add('hidden');
    }
  }, 350);
}

function getLastHtml() { return _lastHtml; }
