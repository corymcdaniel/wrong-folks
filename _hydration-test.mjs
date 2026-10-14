import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const URL = 'http://localhost:4173/';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox'],
});
const page = await browser.newPage();

const msgs = [];
const errors = [];
page.on('console', (m) => msgs.push({ type: m.type(), text: m.text() }));
page.on('pageerror', (e) => errors.push(String(e)));

const resp = await page.goto(URL, { waitUntil: 'networkidle0' });
console.log('HTTP status:', resp.status());

await new Promise((r) => setTimeout(r, 800));

const rootText = await page.$eval('#root', (el) => el.innerText.replace(/\s+/g, ' ').trim());
const hasContent = rootText.length > 50;

const hydrationWarnings = msgs.filter((m) =>
  /hydrat|did not match|mismatch|Minified React error/i.test(m.text)
);

console.log('--- CONSOLE ERRORS (pageerror) ---');
console.log(errors.length ? errors.join('\n') : '(none)');
console.log('--- HYDRATION-RELATED CONSOLE MESSAGES ---');
console.log(hydrationWarnings.length ? hydrationWarnings.map((m) => `[${m.type}] ${m.text}`).join('\n') : '(none)');
console.log('--- ALL console errors/warnings ---');
const ew = msgs.filter((m) => m.type === 'error' || m.type === 'warning');
console.log(ew.length ? ew.map((m) => `[${m.type}] ${m.text}`).join('\n') : '(none)');
console.log('--- ROOT after hydration ---');
console.log('hasContent:', hasContent, '| text length:', rootText.length);
console.log('sample:', rootText.slice(0, 160));

await browser.close();
