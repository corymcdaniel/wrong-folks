import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { consoleEgg } from './utils/consoleEggs';
import './styles/global.scss';

const tree = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Build-time prerender entry (runs in Node, no DOM available).
export async function prerender() {
  const { renderToString } = await import('react-dom/server');
  return { html: renderToString(tree) };
}

// Client-side hydration of the prerendered markup.
if (typeof document !== 'undefined') {
  hydrateRoot(document.getElementById('root'), tree);

  // Easter egg for anyone who opens the browser console
  consoleEgg('welcome');
}
