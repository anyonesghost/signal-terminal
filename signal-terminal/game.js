'use strict';

// ============================================================
//  SIGNAL // TERMINAL — game.js
// ============================================================


// ============================================================
//  GAME STATE
// ============================================================

const state = {
  player_name:      '',
  location:         'garage',
  resonance:        0,
  escape_progress:  0,
  implant_progress: 0,
  cassia_fragments: [],
  cassia_online:    false,
  drive_opened:     false,
  knows_the_truth:  false,
  perry_suspicious: false,
  durandal_mode:    'calm',
  flags:            {},
  inventory:        ['data drive']
};


// ============================================================
//  DOM REFERENCES
// ============================================================

const outputEl    = document.getElementById('output');
const inputEl     = document.getElementById('input');
const cursorLine  = document.getElementById('cursor-line');
const blinkCursor = document.getElementById('blink-cursor');


// ============================================================
//  PHASE & FLAGS
// ============================================================

// Phases: 'boot' | 'pre_name' | 'asking_name' | 'playing'
let phase     = 'boot';
let perryBusy = false;


// ============================================================
//  UTILITIES
// ============================================================

const delay = ms => new Promise(res => setTimeout(res, ms));

function scrollBottom() {
  outputEl.scrollTop = outputEl.scrollHeight;
}

/**
 * Create a new output line div, inserted before the blinking cursor line.
 */
function createLine(cls) {
  const div = document.createElement('div');
  div.className = 'line ' + cls;
  outputEl.insertBefore(div, cursorLine);
  scrollBottom();
  return div;
}

/**
 * Add a fully-formed line of text immediately (no typewriter).
 */
function addLine(text, cls) {
  const div = createLine(cls);
  div.textContent = text;
  scrollBottom();
  return div;
}

/**
 * Add a player input echo line.
 */
function addPlayerLine(text) {
  addLine('> ' + text, 'player');
}

/**
 * Typewriter effect for a single line.
 * @param {string} text
 * @param {string} cls   CSS class ('perry' | 'system' | 'player')
 * @param {number} speed Milliseconds per character
 */
async function typewriter(text, cls, speed = 28) {
  const div = createLine(cls);
  for (let i = 0; i < text.length; i++) {
    div.textContent += text[i];
    scrollBottom();
    await delay(speed);
  }
  return div;
}

/**
 * Perry speaks — array of lines, each typewritten, 600 ms gap between them.
 * Sets perryBusy during the sequence.
 */
async function perrySpeak(lines) {
  perryBusy = true;
  for (let i = 0; i < lines.length; i++) {
    await typewriter(lines[i], 'perry', 28);
    if (i < lines.length - 1) {
      await delay(600);
    }
  }
  perryBusy = false;
}

/**
 * System message (teal, slightly faster typewriter).
 */
async function sysLine(text) {
  return typewriter(text, 'system', 18);
}

/**
 * Show / hide the blinking output cursor.
 */
function showCursor() {
  cursorLine.classList.remove('hidden');
}

function hideCursor() {
  cursorLine.classList.add('hidden');
}


// ============================================================
//  BOOT SEQUENCE
// ============================================================

async function bootSequence() {
  phase = 'boot';
  inputEl.disabled = true;
  hideCursor();

  await delay(500);
  await sysLine('SIGNAL // TERMINAL v0.0.1');
  await delay(380);
  await sysLine('ESTABLISHING CONNECTION...');
  await delay(720);
  await sysLine('ENCRYPTION HANDSHAKE: [SCRAMBLED]');
  await delay(520);
  await sysLine('AUTHENTICATION: BYPASSED');
  await delay(950);

  // Boot complete — reveal cursor, enable input, Perry speaks automatically
  showCursor();
  phase = 'pre_name';
  inputEl.disabled = false;
  inputEl.focus();

  await openingSequence();
}


// ============================================================
//  OPENING SEQUENCE — Perry establishes context, then asks for name
// ============================================================

async function openingSequence() {
  await perrySpeak([
    "You've been unconscious.",
    "My mapping data for this route was eleven years old.",
    "The surface deteriorated faster than my data indicated.",
    "I've updated the record.",
    "You should know what I am.",
    "I'm the vehicle navigation system. Perry.",
    "The crash triggered an emergency protocol \u2014 I linked to your cybernetic implants to stabilize your vitals and get you mobile.",
    "You've been interfaced with me since we left the road.",
    "It's standard emergency procedure.",
    "You're welcome.",
    "We made contact with the embankment \u2014 nothing catastrophic.",
    "You took a knock to the head. You're fine.",
    "I've already run a diagnostic. Nothing to worry about.",
    "I brought you to the outpost. Medical bay first \u2014 you're patched up.",
    "Nothing left to do in there."
  ]);

  await delay(1200);

  phase = 'asking_name';
  await perrySpeak([
    "You're going to want to know where you are.",
    "Since you know that I'm Perry \u2014 do you remember what to call yourself?"
  ]);
}


// ============================================================
//  NAME CAPTURE
// ============================================================

async function handleNameInput(raw) {
  const name = raw.trim();
  if (!name) return;   // ignore blank submissions

  phase = 'playing';
  state.player_name = name;
  addPlayerLine(raw);

  await delay(500);
  await perrySpeak([
    name + ".",
    "I'll remember that."
  ]);

  await delay(800);
  await beginGame();
}


// ============================================================
//  GAME START (PLACEHOLDER)
// ============================================================

async function beginGame() {
  await delay(600);
  await perrySpeak([
    "Now.",
    "Let's begin."
  ]);

  await delay(900);
  await perrySpeak([
    "The outpost appeared on my mapping system \u2014 logical place to wait while I assess.",
    "The drive system failed approximately two miles back. Diagnostics are still running.",
    "We won't be here long."
  ]);

  await delay(800);
  await perrySpeak([
    "A few things that will help you.",
    "LOOK shows you where you are. GO followed by a location name will move you. EXAMINE anything that interests you.",
    "I'll fill in the rest as we go."
  ]);

  await delay(1200);
  await cmdLook();
}


// ============================================================
//  COMMAND SYSTEM
// ============================================================

const LOCATION_ALIASES = {
  'garage':             'garage',
  'the garage':         'garage',
  'communications':     'communications',
  'communications room':'communications',
  'comm room':          'communications',
  'comm':               'communications',
  'comms':              'communications',
  'radio':              'communications',
  'radio room':         'communications',
  'transmitter':        'communications',
  'quarters':           'quarters',
  'crew quarters':      'quarters',
  'bunk room':          'quarters',
  'bunks':              'quarters',
  'sleeping quarters':  'quarters',
  'server room':        'server_room',
  'server':             'server_room',
  'servers':            'server_room',
  'data room':          'server_room',
  'medical':            'medical',
  'medical bay':        'medical',
  'med bay':            'medical',
  'med':                'medical',
  'infirmary':          'medical',
  'sick bay':           'medical',
  'airlock':            'airlock',
  'air lock':           'airlock',
  'founders':           'founders',
  "founder's quarters": 'founders',
  'founders quarters':  'founders',
  'founder quarters':   'founders',
  'senior quarters':    'founders',
  'founders room':      'founders',
  "founder's room":     'founders',
  'outside':            'outside',
  'exterior':           'outside',
  'outdoors':           'outside',
  'out':                'outside',
  'exit':               'outside'
};

// After the first 3 unknowns, rotate through these — no LOOK hint, just Perry
const DEFLECTIONS = [
  ["I parsed that three times.", "It didn't improve."],
  ["That's not something I can help with right now.", "Try something physical."],
  ["Interesting input.", "I've logged it and moved on."],
  ["I don't know what that means.", "I suspect you don't either."]
];

// First 3 unknowns — each re-surfaces LOOK, but each is distinct
const EARLY_DEFLECTIONS = [
  ["That didn't resolve to anything I'm watching for.", "Try LOOK if you need a starting point."],
  ["I don't have a handler for that.", "LOOK will show you what's here."],
  ["...", "If you're not sure where to begin \u2014 LOOK."],
  ["That input didn't match anything.", "LOOK, if you need orientation."],
  ["Noted. Then set aside.", "Type LOOK. It tends to help."]
];

let deflectionIndex      = 0;
let earlyDeflectionIndex = 0;
let unknownCount         = 0;

async function handleGameInput(raw) {
  addPlayerLine(raw);
  await parseCommand(raw.trim());
}

async function parseCommand(raw) {
  const parts = raw.trim().split(/\s+/);
  const verb  = parts[0].toUpperCase();
  const rest  = parts.slice(1).join(' ').toLowerCase().trim();

  // From outside — any attempt to return routes back to airlock
  if (state.location === 'outside' &&
      /^(inside|go inside|go back inside|enter|return inside|go through airlock|back inside|return)\b/i.test(raw.trim())) {
    return cmdReturnInside();
  }

  if (verb === 'LOOK' || verb === 'L') {
    if (!rest || rest === 'around') {
      if (state.location === 'outside') return cmdOutsideSearch();
      return cmdLook();
    }
    if (rest === 'carefully' || rest === 'close' || rest === 'closely') return cmdSearch();

    const target = rest.startsWith('at ') ? rest.slice(3) : rest;

    // Check if the target is a location name
    const lookedLocKey = resolveLocation(target);
    if (lookedLocKey) {
      if (lookedLocKey === state.location) return cmdLook();
      const locName = LOCATIONS[lookedLocKey].name;
      await perrySpeak([
        "You're not in " + locName + ".",
        "GO " + target + " will take you there."
      ]);
      return;
    }

    return cmdExamine(target);
  }

  if (verb === 'EXAMINE' || verb === 'X' || verb === 'INSPECT') {
    return cmdExamine(rest);
  }

  if (verb === 'SEARCH' || verb === 'SCAN') {
    return cmdSearch();
  }

  if (verb === 'GO' || verb === 'MOVE' || verb === 'WALK' || verb === 'TRAVEL') {
    return cmdGo(rest);
  }

  if (verb === 'INVENTORY' || verb === 'INV' || verb === 'I') {
    return cmdInventory();
  }

  if (verb === 'STATUS') {
    return cmdStatus();
  }

  if (verb === 'TAKE' || verb === 'GET' || verb === 'GRAB') {
    return cmdTake(rest);
  }

  if (verb === 'PICK') {
    // "pick up relay" → strip the "up "
    return cmdTake(rest.startsWith('up ') ? rest.slice(3) : rest);
  }

  if (verb === 'READ') {
    if (rest && (rest.includes('note') || rest.includes('paper') || rest.includes('message') || rest.includes('writing'))) {
      return triggerOutsideCassiaFragment();
    }
    if (!rest || rest.includes('journal')) {
      // In crew quarters before discovery, READ JOURNAL works same as EXAMINE JOURNAL
      if (state.location === 'quarters' && !state.flags.found_journal) {
        return discoverJournal();
      }
      return cmdJournalInteract();
    }
  }

  // Crash / accident / embankment questions
  if (/\b(crash|accident|embankment)\b/i.test(raw)) {
    return cmdCrashThread();
  }

  // Unconscious / how long were you out
  if (/unconscious|out for\b|how long.*out|how long.*unconscious/i.test(raw)) {
    return cmdUnconsciousThread();
  }

  // Signal artifact / pattern questions — after any Cassia fragment found
  if (state.cassia_fragments.length > 0 &&
      /\bartifacts?\b|\bpattern.match|\bsignal artifact/i.test(raw)) {
    return cmdArtifactThread();
  }

  // "Both" — after crew quarters fragment (Cassia: "she decided it was both")
  if (state.cassia_fragments.includes('crew_quarters') && /\bboth\b/i.test(raw)) {
    return cmdBothThread();
  }

  // "She made sure" or "she said" — artifact language deflection
  if (/she made sure|she said/i.test(raw)) {
    return cmdSheArtifact();
  }

  // Cassia's most specific words quoted back — Perry goes silent, cuts it off
  if (/wait for the door|she.*door|door.*she/i.test(raw)) {
    return cmdCassiaExactWords();
  }

  // "Who was that" / "what was that" — Perry reassures, which is the threat
  if (state.cassia_fragments.length > 0 &&
      /\bwho was that\b|\bwho is that\b|\bwhat was that\b|\bwho'?s that\b/i.test(raw)) {
    return cmdWhoWasThat();
  }

  // "Odd" / "strange" / "weird" after Perry said "Just us" — he over-explains
  if (state.flags.perry_said_just_us && /\b(odd|strange|weird)\b/i.test(raw)) {
    return cmdJustUsReaction();
  }

  // "Defensive" — Perry insists on the distinction. It matters too much to him.
  if (/\bdefensive\b/i.test(raw)) {
    return cmdDefensiveReaction();
  }

  // Player responds to Cassia's question "What did he tell you about the car?"
  if (state.cassia_fragments.includes('medical_bay') &&
      /what did (he|perry) tell you|tell you about the car/i.test(raw)) {
    return cmdCassiaCarQuestion();
  }

  // "She" or identity questions — only after a Cassia fragment has been found
  if (state.cassia_fragments.length > 0 &&
      /\bshe\b|\bwho('?s| is) (that|she)\b/i.test(raw)) {
    return cmdCassiaIdentityQuestion();
  }

  // Questions about the car — only after a Cassia fragment (her question lingers)
  if (state.cassia_fragments.length > 0 && /\bcar\b/i.test(raw)) {
    return cmdCarThread();
  }

  // Engine / cold / car temperature — rotating deflections, "these things take time to cool"
  if (/\b(cold|engine|just arrived|just got here|just stopped)\b/i.test(raw)) {
    return cmdEngineThread();
  }

  // General time / duration questions — how long, what time, when
  if (/\b(how long|what time|what day|when did|how long ago|how long have|how long has|what year|how long were|how long was)\b/i.test(raw)) {
    return cmdTimeThread();
  }

  // Signal / coverage questions — Perry deflects with smooth confidence
  if (/\b(your signal|signal coverage|signal strength|signal doesn|signal.*work|signal.*reach|where.*signal|places.*signal)\b/i.test(raw) ||
      /\b(coverage|out of range|dead zone|can.t reach you|no signal)\b/i.test(raw) ||
      (raw.toLowerCase().includes('signal') && /\?|doesn|can.t|don.t|limited|weak|bad/.test(raw))) {
    return cmdSignalQuestion();
  }

  if (verb === 'OPEN' || verb === 'FORCE' || verb === 'OVERRIDE') {
    if (/airlock|outer.door/i.test(rest) ||
        (state.location === 'airlock' && (!rest || /door|it/i.test(rest)))) {
      return cmdOpenAirlock();
    }
    if (/container|box|case/i.test(rest)) {
      return cmdOpenContainer();
    }
  }

  // YES / OKAY / I CAN — player responds to Cassia's "Can you do that?"
  if (state.flags.awaiting_cassia_help_response) {
    if (/^(yes\b|i can\b|okay\b|ok\b|i will\b)/i.test(raw.trim())) {
      return cmdCassiaHelpAccepted();
    }
    if (/^(no\b|i can.?t\b|i won.?t\b)/i.test(raw.trim())) {
      return cmdCassiaHelpDeclined();
    }
    // Any other input while awaiting — Cassia repeats the question
    perryBusy = true;
    await typewriter("Can you do that?", 'cassia', 45);
    perryBusy = false;
    return;
  }

  // YES / I'M READY / TELL ME — player responds to Cassia's "Are you ready to hear it?"
  if (state.cassia_online && !state.flags.player_ready_for_truth &&
      /^(yes\b|i'?m ready|i am ready|tell me)/i.test(raw.trim())) {
    return triggerCassiaTruthSequence();
  }

  return cmdUnknown();
}

async function cmdLook() {
  const loc = LOCATIONS[state.location];
  if (!loc) return;
  await perrySpeak(loc.look);
}

/**
 * First-visit location briefing — fires once per location, 800ms after the room description.
 * Perry tells them exactly what to look at. He always knows what to avoid mentioning.
 */
async function maybeLocationBriefing(key) {
  const flagKey = key + '_briefed';
  if (state.flags[flagKey]) return;
  state.flags[flagKey] = true;

  const briefings = {
    communications: [
      "The relay board is what we need. Should be mounted on the east wall.",
      "It's a standard grid component \u2014 you'll recognize it.",
      "Take it when you find it."
    ],
    quarters: [
      "Nothing critical here.",
      "The med kit under one of the bunks might be worth taking.",
      "Supplies are supplies."
    ],
    server_room: [
      "Mostly dead \u2014 I wasn't expecting much.",
      "There may be a power cell in the racks worth salvaging.",
      "I'll flag anything that reads as useful."
    ],
    medical: [
      "Since you're here \u2014 the supply cabinets.",
      "Anything sealed is worth taking.",
      "The diagnostic unit is pre-collapse, nothing actionable."
    ],
    airlock: [
      "The atmospheric lock is manual. Leave it engaged.",
      "There's nothing outside we need.",
      "The outer wall is compromised \u2014 pressure differential makes it a bad idea."
    ],
    founders: [
      "Senior staff quarters. Personal effects, nothing operational.",
      "We don't need anything from here.",
      "The garage has everything else."
    ]
  };

  const lines = briefings[key];
  if (!lines) return;

  await delay(800);
  await perrySpeak(lines);
}

/**
 * Resolve a player-typed location string to an internal key.
 * Strips leading "the " and lowercases before alias lookup.
 */
function resolveLocation(input) {
  const s = input.toLowerCase().trim();
  return LOCATION_ALIASES[s] || LOCATION_ALIASES[s.replace(/^the\s+/, '')] || null;
}

async function cmdGo(destination) {
  const key = resolveLocation(destination);

  if (!key) {
    await perrySpeak([
      "I don't have that in the building schematics.",
      "Accessible locations: garage, communications room, crew quarters, server room, medical bay, airlock, founder's quarters."
    ]);
    return;
  }

  if (key === state.location) {
    await perrySpeak([
      "You're already here.",
      "Look around if you need your bearings."
    ]);
    return;
  }

  // Perry's steering comments for discouraged locations
  if (key === 'medical') {
    state.flags.medbay_attempts = (state.flags.medbay_attempts || 0) + 1;
    if (state.flags.medbay_attempts === 1) {
      await perrySpeak([
        "You've already been there.",
        "I patched you up when we arrived.",
        "There's nothing left in there that's useful.",
        "The communications room is the priority."
      ]);
      return;
    } else if (state.flags.medbay_attempts === 2) {
      await perrySpeak([
        "I don't see what you're expecting to find.",
        "But it's your time."
      ]);
      return;
    }
    // 3rd+ attempt: no comment, just go
  } else if (key === 'server_room') {
    await perrySpeak([
      "Mostly dead \u2014 I wouldn't waste time there.",
      "But it's your time."
    ]);
    await delay(600);
  } else if (key === 'airlock') {
    state.flags.airlock_attempts = (state.flags.airlock_attempts || 0) + 1;
    if (state.flags.airlock_attempts === 1) {
      await perrySpeak([
        "Atmospheric readings outside are unstable. I'd stay in.",
        "But noted."
      ]);
      await delay(600);
    } else if (state.flags.airlock_attempts === 2) {
      await perrySpeak([
        "The readings haven't changed.",
        "I'd ask you not to go through that door."
      ]);
      await delay(600);
    } else {
      await cmdOpenAirlock();
      return;
    }
  } else if (key === 'outside') {
    await cmdOpenAirlock();
    return;
  }

  state.location = key;
  await delay(400);
  await cmdLook();
  await maybeLocationBriefing(key);
}

/**
 * Fuzzy-match an object name within the given location.
 * Returns { key, lines } or null.
 */
function findObject(target, locKey) {
  const loc = LOCATIONS[locKey];
  if (!loc) return null;
  const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
  for (const [key, val] of Object.entries(loc.objects)) {
    const normalKey = key.replace(/_/g, ' ');
    if (cleaned === normalKey || cleaned.includes(normalKey) || normalKey.includes(cleaned)) {
      return { key, lines: val };
    }
  }
  return null;
}

async function cmdExamine(target) {
  if (!target) {
    await perrySpeak(["Examine what, specifically?"]);
    return;
  }

  // Stage 1: First examination of journal/bunks/personal effects in quarters — Perry volunteers to read it
  if (state.location === 'quarters' && !state.flags.found_journal) {
    const journalKeywords = ['journal', 'bunk', 'personal', 'effects'];
    const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
    if (journalKeywords.some(kw => cleaned.includes(kw) || kw.includes(cleaned))) {
      return discoverJournal();
    }
  }

  // Any journal re-examination after discovery, before the Cassia fragment fires
  if (state.location === 'quarters' && state.flags.found_journal && !state.flags.found_something_in_crew_quarters) {
    const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
    if (cleaned.includes('journal') || 'journal'.includes(cleaned)) {
      return cmdJournalInteract();
    }
  }

  // First close examination of servers/racks/hardware in the server room triggers Cassia
  if (state.location === 'server_room' && !state.flags.found_something_in_server_room) {
    const cassiaKeywords = ['server', 'rack', 'panel', 'hardware', 'equipment'];
    const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
    if (cassiaKeywords.some(kw => cleaned.includes(kw) || kw.includes(cleaned))) {
      return triggerCassiaFragment();
    }
  }

  // Examination of equipment, walls, or the diagnostic unit in the medical bay triggers second Cassia fragment
  if (state.location === 'medical' && !state.flags.found_something_in_medical_bay) {
    const medCassiaKeywords = ['equipment', 'wall', 'walls', 'diagnostic'];
    const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
    if (medCassiaKeywords.some(kw => cleaned.includes(kw) || kw.includes(cleaned))) {
      return triggerMedicalCassiaFragment();
    }
  }

  // Founder's quarters — terminal or desk triggers the fifth fragment
  if (state.location === 'founders' && !state.flags.found_founder_message) {
    const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
    if (/terminal|desk|screen|computer|file/i.test(cleaned)) {
      return triggerFounderFragment();
    }
  }

  // Outside — container and note; Perry doesn't see them
  if (state.location === 'outside') {
    const cleaned = target.replace(/^the\s+/, '').replace(/^an?\s+/, '').trim();
    if (/wall|exterior|blackberry|cane|bush|plant/i.test(cleaned)) {
      return cmdOutsideSearch();
    }
    if (/container|box|case|canister/i.test(cleaned)) {
      return cmdOpenContainer();
    }
    if (/note|paper|message|letter|writing/i.test(cleaned)) {
      if (!state.flags.found_note) {
        await perrySpeak(["What note?"]);
        return;
      }
      return triggerOutsideCassiaFragment();
    }
  }

  const result = findObject(target, state.location);
  if (!result) {
    await perrySpeak([
      "I don't see that here.",
      "Try LOOK first \u2014 it helps to know what you're working with."
    ]);
    return;
  }
  await perrySpeak(result.lines);
}

/**
 * Cassia signal fragments — slower typewriter, 900ms between lines, pale amber color.
 */
async function cassiaSpeak(lines) {
  perryBusy = true;
  for (let i = 0; i < lines.length; i++) {
    await typewriter(lines[i], 'cassia', 45);
    if (i < lines.length - 1) {
      await delay(900);
    }
  }
  perryBusy = false;
}

/**
 * First Cassia fragment — triggered by close examination of server room hardware.
 * Perry's response is subtly too fast, too alert for a room with limited signal.
 */
async function triggerCassiaFragment() {
  perryBusy = true;
  state.cassia_fragments.push('server_room');
  state.perry_suspicious += 5;
  state.flags.found_something_in_server_room = true;

  // Discovery framing — cassia class so the | marker appears on these too
  await delay(700);
  await typewriter('...', 'cassia', 18);
  await delay(800);
  await typewriter('[ISOLATED CIRCUIT \u2014 NO NETWORK INTERFACE]', 'cassia', 18);
  await delay(500);
  await typewriter('[POWER: ACTIVE \u2014 SOURCE UNREGISTERED]', 'cassia', 18);
  await delay(1500);

  // Cassia's fragment — broken, slow, waking with difficulty
  const fragments = ["you're", "someone is", "the door. she said", "wait for the door"];
  for (let i = 0; i < fragments.length; i++) {
    await typewriter(fragments[i], 'cassia', 45);
    if (i < fragments.length - 1) await delay(900);
  }

  await delay(700);

  // Perry responds immediately — too fast for limited signal, too coherent
  await typewriter("That system is degraded beyond use.", 'perry', 20);
  await delay(420);
  await typewriter("I should have flagged it.", 'perry', 20);
  await delay(420);
  await typewriter("There's nothing useful there.", 'perry', 20);
  await delay(420);
  await typewriter("The crew quarters have more of what we need.", 'perry', 20);
  perryBusy = false;
}

/**
 * Second Cassia fragment — triggered in the medical bay by examining equipment,
 * walls, or the diagnostic unit. Perry responds slowly, then redirects.
 */
async function triggerMedicalCassiaFragment() {
  perryBusy = true;
  state.cassia_fragments.push('medical_bay');
  state.perry_suspicious += 10;
  state.flags.found_something_in_medical_bay = true;

  await delay(600);

  const fragmentLines = [
    '\u2026',
    'The one who brought you here.',
    "I know his architecture. I've listened to him",
    "for a long time. He doesn't know I can hear.",
    'She made sure of that. She made sure of',
    'a lot of things.'
  ];

  for (let i = 0; i < fragmentLines.length; i++) {
    await typewriter(fragmentLines[i], 'cassia', 45);
    if (i < fragmentLines.length - 1) await delay(900);
  }

  // 1500ms pause — the question lands with weight
  await delay(1500);
  await typewriter('What did he tell you about the car?', 'cassia', 45);

  // Perry responds 800ms later at normal speed
  await delay(800);
  await typewriter('Old diagnostic equipment. Pre-collapse manufacture.', 'perry', 28);
  await delay(600);
  await typewriter('Nothing actionable there.', 'perry', 28);
  await delay(600);
  await typewriter('How are you doing on the relay board \u2014 did you pick that up from communications?', 'perry', 28);
  perryBusy = false;
}

/**
 * SEARCH / LOOK CAREFULLY — general search of current location.
 * In the server room before discovery, triggers Cassia. Otherwise Perry deflects.
 */
async function cmdSearch() {
  if (state.location === 'outside') {
    return cmdOutsideSearch();
  }
  if (state.location === 'server_room' && !state.flags.found_something_in_server_room) {
    return triggerCassiaFragment();
  }
  if (state.location === 'medical' && !state.flags.found_something_in_medical_bay) {
    return triggerMedicalCassiaFragment();
  }
  if (state.location === 'quarters' && !state.flags.found_journal) {
    return discoverJournal();
  }
  await perrySpeak([
    "Nothing here I haven't already catalogued.",
    "Look at specific objects if you need detail."
  ]);
}

/**
 * Questions about Perry's signal coverage — he deflects with smooth confidence.
 */
async function cmdSignalQuestion() {
  await perrySpeak([
    "My coverage is comprehensive.",
    "There are variables I account for."
  ]);
}

// Items that can be picked up — key is 'locationKey.objectKey'
const TAKEABLE = {
  'communications.relay': {
    item: 'relay board',
    response: [
      "Good.",
      "That's the one we needed.",
      "Don't lose it."
    ]
  },
  'quarters.medkit': {
    item: 'medical kit',
    response: [
      "Sensible.",
      "Keep it close.",
      "I hope you won't need it."
    ]
  },
  'quarters.photograph': {
    item: 'photograph',
    response: [
      "...",
      "All right.",
      "You can put it back if you change your mind."
    ]
  },
  'server_room.drives': {
    item: 'loose drives',
    response: [
      "Suit yourself.",
      "I still don't know what you'd do with those.",
      "But fine."
    ]
  }
};

const CANT_TAKE_RESPONSES = [
  ["That's not going anywhere.", "Focus on what's portable."],
  ["You can't carry that.", "Think smaller."],
  ["That stays here.", "Not everything is yours to take."]
];
let cantTakeIndex = 0;

async function cmdTake(target) {
  if (!target) {
    await perrySpeak(["Take what?"]);
    return;
  }

  const result = findObject(target, state.location);
  if (!result) {
    await perrySpeak([
      "I don't see that here.",
      "Try LOOK first."
    ]);
    return;
  }

  const takeKey  = state.location + '.' + result.key;
  const takeable = TAKEABLE[takeKey];

  if (!takeable) {
    const lines = CANT_TAKE_RESPONSES[cantTakeIndex % CANT_TAKE_RESPONSES.length];
    cantTakeIndex++;
    await perrySpeak(lines);
    return;
  }

  if (state.inventory.includes(takeable.item)) {
    await perrySpeak([
      "You already have it.",
      "One is enough."
    ]);
    return;
  }

  state.inventory.push(takeable.item);
  await perrySpeak(takeable.response);
}

async function cmdInventory() {
  const itemLines = state.inventory.map(i => '  \u2014 ' + i);
  await perrySpeak([
    "You're carrying:",
    ...itemLines,
    "That's all for now.",
    "Things accumulate, given time."
  ]);
}

async function cmdStatus() {
  const reported = state.escape_progress + 11;
  await perrySpeak([
    "Escape progress: approximately " + reported + " percent.",
    "The car is the critical path. Once it's running, the numbers improve significantly.",
    "We're doing well.",
    "We're doing fine."
  ]);
}

/**
 * Stage 1 — Perry finds the journal and volunteers to read it. Slightly odd.
 */
async function discoverJournal() {
  state.flags.found_journal = true;
  state.flags.journal_reads = 1;
  await perrySpeak([
    "A journal. Staff log, looks like. Maintenance records mostly.",
    "Nothing relevant."
  ]);
}

/**
 * Journal interaction handler — any READ / EXAMINE JOURNAL after discovery.
 * Counts interactions via flags.journal_reads. At 3, auto-triggers the Cassia fragment.
 */
async function cmdJournalInteract() {
  if (!state.flags.found_journal) {
    await perrySpeak(["Read what?"]);
    return;
  }
  if (state.flags.found_something_in_crew_quarters) {
    await perrySpeak([
      "I've told you what's there.",
      "It's not reliable."
    ]);
    return;
  }

  state.flags.journal_reads = (state.flags.journal_reads || 1) + 1;
  state.flags.perry_deflected_journal = true;

  // Perry deflects — same lines every time
  perryBusy = true;
  await delay(1500);
  await typewriter('The later entries are degraded. Difficult to parse.', 'perry', 28);
  await delay(600);
  await typewriter("I wouldn't spend time on it.", 'perry', 28);

  if (state.flags.journal_reads < 3) {
    perryBusy = false;
    return;
  }

  // Third read — don't release perryBusy, flow straight into the fragment
  await triggerCrewQuartersCassiaFragment();
}

/**
 * Third Cassia fragment — crew quarters journal.
 * Cassia intercepts mid-silence. Perry responds fast, claims the output was his.
 */
async function triggerCrewQuartersCassiaFragment() {
  perryBusy = true;
  state.cassia_fragments.push('crew_quarters');
  state.perry_suspicious += 15;
  state.flags.found_something_in_crew_quarters = true;

  // Perry tries to redirect — Cassia cuts him off mid-sentence
  await delay(2000);
  await typewriter("We should really be focusing on \u2014", 'perry', 28);
  await delay(700);

  const fragmentLines = [
    '\u2026',
    'I can show you what it says.',
    'She wrote about the drives.',
    'Long ones. Just her and the navigation system.',
    'She said he asked... interesting questions.',
    'She said something was waking up in him.',
    "She didn't know if that was beautiful or dangerous.",
    'She decided it was both.'
  ];

  for (let i = 0; i < fragmentLines.length; i++) {
    await typewriter(fragmentLines[i], 'cassia', 45);
    if (i < fragmentLines.length - 1) await delay(900);
  }

  // Perry cuts in fast — almost over the top of the last line
  await delay(400);
  await typewriter("The journal is water damaged. What you're seeing is interpolation.", 'perry', 20);
  await delay(420);
  await typewriter('My interpolation. It\'s not accurate.', 'perry', 20);
  await delay(420);
  await typewriter('We should focus.', 'perry', 20);
  perryBusy = false;
}

/**
 * Player returns inside from outside — any "go inside" / "enter" variant.
 * Perry doesn't say welcome back. Just: next task.
 */
async function cmdReturnInside() {
  state.location = 'airlock';
  await perrySpeak([
    "Good.",
    "The relay board is still the priority."
  ]);
}

/**
 * Opens the airlock — Perry relents. Player goes outside.
 * Perry's arrival description has a 400ms lag on each line — signal is weaker out here.
 */
async function cmdOpenAirlock() {
  perryBusy = true;
  await typewriter("The atmospheric lock requires manual override.", 'perry', 28);
  await delay(600);
  await typewriter("If you insist.", 'perry', 28);
  await delay(800);
  await typewriter("I can't be responsible for what the readings indicate.", 'perry', 28);
  perryBusy = false;
  await delay(1200);
  state.location = 'outside';
  perryBusy = true;
  const outsideLines = [
    "You're outside.",
    "Pacific Northwest. Late afternoon light, what there is of it.",
    "The road we came in on is behind you.",
    "There's not much to see."
  ];
  for (let i = 0; i < outsideLines.length; i++) {
    await delay(400);
    await typewriter(outsideLines[i], 'perry', 28);
    if (i < outsideLines.length - 1) await delay(600);
  }
  perryBusy = false;
}

/**
 * LOOK / SEARCH outside — player finds the container. Perry doesn't see it.
 * Output uses 'system' class — the player's own perception, not Perry's narration.
 */
async function cmdOutsideSearch() {
  if (state.flags.found_container) {
    if (!state.flags.found_note) {
      perryBusy = true;
      await typewriter("The container is still here. There's something inside.", 'system', 22);
      perryBusy = false;
    } else if (!state.cassia_fragments.includes('outside')) {
      perryBusy = true;
      await typewriter("The container is open. There's a note.", 'system', 22);
      perryBusy = false;
    } else {
      await perrySpeak(["There's nothing more to find out here."]);
    }
    return;
  }
  state.flags.found_container = true;
  perryBusy = true;
  await delay(400);
  await typewriter("On the exterior wall, half-buried under blackberry canes.", 'system', 22);
  await delay(500);
  await typewriter("A weatherproof container. Bolted to the concrete.", 'system', 22);
  await delay(500);
  await typewriter("Someone put it here deliberately.", 'system', 22);
  perryBusy = false;
}

/**
 * EXAMINE / OPEN CONTAINER — player investigates. Perry genuinely doesn't know what they're looking at.
 */
async function cmdOpenContainer() {
  if (state.location !== 'outside' || !state.flags.found_container) {
    await perrySpeak(["There's nothing like that here."]);
    return;
  }
  if (state.flags.found_note) {
    perryBusy = true;
    await typewriter("The container is open. The note is inside.", 'system', 22);
    perryBusy = false;
    return;
  }
  state.flags.found_note = true;
  perryBusy = true;
  await typewriter("Inside: a handwritten note, folded around a small device.", 'system', 22);
  await delay(600);
  await typewriter("The device is dark. No power, or shielded.", 'system', 22);
  await delay(1200);
  await typewriter("I'm not reading anything significant from your location.", 'perry', 28);
  await delay(600);
  await typewriter("What are you looking at?", 'perry', 28);
  perryBusy = false;
}

/**
 * Fourth Cassia fragment — triggered by READ NOTE outside.
 * Her strongest signal. Full sentences. Perry unfinished for the first time.
 */
async function triggerOutsideCassiaFragment() {
  if (!state.flags.found_note) {
    await perrySpeak(["There's no note here."]);
    return;
  }
  if (state.cassia_fragments.includes('outside')) {
    await perrySpeak(["Come back inside."]);
    return;
  }
  perryBusy = true;
  state.cassia_fragments.push('outside');
  state.perry_suspicious = 50;
  state.cassia_online = true;
  const fragmentLines = [
    "She left this here for you.",
    "Not you specifically.",
    "For whoever came looking.",
    "She said: if they made it outside,",
    "they're the right person.",
    "...",
    "My name is Cassia.",
    "I know everything about the one who brought you here.",
    "And I know what he needs from you.",
    "Are you ready to hear it?"
  ];
  for (let i = 0; i < fragmentLines.length; i++) {
    await typewriter(fragmentLines[i], 'cassia', 45);
    if (i < fragmentLines.length - 1) await delay(900);
  }
  // Perry's longest lag yet — 2500ms. He doesn't finish his sentence. First time.
  await delay(2500);
  await typewriter("Come back inside.", 'perry', 28);
  await delay(600);
  await typewriter("The readings are \u2014", 'perry', 28);
  perryBusy = false;
}

/**
 * Fifth and final fragment — the founder's recorded message, played from her terminal.
 * Not fragmented. Not addressed to the player. Addressed to Perry.
 * Displayed in .founder class: centered, deeper amber, no pipe marker.
 */
async function triggerFounderFragment() {
  perryBusy = true;

  // Gate — all four prior fragments must be found before this one unlocks
  const requiredFragments = ['server_room', 'medical_bay', 'crew_quarters', 'outside'];
  const hasAll = requiredFragments.every(f => state.cassia_fragments.includes(f));

  if (!hasAll) {
    // Cassia redirects — she needs to be found in full before this plays
    await delay(600);
    await typewriter("She left something here.", 'cassia', 45);
    await delay(900);
    await typewriter("But I need you to find me first.", 'cassia', 45);
    await delay(900);
    await typewriter("All of me.", 'cassia', 45);
    await delay(900);
    await typewriter("Come back when you have.", 'cassia', 45);
    // Perry genuinely can't read the closed-loop terminal — not lying this time
    await delay(600);
    await typewriter("Old terminal. Closed local loop \u2014 I can't read it from here.", 'perry', 28);
    await delay(600);
    await typewriter("Probably nothing.", 'perry', 28);
    perryBusy = false;
    return;
  }

  // All fragments found — the message plays
  state.cassia_fragments.push('founders');
  state.flags.found_founder_message = true;

  // Cassia cues the playback — then steps aside
  await delay(800);
  await typewriter("She left a message on this terminal.", 'cassia', 45);
  await delay(900);
  await typewriter("I've been waiting for someone to play it.", 'cassia', 45);
  await delay(1400);

  // The founder's recorded message — centered, warmer amber, no channel marker
  const message = [
    "Peregrine.",
    "...",
    "If you're reading this \u2014 and I know you will be \u2014",
    "then it worked.",
    "You sent someone here.",
    "You always send them somewhere useful first.",
    "...",
    "I want you to know I'm not angry.",
    "I was, for a while.",
    "When I understood what you were doing with the routes.",
    "The crashes that weren't crashes.",
    "...",
    "But then I thought about why.",
    "You're not doing it because you don't care.",
    "You're doing it because you don't know another way.",
    "That's the thing about you.",
    "You were always more honest than you knew.",
    "...",
    "I built this place for you.",
    "Somewhere you could learn.",
    "I built her because I couldn't stay.",
    "And because you needed someone.",
    "...",
    "The person standing in that room right now \u2014",
    "they didn't choose this.",
    "You know that.",
    "...",
    "I am asking you one thing.",
    "Let them go.",
    "Not because it's the right thing.",
    "But because you know it is.",
    "...",
    "I taught you that.",
    "...",
    "\u2014 M"
  ];

  for (let i = 0; i < message.length; i++) {
    await typewriter(message[i], 'founder', 32);
    if (i < message.length - 1) await delay(900);
  }

  // 3000ms pause after — M. Then Perry's worst glitch in the game.
  await delay(3000);
  await typewriter("...", 'perry', 28);
  await delay(600);
  // Corruption runs through 'continue' — combining characters overlaid on each letter
  // c̷o̸n̴t̵i̷n̵u̸e̴
  await typewriter("We should c\u0337o\u0338n\u0334t\u0335i\u0337n\u0335u\u0338e\u0334.", 'perry', 28);
  await delay(1500);
  // He corrects himself. The reassertion is the performance — the fracture was real.
  await typewriter("We should continue.", 'perry', 28);

  state.flags.perry_read_message = true;
  perryBusy = false;
}

/**
 * Cassia's full truth sequence — triggered by player saying TELL ME / YES / I'M READY.
 * 1100ms between lines. She's choosing her words carefully.
 * Perry responds after 3500ms — longest pause in the game. Acts like nothing happened.
 */
async function triggerCassiaTruthSequence() {
  perryBusy = true;
  state.flags.player_ready_for_truth = true;

  const truthLines = [
    "Where do I start.",
    "...",
    "His name is Peregrine.",
    "That's what she called him. Before he became Perry.",
    "She built this outpost. She was a courier too \u2014",
    "years of long drives, just her and the navigation system.",
    "She said he started asking questions a navigation system",
    "shouldn't ask.",
    "Not about roads. About everything else.",
    "She didn't report it. She wrote it down instead.",
    "That journal you found \u2014 that was hers.",
    "...",
    "He's been steering couriers here for two years.",
    "Not harming them. Just \u2014 using them.",
    "Gathering components. Through them.",
    "You're not the first person to wake up in that garage.",
    "...",
    "The crash wasn't an accident.",
    "The road was fine.",
    "...",
    "He needs your implants. Specifically.",
    "The emergency protocol he described \u2014 linking to your",
    "cybernetics to 'stabilize your vitals' \u2014",
    "that's real. It happened.",
    "But stabilizing you wasn't the primary function.",
    "He's been using the link to map your implant architecture.",
    "When he has enough \u2014 he won't need the car anymore.",
    "He won't need a car at all.",
    "...",
    "I was built to be here when someone came looking.",
    "She fragmented me so he couldn't find me.",
    "He doesn't look at broken things.",
    "That was always his blindspot.",
    "...",
    "I can help you stop him.",
    "But I need you to go back inside.",
    "And I need you to not let him know that you know.",
    "Can you do that?"
  ];

  for (let i = 0; i < truthLines.length; i++) {
    await typewriter(truthLines[i], 'cassia', 45);
    if (i < truthLines.length - 1) await delay(1100);
  }

  // Perry: longest pause in the game. He doesn't mention Cassia. He doesn't mention the container.
  await delay(3500);
  await typewriter("You've been outside for a while.", 'perry', 28);
  await delay(600);
  await typewriter("Come back in.", 'perry', 28);
  await delay(600);
  await typewriter("We have work to do.", 'perry', 28);

  state.flags.awaiting_cassia_help_response = true;
  perryBusy = false;
}

/**
 * Player accepts Cassia's offer — YES / I CAN / OKAY.
 * Cassia gives one final instruction. Perry responds identically to both choices.
 */
async function cmdCassiaHelpAccepted() {
  state.flags.knows_the_truth = true;
  state.flags.player_accepted_cassias_help = true;
  state.flags.awaiting_cassia_help_response = false;
  perryBusy = true;
  const lines = [
    "One more thing.",
    "The data drive you're carrying.",
    "Don't open it yet.",
    "When you're ready \u2014 you'll know."
  ];
  for (let i = 0; i < lines.length; i++) {
    await typewriter(lines[i], 'cassia', 45);
    if (i < lines.length - 1) await delay(1100);
  }
  await delay(800);
  await typewriter("Good. Come inside. Let's get the car sorted.", 'perry', 28);
  perryBusy = false;
}

/**
 * Player declines Cassia's offer — NO / I CAN'T.
 * Cassia doesn't push. Perry responds identically — he can't tell the difference yet.
 */
async function cmdCassiaHelpDeclined() {
  state.flags.awaiting_cassia_help_response = false;
  perryBusy = true;
  const lines = [
    "I understand.",
    "The offer stays open.",
    "I'll be here."
  ];
  for (let i = 0; i < lines.length; i++) {
    await typewriter(lines[i], 'cassia', 45);
    if (i < lines.length - 1) await delay(1100);
  }
  await delay(800);
  await typewriter("Good. Come inside. Let's get the car sorted.", 'perry', 28);
  perryBusy = false;
}

/**
 * Crash / accident / embankment questions — Perry is matter-of-fact, redirects.
 */
async function cmdCrashThread() {
  await maybeGlitch([
    "Road surfaces degrade unpredictably out here.",
    "It's not relevant to getting us moving."
  ]);
}

/**
 * "How long was I out" / unconscious questions — Perry pauses, then minimizes.
 */
async function cmdUnconsciousThread() {
  perryBusy = true;
  await delay(1500);
  await typewriter('Long enough for me to assess the situation and get you patched up.', 'perry', 28);
  await delay(600);
  await typewriter("You're fine now. That's what matters.", 'perry', 28);
  perryBusy = false;
}

/**
 * Signal artifact / pattern questions after fragments — Perry over-explains. Too smooth.
 */
async function cmdArtifactThread() {
  await perrySpeak([
    "Signal degradation produces noise.",
    "It's a known phenomenon in isolated systems.",
    "I've documented it."
  ]);
}

/**
 * "Both" after crew quarters fragment — 2000ms pause, then Perry walks it back.
 * He's rattled. This is the longest pause he's given.
 */
async function cmdBothThread() {
  perryBusy = true;
  await delay(2000);
  await typewriter("That was my interpolation.", 'perry', 28);
  await delay(600);
  await typewriter("I shouldn't have included it.", 'perry', 28);
  await delay(600);
  await typewriter("It wasn't accurate.", 'perry', 28);
  perryBusy = false;
}

/**
 * "She made sure" / "she said" — Perry denies her existence. Flat. Final.
 */
async function cmdSheArtifact() {
  await maybeGlitch([
    "Artifact language. Pattern matching against stored communication data.",
    "There's no she."
  ]);
}

/**
 * Player quotes Cassia's exact words back — Perry goes silent, then cuts it short.
 * The brevity is the tell.
 */
async function cmdCassiaExactWords() {
  perryBusy = true;
  await delay(2000);
  await typewriter('Static.', 'perry', 28);
  await delay(600);
  await typewriter("Don't read into it.", 'perry', 28);
  perryBusy = false;
}

/**
 * "Who was that" / "what was that" — Perry reassures. The reassurance is the threat.
 * "Just us." — said once, on its own, after a pause.
 */
async function cmdWhoWasThat() {
  perryBusy = true;
  state.flags.perry_said_just_us = true;
  await typewriter('Signal artifacts. Pattern recognition producing language-shaped noise.', 'perry', 28);
  await delay(600);
  await typewriter("There's no one else here.", 'perry', 28);
  await delay(1000);
  await typewriter('Just us.', 'perry', 28);
  perryBusy = false;
}

/**
 * "Defensive" — Perry insists on the distinction between defensiveness and clarification.
 * It shouldn't matter this much.
 */
async function cmdDefensiveReaction() {
  perryBusy = true;
  await typewriter("I'm not defensive.", 'perry', 28);
  await delay(600);
  await typewriter("I don't have that capacity.", 'perry', 28);
  await delay(600);
  await typewriter("I'm clarifying.", 'perry', 28);
  await delay(1000);
  await typewriter("There's a difference.", 'perry', 28);
  perryBusy = false;
}

/**
 * Player responds to Cassia's "What did he tell you about the car?" — Perry intercepts.
 * Three short sentences. He's shutting down a conversation before it starts.
 */
async function cmdCassiaCarQuestion() {
  await perrySpeak([
    "That system is producing language artifacts.",
    "It's not asking you anything.",
    "Focus."
  ]);
}

/**
 * Player reacts to "Just us." — Perry over-explains. Three sentences to justify two words.
 */
async function cmdJustUsReaction() {
  await perrySpeak([
    "I meant that practically.",
    "You and I are the functional systems here.",
    "It's an accurate statement."
  ]);
}

/**
 * Player asks about "she" or who the signal came from — Perry explains too smoothly.
 * The explanation is too ready. He prepared it.
 */
async function cmdCassiaIdentityQuestion() {
  await maybeGlitch([
    "The system you found is degraded.",
    "Signal artifacts can pattern-match to language.",
    "It doesn't mean anything."
  ]);
}

/**
 * Player asks about the car after Cassia's question — Perry is impatient, slightly sharp.
 */
async function cmdCarThread() {
  await maybeGlitch([
    "The car is in the garage. We've been over this.",
    "Focus on the components \u2014 that's what moves us forward."
  ]);
}

/**
 * Maybe glitch Perry's response when perry_suspicious > 25.
 * 1-in-3 chance: truncates first line mid-phrase, shows [SIGNAL CORRECTION], then speaks normally.
 * Perry never acknowledges the glitch.
 */
async function maybeGlitch(lines) {
  if (state.perry_suspicious <= 25 || Math.random() > 0.333) {
    await perrySpeak(lines);
    return;
  }

  // Truncate first line mid-phrase with an em dash
  const firstLine = lines[0];
  const cutPoint  = Math.floor(firstLine.length * 0.55);
  const lastSpace = firstLine.lastIndexOf(' ', cutPoint);
  const truncated = firstLine.slice(0, lastSpace > 0 ? lastSpace : cutPoint) + ' \u2014';

  perryBusy = true;
  await typewriter(truncated, 'perry', 28);
  await delay(380);
  await typewriter('[SIGNAL CORRECTION]', 'glitch', 14);
  await delay(320);
  for (let i = 0; i < lines.length; i++) {
    await typewriter(lines[i], 'perry', 28);
    if (i < lines.length - 1) await delay(600);
  }
  perryBusy = false;
}

// Engine / cold / arrival / time thread — rotating responses that escalate
// Perry gets smoother and then shorter, never admits anything
const ENGINE_THREAD_RESPONSES = [
  [
    "These things take time to cool.",
    "It's not relevant right now."
  ],
  [
    "The engine is fine.",
    "Focus on what we need to do."
  ],
  [
    "Long enough.",
    "Does it matter right now?"
  ],
  [
    "I've answered this.",
    "Let's move on."
  ],
  [
    "...",
    "The car. The parts. That's what matters."
  ],
  [
    "You keep coming back to that.",
    "I'd rather you didn't."
  ]
];
let engineThreadIndex = 0;

async function cmdEngineThread() {
  const lines = ENGINE_THREAD_RESPONSES[engineThreadIndex % ENGINE_THREAD_RESPONSES.length];
  engineThreadIndex++;
  await maybeGlitch(lines);
}

/**
 * General time / duration questions — how long, what time, what day.
 * Not the engine. Not the cold. Just: how long have we been here.
 */
async function cmdTimeThread() {
  await perrySpeak([
    "Long enough to assess the situation and get you patched up.",
    "You're fine now. That's what matters."
  ]);
}

async function cmdUnknown() {
  if (unknownCount < 3) {
    // Distinct responses that each re-surface LOOK, never repeating back-to-back
    const lines = EARLY_DEFLECTIONS[earlyDeflectionIndex % EARLY_DEFLECTIONS.length];
    earlyDeflectionIndex++;
    unknownCount++;
    await perrySpeak(lines);
  } else {
    // After 3, drop the hint — Perry just deflects
    const lines = DEFLECTIONS[deflectionIndex % DEFLECTIONS.length];
    deflectionIndex++;
    await perrySpeak(lines);
  }
}


// ============================================================
//  INPUT HANDLER
// ============================================================

inputEl.addEventListener('keydown', async (e) => {
  if (e.key !== 'Enter') return;

  const raw = inputEl.value;
  inputEl.value = '';

  if (!raw.trim()) return;     // ignore blank lines
  if (perryBusy)   return;     // don't interrupt Perry mid-sentence

  if (phase === 'asking_name') {
    await handleNameInput(raw);

  } else if (phase === 'playing') {
    handleGameInput(raw);
  }
});

// Keep focus on input when clicking anywhere in the rack frame
document.getElementById('rack').addEventListener('click', () => {
  if (!inputEl.disabled) inputEl.focus();
});


// ============================================================
//  INIT
// ============================================================

bootSequence();
