const cron = require('node-cron');
const Preference = require('../models/Preference');
const User = require('../models/User');
const axios = require('axios');
const sendEmail = require('./sendEmail');
const summarizer = require('./summarizer');

// Helper: returns ISO date (YYYY-MM-DD) for today in UTC
function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// Helper: returns time window (earliest Date) for digest collection
function windowStartDate() {
  const hours = Number(process.env.DIGEST_WINDOW_HOURS || 24);
  const now = new Date();
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

// Normalize category/name to GNews category values if possible
function mapNewsTypeToCategory(type) {
  if (!type) return undefined;
  const t = type.toLowerCase();
  if (t.includes('tech') || t.includes('technology')) return 'technology';
  if (t.includes('sport')) return 'sports';
  if (t.includes('science')) return 'science';
  if (t.includes('health')) return 'health';
  if (t.includes('business')) return 'business';
  if (t.includes('entertain')) return 'entertainment';
  if (t.includes('polit') || t.includes('world') || t.includes('general')) return 'general';
  return undefined;
}

async function fetchTodaysArticlesForPreference(pref) {
  try {
    // Prefer NewsData.io personalized endpoint if configured
    if (process.env.NEWSDATA_API_KEY) {
      try {
        const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
        const resp = await axios.get(`${serverUrl}/api/newsdata/personalized/${pref.userId}`);
        const now = new Date();
        const earliest = windowStartDate();
        console.log(`   → Using digest time window: ${earliest.toISOString()} -> ${now.toISOString()}`);
        const articles = (resp.data.articles || []).filter(a => {
          try {
            const published = new Date(a.publishedAt);
            return published >= earliest && published <= now;
          } catch (e) { return false; }
        }).slice(0, 10);
        return articles;
      } catch (err) {
        console.error('Error fetching personalized news from NewsData endpoint:', err.message);
        // fall back to GNews below
      }
    }

    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) return [];
    // We'll collect up to `maxArticles` articles across the user's preferred newsTypes
    const maxArticles = 10;
    const collected = [];
    const seen = new Set();

    const country = pref.countries && pref.countries.length ? pref.countries[0] : undefined;
    const newsTypes = Array.isArray(pref.newsTypes) && pref.newsTypes.length ? pref.newsTypes : [ 'general' ];

    // For each preferred type, fetch a small batch and add unseen articles until we reach maxArticles
    for (const rawType of newsTypes) {
      if (collected.length >= maxArticles) break;
      const category = mapNewsTypeToCategory(rawType) || 'general';

      const params = {
        lang: 'en',
        max: 10, // fetch up to 10 per type, but we'll dedupe
        apikey: apiKey
      };
      if (country) params.country = country;
      if (category) params.category = category;

      try {
        const resp = await axios.get('https://gnews.io/api/v4/top-headlines', { params });
        const articlesBatch = resp.data.articles || [];

        for (const a of articlesBatch) {
          if (collected.length >= maxArticles) break;
          try {
            const published = new Date(a.publishedAt);
            const now = new Date();
            const earliest = windowStartDate();
            // Only include articles within the digest time window (default: last 24 hours)
            if (published < earliest || published > now) continue;
          } catch (e) { continue; }

          if (!a.url) continue;
          if (seen.has(a.url)) continue;
          seen.add(a.url);
          collected.push(a);
        }
      } catch (err) {
        console.error(`Error fetching ${rawType} news during digest collection:`, err.message);
        // continue to next type
      }
    }

    return collected;
  } catch (error) {
    console.error('Error fetching todays articles for preference:', error.message);
    return [];
  }
}

function buildEmailHtml(userName, articles) {
  if (!articles || articles.length === 0) {
    return `<p>Hi ${userName || 'Subscriber'},</p><p>There are no news items for today matching your preferences.</p>`;
  }

  const items = articles.map(a => {
    const summary = summarizer.summarizeByLength(a.content || a.description || a.title, 300);
    return `
      <div style="margin-bottom:18px">
        <h3 style="margin:0 0 6px 0"><a href="${a.url}" target="_blank" rel="noopener noreferrer">${a.title}</a></h3>
        <p style="margin:0 0 6px 0;color:#444">${summary}</p>
        <small style="color:#888">${new Date(a.publishedAt).toLocaleString()}</small>
      </div>
    `;
  }).join('\n');

  return `
    <div>
      <p>Hi ${userName || 'Subscriber'},</p>
      <p>Here are today's headlines tailored to your preferences:</p>
      ${items}
      <hr/>
      <p style="font-size:12px;color:#666">Sent by NewsSummarizer</p>
    </div>
  `;
}

async function sendDailyEmails() {
  try {
    console.log('📬 Running daily email job: fetching preferences...');
    const prefs = await Preference.find({ 'notificationSettings.email.enabled': true });
    if (!prefs || prefs.length === 0) {
      console.log('📬 No preferences found with email enabled');
      return;
    }

    console.log(`📬 Preferences found: ${prefs.length}`);
    // show a short list of userIds for debugging
    console.log('📬 Preference userIds:', prefs.map(p => String(p.userId)).slice(0, 20));

    for (const pref of prefs) {
      try {
        console.log('\n▶ Processing preference for userId:', pref.userId);
        const user = await User.findById(pref.userId);
        if (!user) { console.log('   ⚠️ User not found for userId', pref.userId); continue; }
        console.log('   → user.email:', user.email);
        console.log('   → emailSettings:', JSON.stringify(pref.notificationSettings?.email || {}));
        if (!user || !user.email) continue;

        // Check frequency and time
        const emailSettings = pref.notificationSettings?.email || {};
        if (emailSettings.frequency !== 'daily') continue;

        // Respect per-user delivery time by default: only send when the user's timeOfDay matches server local HH:mm,
        // or when timeOfDay is not set. However, when `TEST_SEND_TIME` is used to schedule a test run,
        // we intentionally override per-user `timeOfDay` so every enabled user receives the digest for testing.
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hh}:${mm}`; // e.g. '08:00'
        const isTestMode = Boolean(process.env.TEST_SEND_TIME);
        if (!isTestMode && emailSettings.timeOfDay && emailSettings.timeOfDay !== currentTime) {
          console.log(`   → skipping: user.timeOfDay=${emailSettings.timeOfDay} currentTime=${currentTime}`);
          continue;
        }
        if (isTestMode && emailSettings.timeOfDay && emailSettings.timeOfDay !== currentTime) {
          console.log(`   → TEST_SEND_TIME is set — overriding user.timeOfDay=${emailSettings.timeOfDay}; sending now for test`);
        }

        const articles = await fetchTodaysArticlesForPreference(pref);
        console.log(`   → Articles found for user: ${articles.length}`);

        const html = buildEmailHtml(user.name, articles);
        console.log(`   → Sending email to ${user.email} (articles: ${articles.length})`);
        const info = await sendEmail(user.email, "Today's news — your daily digest from MeraPaper", html);
        console.log('   → sendEmail result:', info && info.messageId ? info.messageId : info);
        console.log(`📬 Sent daily email to ${user.email} (${articles.length} items)`);
      } catch (err) {
        console.error('Error processing preference for userId', pref.userId, err.message);
      }
    }
  } catch (err) {
    console.error('Failed to run daily email job:', err.message);
  }
}

// Send digest for a single userId (used by API endpoint for testing)
async function sendDigestForUser(userId) {
  try {
    const pref = await Preference.findOne({ userId, 'notificationSettings.email.enabled': true });
    if (!pref) {
      return { ok: false, message: 'No enabled preference found for user' };
    }

    const user = await User.findById(pref.userId);
    if (!user || !user.email) return { ok: false, message: 'User or email not found' };

    const emailSettings = pref.notificationSettings?.email || {};
    // allow manual trigger regardless of user's timeOfDay
    const articles = await fetchTodaysArticlesForPreference(pref);
    const html = buildEmailHtml(user.name, articles);
    const info = await sendEmail(user.email, "Today's news — your personalized digest from MeraPaper", html);
    return { ok: true, messageId: info && info.messageId ? info.messageId : info, count: articles.length };
  } catch (err) {
    console.error('Error in sendDigestForUser:', err.message);
    return { ok: false, message: err.message };
  }
}

function startScheduler() {
  // Allow overriding the scheduled time using TEST_SEND_TIME (format HH:mm) for testing
  const testTime = process.env.TEST_SEND_TIME; // e.g. '22:52'
  let cronExpr;

  if (testTime && /^\d{1,2}:\d{2}$/.test(testTime)) {
    const [hh, mm] = testTime.split(':').map(s => String(Number(s)).padStart(2, '0'));
    // minute hour day month weekday
    cronExpr = `${mm} ${hh} * * *`;
    console.log(`⏳ TEST_SEND_TIME is set — scheduling daily job at ${hh}:${mm}`);
  } else {
    // Default: 09:30
    cronExpr = '30 9 * * *';
    console.log('⏰ Email scheduler default: daily at 09:30 (server local time)');
  }

  cron.schedule(cronExpr, () => {
    sendDailyEmails();
  }, {
    timezone: process.env.SERVER_TIMEZONE || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  console.log(`⏰ Email scheduler started with cron '${cronExpr}' (server local time)`);
}

module.exports = { startScheduler, sendDailyEmails, sendDigestForUser };
