import 'dotenv/config';
import nodemailer from 'nodemailer';

const BRAND = { ink: '#08111c', soft: '#101d2b', panel: '#142538', line: '#29445a', paper: '#f5f1e8', muted: '#9eacb9', accent: '#ef9b4a', bright: '#ffc16d', success: '#5cc7a1' };

const smtpConfig = () => {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (!user || !pass) throw new Error('SMTP credentials are not configured');
  const port = Number(process.env.SMTP_PORT || 587);
  const from = (process.env.EMAIL_FROM || `TOP SPEED <${user}>`).trim();
  return { user, pass, port, from };
};

const transporter = () => {
  const { user, pass, port } = smtpConfig();
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass }, connectionTimeout: 15000, socketTimeout: 20000,
  });
};

const transactionalHeaders = {
  'X-Mailer': 'TOP SPEED Transactional Mail',
  'X-Auto-Response-Suppress': 'All',
};

const escapeHtml = (input) => String(input ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
const text = (input, fallback = 'Not provided') => escapeHtml(input || fallback);
const date = (input) => {
  if (!input) return 'Not scheduled';
  const [year, month, day] = String(input).split('-').map(Number);
  if (year && month && day) return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return escapeHtml(input);
};
const row = (label, content) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${BRAND.line};color:${BRAND.muted};font-size:12px;width:38%;">${escapeHtml(label)}</td><td style="padding:10px 0;border-bottom:1px solid ${BRAND.line};color:${BRAND.paper};font-size:13px;font-weight:600;text-align:right;">${content}</td></tr>`;
const section = (title, content) => `<div style="margin-bottom:25px"><div style="margin-bottom:10px;color:${BRAND.bright};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${escapeHtml(title)}</div>${content}</div>`;

const shell = ({ eyebrow, title, intro, content, accent = BRAND.accent }) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#e8ecee;font-family:Arial,Helvetica,sans-serif"><div style="padding:24px 10px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:650px;margin:auto;background:${BRAND.ink};border:1px solid ${BRAND.line}"><tr><td style="height:5px;background:${accent}"></td></tr><tr><td bgcolor="${BRAND.ink}" style="padding:28px 30px 26px;background-color:${BRAND.ink};background:linear-gradient(135deg,${BRAND.ink},${BRAND.panel})"><table role="presentation" width="100%"><tr><td style="color:${BRAND.paper};font:22px Georgia,serif;letter-spacing:.04em">TOP <span style="color:${accent}">SPEED</span></td><td align="right" style="color:${BRAND.muted};font-size:9px;letter-spacing:2px;text-transform:uppercase">Performance / Craft</td></tr></table><div style="margin-top:30px;color:${accent};font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase">${escapeHtml(eyebrow)}</div><h1 style="margin:10px 0 0;color:${BRAND.paper};font:400 30px/1.15 Georgia,serif">${escapeHtml(title)}</h1><p style="max-width:520px;margin:12px 0 0;color:${BRAND.muted};font-size:14px;line-height:1.65">${intro}</p></td></tr><tr><td style="padding:30px;background:${BRAND.panel}">${content}</td></tr><tr><td style="padding:22px 30px;background:${BRAND.soft};border-top:1px solid ${BRAND.line}"><div style="color:${BRAND.bright};font:16px Georgia,serif">TOP SPEED</div><div style="margin-top:6px;color:${BRAND.muted};font-size:12px">Premium automotive service &amp; craft</div><div style="margin-top:13px;color:#718391;font-size:11px">Automated message from Top Speed. Reply to this email if you need assistance.</div></td></tr></table></div></body></html>`;

const modificationNames = { exhaust: 'Performance Exhaust System', engine: 'Engine Tuning & Optimization', brakes: 'Brake System Upgrade', carBody: 'Body Kit & Aerodynamics', colors: 'Custom Paint & Colors' };
const selectedMods = (input = {}) => Object.entries(input).filter(([, selected]) => selected === true).map(([key]) => modificationNames[key] || key);
const detailsForModification = (request, selected) => `${section('Client information', `<table role="presentation" width="100%">${row('Name', text(request.clientName))}${row('Email', text(request.email))}${row('Phone', text(request.phoneNumber))}${request.address ? row('Address', text(request.address)) : ''}</table>`)}${section('Vehicle & timing', `<table role="presentation" width="100%">${row('Vehicle', text(request.carType))}${row('Timeline', text(String(request.maintenanceTime || 'Not specified').replace(/_/g, ' ')))}${row('Preferred date', date(request.desiredDay))}</table>`)}${section('Selected modifications', `<div style="padding:16px 18px;background:${BRAND.soft};color:${BRAND.paper};font-size:13px;line-height:1.9">${selected.map((item) => `<div><span style="color:${BRAND.accent}">&#9670;</span>&nbsp;${escapeHtml(item)}</div>`).join('')}</div>`)}`;
const detailsForMaintenance = (request) => `${section('Client information', `<table role="presentation" width="100%">${row('Name', text(request.clientName))}${row('Email', text(request.email))}${row('Phone', text(request.phoneNumber))}${row('Address', text(request.address))}</table>`)}${section('Vehicle', `<table role="presentation" width="100%">${row('Vehicle', text(request.carType))}</table>`)}${section('Reported issue', `<div style="padding:17px 18px;background:${BRAND.soft};border-left:3px solid ${BRAND.success}"><div style="color:${BRAND.paper};font-size:14px;font-weight:700">${text(request.issueCategory)}</div><div style="margin-top:8px;color:${BRAND.muted};font-size:13px;line-height:1.7">${text(request.issueDescription)}</div></div>`)}`;

const confirmation = (request, type, accent) => { const focus = type === 'modification' ? selectedMods(request.modifications).map(escapeHtml).join(', ') : text(request.issueCategory); return `${section('Your vehicle', `<table role="presentation" width="100%">${row('Vehicle', text(request.carType))}${row(type === 'modification' ? 'Focus' : 'Issue', focus)}</table>`)}<div style="padding:18px 20px;background:${BRAND.soft};border-left:3px solid ${accent}"><div style="color:${BRAND.bright};font-size:13px;font-weight:700">What happens next</div><div style="margin-top:10px;color:${BRAND.muted};font-size:13px;line-height:1.8">Our team will review your request, contact you within 24 hours, and confirm the right plan, timing, and quote with you.</div></div><p style="color:${BRAND.muted};font-size:13px;line-height:1.7">Hello ${text(request.clientName)}, we will be in touch shortly to confirm the details.</p>`; };

const sendRequestEmails = async ({ request, type, details, plainText, subject, clientSubject }) => {
  const mailer = transporter(); await mailer.verify();
  const accent = type === 'modification' ? BRAND.accent : BRAND.success;
  const { from } = smtpConfig();
  const team = process.env.TEAM_EMAIL || from;
  const adminHtml = shell({ eyebrow: 'New request / team action', title: type === 'modification' ? 'Modification request' : 'Service request', intro: type === 'modification' ? 'A new vehicle vision has arrived. Review the brief and connect with the client to shape the next step.' : 'A client has requested expert attention for their vehicle. Review the details and arrange the right care.', accent, content: `${details}<div style="color:${BRAND.muted};font-size:12px">Reply directly to the client to confirm availability, scope, and pricing.</div>` });
  const clientHtml = shell({ eyebrow: 'Top Speed / request received', title: 'We have your request', intro: 'Thank you for trusting Top Speed with your vehicle. Your request is now with our team.', accent, content: confirmation(request, type, accent) });
  await mailer.sendMail({ from, to: team, subject, text: plainText, html: adminHtml, replyTo: request.email, headers: transactionalHeaders });
  await mailer.sendMail({ from, to: request.email, subject: clientSubject, text: `Hello ${request.clientName},\n\nWe have received your Top Speed request and will contact you within 24 hours.`, html: clientHtml, headers: transactionalHeaders });
};

export const sendModificationRequestEmail = async (requestData) => {
  const selected = selectedMods(requestData.modifications);
  await sendRequestEmails({ request: requestData, type: 'modification', details: detailsForModification(requestData, selected), plainText: `TOP SPEED - MODIFICATION REQUEST\n\nClient: ${requestData.clientName}\nEmail: ${requestData.email}\nPhone: ${requestData.phoneNumber}\nAddress: ${requestData.address || 'Not provided'}\nVehicle: ${requestData.carType}\nTimeline: ${requestData.maintenanceTime || 'Not specified'}\nPreferred date: ${requestData.desiredDay || 'Not scheduled'}\nModifications: ${selected.join(', ')}`, subject: `Top Speed / New modification request / ${requestData.clientName}`, clientSubject: 'Top Speed / Your modification request is with us' });
  return { success: true, message: 'Modification request sent successfully' };
};

export const sendMaintenanceRequestEmail = async (requestData) => {
  await sendRequestEmails({ request: requestData, type: 'maintenance', details: detailsForMaintenance(requestData), plainText: `TOP SPEED - SERVICE REQUEST\n\nClient: ${requestData.clientName}\nEmail: ${requestData.email}\nPhone: ${requestData.phoneNumber}\nAddress: ${requestData.address}\nVehicle: ${requestData.carType}\nIssue: ${requestData.issueCategory}\nDetails: ${requestData.issueDescription}`, subject: `Top Speed / New service request / ${requestData.clientName}`, clientSubject: 'Top Speed / Your service request is with us' });
  return { success: true, message: 'Maintenance request sent successfully' };
};

export const sendOTPEmail = async (email, userName, otp) => {
  const { from } = smtpConfig(); const mailer = transporter(); await mailer.verify();
  const html = shell({ eyebrow: 'Account verification', title: 'Confirm your email', intro: 'One last step before you enter the Top Speed experience.', content: `<p style="color:${BRAND.paper};font-size:14px">Hello ${text(userName)},</p><div style="margin:26px 0;padding:25px 18px;text-align:center;background:${BRAND.soft};border:1px solid ${BRAND.line}"><div style="color:${BRAND.muted};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase">Your verification code</div><div style="margin-top:12px;color:${BRAND.bright};font:700 40px 'Courier New',monospace;letter-spacing:7px">${escapeHtml(otp)}</div><div style="margin-top:12px;color:${BRAND.muted};font-size:12px">Expires in 10 minutes</div></div><p style="color:${BRAND.muted};font-size:13px;line-height:1.7">Enter this code on the verification screen. Never share it with anyone, including someone claiming to be Top Speed support.</p>` });
  await mailer.sendMail({ from, to: email, subject: 'Top Speed | Email verification code', text: `Hello ${userName},\n\nYour Top Speed email verification code is ${otp}.\n\nThis code expires in 10 minutes. If you did not create a Top Speed account, you can ignore this email.\n\nTop Speed`, html, headers: transactionalHeaders, category: 'account-verification', priority: 'normal' });
  return { success: true };
};
