/**
 * Portfolio contact form handler (Google Apps Script web app).
 *
 * Setup:
 *   1. Go to https://script.google.com while signed in as joykamau123@gmail.com
 *      and create a New project.
 *   2. Replace the default code with this file and save.
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   4. Authorize the Gmail permission when prompted.
 *   5. Copy the Web app URL (ends in /exec) into CONTACT_ENDPOINT in index.html.
 *
 * After editing this script, publish changes via Deploy > Manage deployments >
 * Edit > Version: New version, so the same /exec URL keeps working.
 */

const RECIPIENT = 'joykamau123@gmail.com';

// Portfolio brand colours
const INDIGO = '#1e1b4b';
const INDIGO_SOFT = '#312e81';
const GOLD = '#fbbf24';
const TEXT = '#1f2937';
const MUTED = '#6b7280';

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Hidden honeypot field: real visitors leave it empty, bots fill it in.
  if (p.website) return json({ success: true });

  const name = clean(p.name, 100);
  const email = clean(p.email, 150);
  const country = clean(p.country, 100) || 'Not specified';
  const countryCode = /^[A-Za-z]{2}$/.test(p.countryCode || '') ? p.countryCode.toLowerCase() : '';
  const sector = clean(p.sector, 100) || 'Not specified';
  const message = clean(p.message, 5000);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, message: 'Missing or invalid fields' });
  }

  const sentAt = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy, h:mm a');

  MailApp.sendEmail({
    to: RECIPIENT,
    replyTo: email,
    name: 'Portfolio Contact Form',
    subject: 'New portfolio enquiry from ' + name,
    htmlBody: buildEmail({ name, email, country, countryCode, sector, message, sentAt }),
    body:
      'New portfolio enquiry\n\n' +
      'Name: ' + name + '\nEmail: ' + email + '\nCountry: ' + country + '\nIndustry: ' + sector +
      '\n\nMessage:\n' + message + '\n\nReceived ' + sentAt,
  });

  return json({ success: true });
}

function buildEmail(d) {
  const flag = d.countryCode
    ? '<img src="https://flagcdn.com/24x18/' + d.countryCode + '.png" width="24" height="18" alt="" ' +
      'style="vertical-align:-3px;margin-right:8px;border-radius:2px;border:0">'
    : '';
  const replyLink =
    'mailto:' + d.email + '?subject=' + encodeURIComponent('Re: Your enquiry on my portfolio');

  return (
    '<div style="margin:0;padding:32px 12px;background:#f3f4fb;font-family:Segoe UI,Helvetica,Arial,sans-serif">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">' +

    // Header
    '<tr><td style="background:' + INDIGO + ';background-image:linear-gradient(135deg,' + INDIGO + ',' + INDIGO_SOFT + ');' +
    'border-radius:16px 16px 0 0;padding:36px 32px;text-align:center">' +
    '<div style="font-size:26px;font-weight:800;letter-spacing:3px;color:' + GOLD + '">JOY KAMAU</div>' +
    '<div style="margin-top:6px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#c7d2fe">' +
    'Software Developer &amp; Designer</div>' +
    '<div style="display:inline-block;margin-top:18px;padding:6px 16px;border-radius:999px;background:' + GOLD + ';' +
    'color:' + INDIGO + ';font-size:12px;font-weight:700;letter-spacing:1px">NEW ENQUIRY</div>' +
    '</td></tr>' +

    // Body
    '<tr><td style="background:#ffffff;padding:32px;color:' + TEXT + ';font-size:15px;line-height:1.6">' +
    '<p style="margin:0 0 8px">Hi Joy,</p>' +
    '<p style="margin:0 0 24px">You have a new message from the contact form on your portfolio.</p>' +

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" ' +
    'style="border:1px solid #e5e7eb;border-radius:12px;border-collapse:separate;overflow:hidden">' +
    detailRow('Name', '<strong>' + d.name + '</strong>', false) +
    detailRow('Email', '<a href="mailto:' + d.email + '" style="color:' + INDIGO_SOFT + ';font-weight:600">' + d.email + '</a>', true) +
    detailRow('Country', flag + d.country, false) +
    detailRow('Industry', d.sector, true) +
    '</table>' +

    '<div style="margin:28px 0 8px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:' + MUTED + '">Message</div>' +
    '<div style="background:#fffbeb;border-left:4px solid ' + GOLD + ';border-radius:8px;padding:18px 20px;white-space:normal">' +
    d.message.replace(/\n/g, '<br>') +
    '</div>' +

    '<div style="text-align:center;margin:32px 0 8px">' +
    '<a href="' + replyLink + '" style="display:inline-block;background:' + GOLD + ';color:' + INDIGO + ';' +
    'text-decoration:none;font-weight:800;font-size:14px;letter-spacing:1px;padding:14px 32px;border-radius:10px">' +
    'REPLY TO ' + d.name.split(' ')[0].toUpperCase() + '</a>' +
    '</div>' +
    '</td></tr>' +

    // Footer
    '<tr><td style="background:' + INDIGO + ';border-radius:0 0 16px 16px;padding:18px 32px;text-align:center;' +
    'font-size:12px;color:#c7d2fe">' +
    'Received ' + d.sentAt + ' &middot; Sent from your portfolio contact form' +
    '</td></tr>' +

    '</table></div>'
  );
}

function detailRow(label, value, shaded) {
  return (
    '<tr style="background:' + (shaded ? '#f9fafb' : '#ffffff') + '">' +
    '<td style="padding:14px 18px;width:110px;font-size:12px;font-weight:700;letter-spacing:1px;' +
    'text-transform:uppercase;color:' + MUTED + ';vertical-align:top">' + label + '</td>' +
    '<td style="padding:14px 18px;font-size:15px;color:' + TEXT + '">' + value + '</td>' +
    '</tr>'
  );
}

function clean(value, max) {
  return String(value || '')
    .trim()
    .slice(0, max)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
