import { Marked } from 'marked';

const SAFE_URL = /^(https?:|mailto:|\/|#)/i;

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Song notes are typed into the site rather than living in the repo, so raw
// HTML is shown as text and links are limited to safe protocols.
const notesMarked = new Marked({
  breaks: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, tokens }) {
      const label = this.parser.parseInline(tokens);
      if (!SAFE_URL.test(href)) return label;
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    },
    image({ text }) {
      return escapeHtml(text);
    },
  },
});

export function renderNotes(notes) {
  return notesMarked.parse(notes);
}
