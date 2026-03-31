import type { Lead } from '@/types'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildEmailHtml(_lead: Lead, body: string) {
  const lines = body.split('\n')
  let inBox = false
  const segments: string[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (line.startsWith('[[')) {
      inBox = true
      const rest = line.slice(2).trim()
      segments.push(`<table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border-radius:10px;overflow:hidden;border:1.5px solid #e0e7ff;background:#f5f3ff;">
        <tr><td style="padding:16px 20px 8px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;color:#6366f1;text-transform:uppercase;">What most agents deal with</p>`)
      if (rest) {
        segments.push(`<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;font-style:italic;">${escapeHtml(rest)}</p>`)
      }
      continue
    }

    if (line === ']]' || line.endsWith(']]')) {
      const beforeClose = line === ']]' ? '' : line.slice(0, -2).trim()
      if (beforeClose) {
        const text = beforeClose.startsWith('•') ? beforeClose.slice(1).trim() : beforeClose
        segments.push(`<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
        <div style="width:8px;height:8px;background:#6366f1;border-radius:50%;margin-top:7px;flex-shrink:0;"></div>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-weight:500;">${escapeHtml(text)}</p>
      </div>`)
      }
      inBox = false
      segments.push(`</td></tr></table>`)
      continue
    }

    if (inBox) {
      const text = line.startsWith('•') ? line.slice(1).trim() : line
      segments.push(`<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
        <div style="width:8px;height:8px;background:#6366f1;border-radius:50%;margin-top:7px;flex-shrink:0;"></div>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-weight:500;">${escapeHtml(text)}</p>
      </div>`)
      continue
    }

    if (line === '') {
      segments.push('<br/>')
    } else {
      segments.push(`<p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.8;">${escapeHtml(line)}</p>`)
    }
  }

  const bodyHtml = segments.join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <tr>
          <td style="padding:0;margin:0;">
            <img src="https://cloud.inference.sh/app/files/u/64cky3p22fmmvttcyq2q640b1s/01kmqcj2zqr8xpc28rbk3824wx.png"
                 alt="Header"
                 width="600"
                 style="display:block;width:100%;max-width:600px;height:auto;" />
          </td>
        </tr>

        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:24px 40px 26px;">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;letter-spacing:0.3px;">24/7 EMAIL AUTOMATION FOR REAL ESTATE AGENTS</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#a5b4fc;">From Ambrose Voon</p>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 40px 24px;">
            ${bodyHtml}
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://cal.com/ambrose-voon-5qy2sm"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">
              Book a Quick Chat →
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 36px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#1f2937;">Ambrose Voon</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Real Estate Tech Advisor</p>
            <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
              <a href="tel:0478495661" style="color:#6366f1;text-decoration:none;">0478 495 661</a>
              &nbsp;·&nbsp;
              <a href="mailto:ambrosevoon@gmail.com" style="color:#6366f1;text-decoration:none;">ambrosevoon@gmail.com</a>
            </p>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">You're receiving this because your agency was suggested as a great fit for smarter outreach. No hard feelings if it's not for you. Just reply "unsubscribe" and I'll remove you immediately.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
