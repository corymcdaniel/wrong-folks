// Dry little console messages for anyone who opens dev tools.
// - `consoleEgg(event, data)` is called from wherever the event happens
// - `installConsoleEggs()` runs once on load: title card, page-level
//   listeners, and the `folks` object people can type into the console
import cat from '../content/cat.txt?raw';
import cassette from '../content/cassette.txt?raw';
import headphones from '../content/headphones.txt?raw';
import door from '../content/door.txt?raw';

const STYLES = {
  title: [
    'font-family: Impact, "Arial Narrow", sans-serif',
    'font-size: 56px',
    'letter-spacing: 6px',
    'color: #cdc8b5',
    'text-shadow: 3px 3px 0 #3a5829, 6px 6px 0 #101a0d',
    'padding: 8px 0',
  ].join(';'),
  subtitle: 'color: #a07545; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;',
  text: 'color: #7a7a68; font-style: italic;',
  art: 'color: #6a9a50; font-family: monospace; line-height: 1.1;',
  command: 'color: #6a9a50; font-family: monospace; font-weight: bold;',
  milestone: 'color: #cdc8b5; background: #3a5829; padding: 2px 8px; border-radius: 2px;',
};

const LINES = {
  play: [
    (d) => `now playing: ${d.title}. please hold still.`,
    (d) => `${d.title}. the speakers have been notified.`,
    (d) => `you pressed play on ${d.title}. there is no undo.`,
    (d) => `${d.title} is happening now. it was always going to.`,
    (d) => `${d.title}. turn it up. or don't. we can't see you.`,
    (d) => `loading ${d.title}. the bits are lining up single file.`,
  ],
  pause: [
    () => 'paused. the song will wait. it has nowhere to be.',
    () => 'silence. also a genre.',
    () => 'paused. take your time. the song is not going anywhere.',
    () => 'the band has frozen mid-note. awkward for them.',
  ],
  resume: [
    () => 'and we are back.',
    () => 'unpaused. the song pretends nothing happened.',
  ],
  ended: [
    () => 'that one is over. it had a good run.',
    () => 'song ended. the next one is already nervous.',
    () => 'and that was that.',
  ],
  next: [
    () => 'skipped. no hard feelings. some hard feelings.',
    () => 'next. the last song will be fine. it has friends.',
  ],
  prev: [
    () => 'going back. nostalgia is free here.',
    () => 'once more, with the same feeling.',
  ],
  seek: [
    () => 'scrubbing. looking for the good part. it is all the good part.',
    () => 'time travel detected.',
    () => 'you moved the needle. the needle is fine.',
  ],
  flick: [
    () => 'that photo is gone now. well, it is at the back.',
    () => 'flicked. the photo has been informed.',
    () => 'into the pile it goes.',
  ],
  lyricsClose: [
    () => 'lyrics closed. the words are still in there.',
    () => 'you closed the lyrics. they will keep.',
  ],
  login: [
    () => 'this door is for the band. the band knows who they are.',
  ],
  away: [
    () => 'you left.',
    () => 'tab hidden. we will just stand here.',
  ],
  back: [
    () => 'you came back. nobody said anything while you were gone.',
    () => 'oh. hi again.',
  ],
  backPlaying: [
    () => 'you came back. the song kept going without you. it did fine.',
  ],
  copy: [
    () => 'copying something. cite your sources.',
    () => 'ctrl+c detected. it is yours now. be nice to it.',
  ],
  contextmenu: [
    () => 'right-clicking. looking for the source? you are already in the console.',
    () => 'right click. bold.',
  ],
};

const SECTION_LINES = {
  music:  'you found the pieces. they are mostly in one piece.',
  lyrics: 'the lyrics section. words were involved.',
  about:  'reading the about section. thorough. we respect that.',
};

const FORTUNES = [
  'a song you have not heard yet is about to be your favorite. or your least favorite. one of those.',
  'turn it up one more notch. that one.',
  'you will be asked to turn it down. do not.',
  'a stranger will hum something. it will be this.',
  'the next photo will be blurry. that is on purpose.',
  'you are more wrong than you think. welcome.',
];

const stats = {
  plays: 0,
  pauses: 0,
  skips: 0,
  flicks: 0,
  lyricsOpened: 0,
  tabLeaves: 0,
  commandsTyped: 0,
};

const MILESTONES = {
  plays: {
    3:  'three songs. you are a listener now.',
    5:  'five plays. here, you have earned these.',
    10: 'ten plays. at this point you are basically in the band. you are not in the band.',
  },
  pauses: {
    5:  'five pauses. commitment issues?',
  },
  skips: {
    5:  'five skips. looking for something specific? it is not here. it is all here.',
  },
  flicks: {
    10: 'ten photos flicked. the photos have started a group chat about you.',
    25: 'twenty-five flicks. you have seen every photo at least twice. they have seen you too.',
  },
  lyricsOpened: {
    3:  'third time opening the lyrics. they have not changed. we checked.',
  },
};

const seenSections = new Set();
let installed = false;
let playing = false;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function say(text, style = STYLES.text) {
  console.log(`%c${text}`, style);
}

function draw(art, caption) {
  console.log(`%c${art}`, STYLES.art);
  if (caption) say(caption);
}

function sayLine(event, data) {
  const lines = LINES[event];
  if (lines) say(pick(lines)(data));
}

// Bumps a counter and prints its milestone message if it just hit one.
// Returns true when a milestone printed.
function count(key) {
  stats[key] += 1;
  const message = MILESTONES[key]?.[stats[key]];
  if (!message) return false;

  say(`★ ${message}`, STYLES.milestone);
  if (key === 'plays' && stats[key] === 5) draw(headphones);
  return true;
}

export function consoleEgg(event, data = {}) {
  if (typeof window === 'undefined') return;

  if (event === 'play' || event === 'resume') playing = true;
  if (event === 'pause' || event === 'ended') playing = false;

  if (event === 'play') {
    sayLine('play', data);
    count('plays');
    return;
  }

  if (event === 'pause') {
    sayLine('pause');
    count('pauses');
    return;
  }

  if (event === 'next' || event === 'prev') {
    if (!count('skips')) sayLine(event);
    return;
  }

  if (event === 'playAll') {
    draw(cassette, 'playing everything. clear your schedule.');
    return;
  }

  if (event === 'lyrics') {
    if (!count('lyricsOpened')) say('lyrics. read them slowly. or quickly. we cannot tell.');
    return;
  }

  if (event === 'flick') {
    if (!count('flicks')) sayLine('flick');
    return;
  }

  if (event === 'login') {
    draw(door, pick(LINES.login)());
    return;
  }

  sayLine(event, data);
}

// Anything typed as `folks.something()` in the console
function makeCommands() {
  const run = (fn) => () => {
    stats.commandsTyped += 1;
    fn();
    return '—';
  };

  return {
    help: run(() => {
      console.group('%cthings you can type', STYLES.subtitle);
      say('folks.help()      this, again', STYLES.command);
      say('folks.cat()       the cat', STYLES.command);
      say('folks.fortune()   advice nobody asked for', STYLES.command);
      say('folks.stats()     what you have done here', STYLES.command);
      say('folks.vibe()      a reading', STYLES.command);
      say('folks.secret()    do not', STYLES.command);
      console.groupEnd();
    }),
    cat: run(() => draw(cat, 'still the same cat. it does not do tricks.')),
    fortune: run(() => say(`🥠 ${pick(FORTUNES)}`)),
    stats: run(() => {
      console.table(stats);
      say('none of this is sent anywhere. it is just between you and the console.');
    }),
    vibe: run(() => {
      if (playing) {
        say('vibe: listening. correct.');
        return;
      }
      if (stats.plays === 0) {
        say('vibe: browsing in silence. press a song. any song.');
        return;
      }
      say('vibe: between songs. contemplative. possibly hungry.');
    }),
    secret: run(() => {
      say('there is no secret.');
      say('you checked anyway. that is the secret.', STYLES.milestone);
    }),
  };
}

function watchSections() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (!entry.isIntersecting || seenSections.has(id)) return;
      seenSections.add(id);
      say(SECTION_LINES[id]);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  Object.keys(SECTION_LINES).forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

export function installConsoleEggs() {
  if (typeof window === 'undefined' || installed) return;
  installed = true;

  say('WRONG FOLKS', STYLES.title);
  say('you opened the console. of course you did.', STYLES.subtitle);
  draw(cat, 'drawn by an AI. it took a few tries and one complaint. the songs were not. — claude');
  say('type folks.help() if you want more. you probably do.', STYLES.command);

  window.folks = makeCommands();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      stats.tabLeaves += 1;
      sayLine('away');
      return;
    }
    if (playing) {
      sayLine('backPlaying');
      return;
    }
    sayLine('back');
  });

  document.addEventListener('copy', () => sayLine('copy'));
  document.addEventListener('contextmenu', () => sayLine('contextmenu'));

  watchSections();
}
