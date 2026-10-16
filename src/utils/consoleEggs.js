// Dry little console messages for anyone who opens dev tools.
// Call `consoleEgg(event, data)` from wherever the event happens.
import cat from '../content/cat.txt?raw';
import soup from '../content/soup.txt?raw';
import cassette from '../content/cassette.txt?raw';

const TEXT_STYLE = 'color: #7a7a68; font-style: italic;';
const ART_STYLE  = 'color: #6a9a50; font-family: monospace; line-height: 1.1;';

const LINES = {
  play: [
    (d) => `now playing: ${d.title}. please hold still.`,
    (d) => `${d.title}. the speakers have been notified.`,
    (d) => `you pressed play on ${d.title}. there is no undo.`,
    (d) => `${d.title} is happening now. it was always going to.`,
  ],
  pause: [
    () => 'paused. the song will wait. it has nowhere to be.',
    () => 'silence. also a genre.',
    () => 'paused. take your time. the song is not going anywhere.',
  ],
  ended: [
    () => 'that one is over. it had a good run.',
    () => 'song ended. the next one is already nervous.',
  ],
  flick: [
    () => 'that photo is gone now. well, it is at the back.',
    () => 'flicked. the photo has been informed.',
    () => 'into the pile it goes.',
  ],
  login: [
    () => 'this door is for the band. the band knows who they are.',
  ],
};

let flickCount = 0;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function say(text) {
  console.log(`%c${text}`, TEXT_STYLE);
}

function draw(art, caption) {
  console.log(`%c${art}`, ART_STYLE);
  if (caption) say(caption);
}

export function consoleEgg(event, data = {}) {
  if (typeof window === 'undefined') return;

  if (event === 'welcome') {
    draw(cat, 'drawn by an AI. it took a few tries and one complaint. the songs were not. — claude');
    return;
  }

  if (event === 'playAll') {
    draw(cassette, 'playing everything. clear your schedule.');
    return;
  }

  if (event === 'lyrics') {
    draw(soup, 'no steam. you do the math.');
    return;
  }

  if (event === 'flick') {
    flickCount += 1;
    if (flickCount === 10) {
      say('ten photos flicked. the photos have started a group chat about you.');
      return;
    }
  }

  const lines = LINES[event];
  if (lines) say(pick(lines)(data));
}
