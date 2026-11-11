/* Starbound Academy guided vertical slices.
   This file extends the working prototype without changing its backup format. */

const GUIDED_SLICES = {
  'r-short-a-workshop-v1': {
    learner: 'Robby',
    subject: 'reading',
    id: 'r-short-a-workshop-v1',
    title: 'The Short-A Snack Attack',
    desc: 'Five playful missions on one vowel: hear it, build it, read it, and beat the Snack Boss.',
    skill: 'B.E.S.T. ELA.1.F.1.3 · short-a decoding and encoding',
    type: 'guided-slice',
    slice: 'short-a'
  },
  't-storm-core-trial-v1': {
    learner: 'Tommy',
    subject: 'reading',
    id: 't-storm-core-trial-v1',
    title: 'The Storm Core Trial',
    desc: 'A high-speed story trial about cause, motive, inference, and evidence that actually matters.',
    skill: 'B.E.S.T. ELA.2.R.1.1–3 · causality, inference, and textual evidence',
    type: 'guided-slice',
    slice: 'storm-core'
  }
};

LESSONS.Robby.reading.unshift(GUIDED_SLICES['r-short-a-workshop-v1']);
LESSONS.Tommy.reading.unshift(GUIDED_SLICES['t-storm-core-trial-v1']);

state.sliceProgress ||= {};
state.pointsLedger ||= [];
state.artifacts ||= [];

const SLICE_STEPS = [
  ['Remember', 'Wake up the idea'],
  ['Learn', 'See the rule'],
  ['Practice', 'Change and compare'],
  ['Apply', 'Use it in context'],
  ['Boss', 'Show what you know']
];
const DIFFICULTY_POINTS = { normal: 50, hard: 75, master: 100 };
let activeSlice = null;
const legacyOpenLesson = window.openLesson;

window.openLesson = function openStarboundLesson(id) {
  const slice = GUIDED_SLICES[id];
  if (!slice) {
    $('#lessonDialog').classList.remove('slice-mode');
    return legacyOpenLesson(id);
  }
  currentLesson = slice;
  currentSubject = slice.subject;
  activeSlice = slice;
  $('#lessonDialog').classList.add('slice-mode');
  renderGuidedSlice();
  $('#lessonDialog').showModal();
};

function sliceKey(slice = activeSlice) {
  return `${state.current}:${slice.id}`;
}

function freshSliceSession() {
  return {
    stage: 0,
    difficulty: 'normal',
    completedStages: [],
    answers: {},
    support: { readAloud: false, wordAudio: false, hints: 0 },
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bossPassed: false,
    drawing: { strokes: [], label: '', color: '#ff706a' }
  };
}

function getSliceSession() {
  const key = sliceKey();
  state.sliceProgress ||= {};
  state.sliceProgress[key] ||= freshSliceSession();
  return state.sliceProgress[key];
}

function updateSliceSession(change = {}) {
  const session = getSliceSession();
  Object.assign(session, change, { updatedAt: new Date().toISOString() });
  saveState();
  return session;
}

function markStageComplete(stage) {
  const session = getSliceSession();
  if (!session.completedStages.includes(stage)) session.completedStages.push(stage);
  session.updatedAt = new Date().toISOString();
  saveState();
}

function guidedPath(session) {
  return `<ol class="guided-path" aria-label="Five-part lesson">
    ${SLICE_STEPS.map(([name, note], index) => {
      const done = session.completedStages.includes(index);
      const current = session.stage === index;
      return `<li class="${done ? 'done' : ''} ${current ? 'current' : ''}">
        <button data-stage="${index}" ${current ? 'aria-current="step"' : ''}>
          <span>${done ? '✓' : index + 1}</span><b>${name}</b><small>${note}</small>
        </button>
      </li>`;
    }).join('')}
  </ol>`;
}

function difficultyPicker(session) {
  return `<div class="difficulty-picker" role="group" aria-label="Choose difficulty">
    ${Object.entries(DIFFICULTY_POINTS).map(([level, points]) =>
      `<button data-difficulty="${level}" class="${session.difficulty === level ? 'selected' : ''}" aria-pressed="${session.difficulty === level}">
        <b>${level[0].toUpperCase() + level.slice(1)}</b><small>${points} points</small>
      </button>`).join('')}
  </div>`;
}

function renderGuidedSlice() {
  const session = getSliceSession();
  const isRobby = activeSlice.slice === 'short-a';
  const stageBody = isRobby ? renderShortAStage(session) : renderStormStage(session);
  const textbook = isRobby ? shortATextbook() : stormTextbook();
  $('#lessonContent').innerHTML = `<article class="guided-shell ${isRobby ? 'short-a-theme' : 'storm-theme'}" data-level="${session.difficulty}">
    <header class="guided-hero">
      <div>
        <p class="guided-world">Story Nebula · ${isRobby ? 'Launch Region' : 'Frontier challenge'}</p>
        <h2>${esc(activeSlice.title)}</h2>
        <p>${esc(activeSlice.desc)}</p>
      </div>
      <div class="mission-seal" aria-label="Five-part mission"><b>5</b><span>parts</span></div>
      <button class="guided-close" data-guided-close aria-label="Close and save lesson">×</button>
    </header>
    <section class="guided-controls">
      ${difficultyPicker(session)}
      <details class="field-guide">
        <summary>Optional read-along book</summary>
        ${textbook}
      </details>
    </section>
    ${guidedPath(session)}
    <main class="guided-stage" id="guidedStage">${stageBody}</main>
    <footer class="guided-save"><span>Saved on this device</span><span>${session.completedStages.length} of 5 parts checked</span></footer>
  </article>`;
  bindGuidedSlice();
}

function stageHeading(kicker, title, copy, icon) {
  return `<div class="stage-heading"><span class="stage-icon" aria-hidden="true">${icon}</span><div><p>${kicker}</p><h3>${title}</h3><div>${copy}</div></div></div>`;
}

function nextStageButton(stage, label = 'Continue') {
  return `<button class="stage-next" data-next-stage="${Math.min(stage + 1, 4)}">${label}</button>`;
}

function completePanel(stage, message, label) {
  return `<div class="stage-complete" role="status"><span>✓</span><div><b>${message}</b><p>Your checkpoint is saved.</p></div>${stage < 4 ? nextStageButton(stage, label) : ''}</div>`;
}

const SHORT_A_SOUND_WORDS = [
  ['map', true, 'A map helps the snack ship.'],
  ['sun', false, 'Sun has a different middle sound.'],
  ['cat', true, 'Cat has short a in the middle.'],
  ['fish', false, 'Fish has a different middle sound.'],
  ['jam', true, 'Jam has short a in the middle.'],
  ['top', false, 'Top has a different middle sound.']
];
const SHORT_A_BUILD_WORDS = ['sat', 'map', 'jam', 'ham'];
const SHORT_A_TRANSFORMS = [
  { from: 'at', instruction: 'Add one sound to make sat.', choices: ['s', 'm', 'p'], answer: 's', result: 'sat' },
  { from: 'sat', instruction: 'Change the first sound to make mat.', choices: ['m', 'r', 'f'], answer: 'm', result: 'mat' },
  { from: 'mat', instruction: 'Change the last sound to make map.', choices: ['p', 'n', 'd'], answer: 'p', result: 'map' },
  { from: 'map', instruction: 'Change the first sound to make nap.', choices: ['n', 't', 's'], answer: 'n', result: 'nap' }
];

function renderShortAStage(session) {
  const a = session.answers;
  switch (session.stage) {
    case 0: {
      const correct = a.soundCorrect || [];
      const done = correct.length === 3;
      return `${stageHeading('Part 1 · Remember', 'Sound Kitchen', 'The machine only wants words with <strong>/ă/</strong> in the middle. Hear a word, then decide whether it belongs in the short-a pan.', '👂')}
        <div class="mouth-cue"><span>ă</span><div><b>Open your mouth wide and relaxed.</b><p>Short a sounds like the middle of <em>map</em>. It is a sound—not the letter name “A.”</p></div><button data-speak="map">Hear “map”</button></div>
        <div class="sound-sort" aria-label="Short-a sound sorting practice">
          ${SHORT_A_SOUND_WORDS.map(([word, isA]) => `<button data-sound-sort="${word}" data-correct="${isA}" class="${correct.includes(word) ? 'correct' : ''}"><span>▶</span><b>${word}</b><small>${correct.includes(word) ? 'In the pan!' : 'Hear it'}</small></button>`).join('')}
        </div>
        <p class="practice-status" id="sliceStatus">Find all 3 short-a words. Different sounds are useful clues too.</p>
        ${done ? completePanel(0, 'Your ears found every short-a middle sound.', 'Build words') : ''}`;
    }
    case 1: {
      const round = a.buildRound || 0;
      const word = SHORT_A_BUILD_WORDS[Math.min(round, SHORT_A_BUILD_WORDS.length - 1)];
      const built = a.builtLetters || [];
      const distractors = session.difficulty === 'normal' ? [] : session.difficulty === 'hard' ? ['i'] : ['i', 'o'];
      const letters = [...new Set([...word.split(''), ...distractors])].sort();
      const done = round >= SHORT_A_BUILD_WORDS.length;
      if (done) return `${stageHeading('Part 2 · Learn', 'Pod Recipe complete', 'One sound went into each pod. Then the sounds snapped together into words.', '🧪')}${completePanel(1, 'You built four short-a words from their sounds.', 'Enter the reactor')}`;
      return `${stageHeading('Part 2 · Learn', 'Pod Recipe', `Build word ${round + 1} of ${SHORT_A_BUILD_WORDS.length}. Listen, stretch the sounds, then put one letter in each pod.`, '🧪')}
        <div class="word-prompt"><button data-speak-build="${word}">▶ Hear the word</button><b>${session.difficulty === 'normal' ? word.split('').map((letter, i) => i === 1 ? '/ă/' : `/${letter}/`).join(' · ') : '● · ● · ●'}</b></div>
        <div class="phoneme-pods" aria-label="Built word">${[0, 1, 2].map(i => `<button data-remove-letter="${i}" class="${built[i] ? 'filled' : ''}">${built[i] || '•'}</button>`).join('')}</div>
        <div class="letter-bank">${letters.map(letter => `<button data-build-letter="${letter}">${letter}</button>`).join('')}</div>
        <div class="stage-actions"><button data-clear-build>Clear</button><button class="primary-action" data-check-build="${word}">Check recipe</button></div>
        <p class="practice-status" id="sliceStatus">Tap a filled pod to take a letter back out.</p>`;
    }
    case 2: {
      const round = a.transformRound || 0;
      const done = round >= SHORT_A_TRANSFORMS.length;
      if (done) return `${stageHeading('Part 3 · Practice', 'Reactor stable', 'Changing one sound changed the whole word—and what the machine produced.', '⚙')}${completePanel(2, 'You transformed four words without losing short a.', 'Deliver the snack')}`;
      const item = SHORT_A_TRANSFORMS[round];
      return `${stageHeading('Part 3 · Practice', 'Word Reactor', `Transformation ${round + 1} of ${SHORT_A_TRANSFORMS.length}. Keep the middle sound stable while one other part changes.`, '⚙')}
        <div class="reactor-board"><div><small>START</small><b>${item.from}</b></div><span>→</span><div class="mystery-word"><small>TARGET</small><b>?</b></div></div>
        <p class="reactor-instruction">${item.instruction}</p>
        <div class="reactor-choices">${item.choices.map(choice => `<button data-transform-choice="${choice}" data-answer="${item.answer}">${choice}</button>`).join('')}</div>
        <p class="practice-status" id="sliceStatus">Say the start word and target word. Which sound changed?</p>`;
    }
    case 3: {
      const comprehension = a.deliveryAnswer;
      const done = comprehension === 'cat';
      const story = ['Sam sat.', 'A cat sat at a mat.', 'Sam had ham.', 'The cat ran at Sam.', 'Sam ran.', 'The cat had the ham.'];
      return `${stageHeading('Part 4 · Apply', 'Decodable Delivery', 'Read the delivery log. The gold word <strong>the</strong> is a heart word you may know by memory. The other words use the code we practiced.', '📦')}
        <div class="support-choice"><button data-read-story="${esc(story.join(' '))}">▶ Read with me</button><span>or read it yourself for independent-reading evidence</span></div>
        <div class="decodable-story">${story.map((line, i) => `<p><span>${i + 1}</span>${line.split(/(\s+)/).map(part => /^\s+$/.test(part) ? part : `<button data-word-audio="${part.replace(/[^A-Za-z]/g, '')}">${part}</button>`).join('')}</p>`).join('')}</div>
        <fieldset class="story-question"><legend>Who had the ham at the end?</legend>
          ${['Sam', 'the cat', 'a ram'].map(value => `<button data-delivery-answer="${value === 'the cat' ? 'cat' : value}" class="${comprehension === (value === 'the cat' ? 'cat' : value) ? 'selected' : ''}">${value}</button>`).join('')}
        </fieldset>
        <p class="practice-status" id="sliceStatus">${session.support.readAloud ? 'Read-aloud support used—great listening practice. The record keeps it separate from independent reading.' : 'Tap any word only if you need help. Support is allowed and recorded honestly.'}</p>
        ${done ? completePanel(3, 'You read for meaning and tracked the ending.', 'Challenge the Snack Boss') : ''}`;
    }
    default:
      return renderShortABoss(session);
  }
}

function renderShortABoss(session) {
  const a = session.answers;
  const round = a.bossSpellRound || 0;
  const words = ['map', 'sat'];
  const target = words[Math.min(round, 1)];
  const built = a.bossLetters || [];
  const sentencePassed = a.bossSentence === 'A cat sat at a mat.';
  const spellPassed = round >= words.length;
  if (session.bossPassed) return renderShortACelebration(session);
  return `${stageHeading('Part 5 · Boss', 'The Snack Boss', 'No surprise code. Spell two practiced words from sound, then read one new cumulative sentence. The boss is always open.', '👾')}
    <div class="boss-grid">
      <section class="boss-card ${spellPassed ? 'passed' : ''}"><small>TRIAL 1 · SPELL</small>
        ${spellPassed ? '<h4>Two words secured ✓</h4><p>You mapped each sound to a letter.</p>' : `<h4>Spell word ${round + 1} of 2</h4><button data-boss-speak="${target}">▶ Hear the word</button><div class="boss-spelling">${[0, 1, 2].map(i => `<button data-boss-remove="${i}">${built[i] || '•'}</button>`).join('')}</div><div class="letter-bank compact">${['a', 'm', 'p', 's', 't', 'i'].map(letter => `<button data-boss-letter="${letter}">${letter}</button>`).join('')}</div><button data-check-boss-spell="${target}">Check spelling</button>`}
      </section>
      <section class="boss-card ${sentencePassed ? 'passed' : ''}"><small>TRIAL 2 · READ</small><h4>Which sentence is possible with our code?</h4>
        ${['A cat sat at a mat.', 'A cut sit at a mot.', 'A cot set at a mit.'].map(sentence => `<button class="sentence-choice" data-boss-sentence="${sentence}">${sentence}</button>`).join('')}
      </section>
    </div>
    <p class="practice-status" id="sliceStatus">${spellPassed && sentencePassed ? 'The boss is wobbling. Finish the mission!' : 'Take your time. Accuracy matters more than speed.'}</p>
    ${spellPassed && sentencePassed ? '<button class="boss-finish" data-finish-slice>Defeat boss + save evidence</button>' : ''}`;
}

function renderShortACelebration(session) {
  const drawing = session.drawing || { strokes: [], label: '', color: '#ff706a' };
  return `<div class="victory-panel"><span>★</span><div><p>Mission complete</p><h3>The snack machine finally made ham.</h3><p>The alien ate the instruction card too, but your evidence was saved first.</p><b>${DIFFICULTY_POINTS[session.difficulty]} points · ${session.difficulty} difficulty</b></div></div>
    <section class="draw-studio"><div><p>Optional free play</p><h4>Invent a short-a snack creature</h4><p>Draw it, then give it a label containing short a: <em>zap cat</em>, <em>ham ram</em>, or your own decodable invention.</p></div>
      <div class="drawing-tools"><button data-draw-color="#ff706a" class="selected" style="--swatch:#ff706a">Coral</button><button data-draw-color="#11143b" style="--swatch:#11143b">Ink</button><button data-draw-color="#39a968" style="--swatch:#39a968">Green</button><button data-clear-drawing>Clear</button></div>
      <canvas id="sliceDrawing" width="720" height="320" aria-label="Drawing area for a short-a creature"></canvas>
      <div class="drawing-save"><label>Creature label <input id="drawingLabel" value="${esc(drawing.label || '')}" placeholder="ham ram"></label><button data-save-drawing>Save drawing</button></div>
      <p class="practice-status" id="sliceStatus">${drawing.strokes?.length ? 'Your drawing strokes are autosaved.' : 'Use a mouse, finger, or stylus. Drawing is optional.'}</p>
    </section>`;
}

const STORM_STORY = [
  `The storm above Meridian City had stopped moving. Lightning hung in the sky like golden roots, and every clock in the eastern district insisted it was exactly 4:07. Tommy landed on the shield tower expecting a monster. Instead, he found Vex arguing with a door.` ,
  `“Open dramatically,” Vex commanded. The door remained professional. Behind it, the Storm Core spun inside a glass chamber, pulling wild lightning into a calm blue ring around the city. Vex raised one glowing hand. “I remove the core, the storm dies, everyone applauds. Try to keep up.”`,
  `Tommy noticed three things Vex had missed. Each time the core dimmed, the city's outer shield flickered. The maintenance screen called the core a regulator, not a weapon. And a tiny cloud child inside the chamber was frantically pointing—not at the storm, but at the mountains beyond it.`,
  `A red shape moved between those mountains. It was enormous, winged, and apparently allergic to subtle entrances. The storm was hiding the city from it. Destroying the core might end the lightning, but it would also erase the shield and the cloud cover at once.`,
  `Vex began a countdown anyway. He had reached “six,” though nobody remembered authorizing a countdown. Tommy jammed a wrench through the chamber handle. “If you pull that core, the storm stops protecting us before the creature stops looking for us.”`,
  `Together they rerouted the core's pressure into the empty western canyon. The storm unwound without dropping the shield. The red creature flew past the hidden city and stole a farmer's enormous festival sandwich instead. Vex called the plan “acceptable.” The door opened just long enough to hit him on the way out.`
];

function renderStormStage(session) {
  const a = session.answers;
  switch (session.stage) {
    case 0: {
      const answer = a.prediction;
      const done = answer === 'shield';
      return `${stageHeading('Part 1 · Remember', 'Cold Open', 'A good prediction joins clues to what you already know. It does not merely guess the most dramatic explosion.', '⚡')}
        <blockquote class="cold-open">The Storm Core dims. At the exact same moment, the blue wall around Meridian City flickers. Vex reaches to pull the core free.</blockquote>
        <fieldset class="prediction-field"><legend>What is the strongest prediction?</legend>
          <button data-storm-prediction="storm">The storm will become polite and leave.</button>
          <button data-storm-prediction="shield">Removing the core may make the shield fail.</button>
          <button data-storm-prediction="snack">Vex will discover a sandwich inside the machine.</button>
        </fieldset>
        <label class="thinking-note">What clue helped you?<textarea id="predictionWhy" placeholder="The shield flickered when..."></textarea></label>
        <p class="practice-status" id="sliceStatus">Choose the prediction that follows the cause-and-effect clue.</p>
        ${done ? completePanel(0, 'You used the flicker as evidence for a consequence.', 'Read the episode') : ''}`;
    }
    case 1: {
      const done = a.rapidReadCheck === 'regulator';
      const extra = session.difficulty === 'master' ? `<aside class="witness-note"><b>Master file:</b> A guard later claims, “The core caused the storm because both appeared on Tuesday.” Keep this claim in mind. Timing alone does not prove cause.</aside>` : '';
      return `${stageHeading('Part 2 · Learn', 'Rapid Read', 'Read like a story detective: track what the core does, what Vex wants, what Tommy notices, and what changes because of their choice.', '📖')}
        <div class="read-toolbar"><button data-read-storm>▶ Natural read-along</button><button data-stop-speech>■ Stop</button><span>Read-aloud supports comprehension but is recorded separately from independent reading.</span></div>
        <article class="storm-passage ${session.difficulty === 'normal' ? 'chunked' : ''}">${STORM_STORY.map((p, i) => `<p><span>${i + 1}</span>${p}</p>`).join('')}</article>
        ${extra}
        <details class="glossary"><summary>Open the glossary</summary><dl><dt>regulator</dt><dd>a device that controls a system</dd><dt>reroute</dt><dd>send something along a different path</dd><dt>subtle</dt><dd>not loud or obvious</dd></dl></details>
        <fieldset class="story-question"><legend>What job did the Storm Core perform?</legend>
          <button data-rapid-check="weapon">It attacked anything near the city.</button>
          <button data-rapid-check="regulator">It controlled the storm and helped maintain the shield.</button>
          <button data-rapid-check="clock">It froze the city's clocks for fun.</button>
        </fieldset>
        <p class="practice-status" id="sliceStatus">${session.support.readAloud ? 'Read-aloud support used. Your interpretation can still be strong; decoding evidence is simply kept separate.' : 'The passage can be read independently or with support.'}</p>
        ${done ? completePanel(1, 'You identified the core as part of a connected system.', 'Rebuild the chain') : ''}`;
    }
    case 2: {
      const selected = a.sequence || [];
      const done = a.sequencePassed;
      const cards = [
        ['flicker', 'The core dims, so the city shield flickers.'],
        ['reach', 'Vex reaches to pull the core free.'],
        ['notice', "Tommy studies the screen, shield, and cloud child's warning."],
        ['reroute', 'They reroute the storm and preserve the shield.']
      ];
      return `${stageHeading('Part 3 · Practice', 'Story Arena', 'Reconstruct the causal chain. Tap cards in order; tap a chosen card to return it.', '🔗')}
        <div class="sequence-answer" id="sequenceAnswer">${selected.length ? selected.map((id, i) => { const card = cards.find(c => c[0] === id); return `<button data-sequence-remove="${id}"><span>${i + 1}</span>${card[1]}</button>`; }).join('') : '<p>Build the chain here…</p>'}</div>
        <div class="sequence-bank">${cards.filter(card => !selected.includes(card[0])).sort((x, y) => x[0].localeCompare(y[0])).map(card => `<button data-sequence-add="${card[0]}">${card[1]}</button>`).join('')}</div>
        <div class="stage-actions"><button data-sequence-reset>Reset</button><button class="primary-action" data-check-sequence>Test the chain</button></div>
        <p class="practice-status" id="sliceStatus">A sequence says what came next. A causal chain also explains why the next event happened.</p>
        ${done ? completePanel(2, 'Your chain preserves cause, action, response, and consequence.', 'Charge the evidence core') : ''}`;
    }
    case 3: {
      const chosen = a.evidence || [];
      const done = a.evidencePassed;
      const evidence = [
        ['screen', 'The maintenance screen calls the core a regulator.', true],
        ['shield', 'The outer shield flickers whenever the core dims.', true],
        ['door', 'The door hits Vex on the way out.', false],
        ['clock', 'The clocks say 4:07.', false],
        ['sandwich', 'The creature steals a festival sandwich.', false]
      ];
      return `${stageHeading('Part 4 · Apply', 'Evidence Core', 'The claim is: <strong>Tommy was right to stop Vex from pulling out the core.</strong> Choose the two details that most directly prove it.', '◆')}
        <div class="evidence-meter"><span style="--charge:${Math.min(chosen.length, 2) * 50}%"></span><b>${Math.min(chosen.length, 2)} / 2 evidence slots</b></div>
        <div class="evidence-list">${evidence.map(([id, text]) => `<button data-evidence="${id}" class="${chosen.includes(id) ? 'selected' : ''}" aria-pressed="${chosen.includes(id)}">${text}</button>`).join('')}</div>
        <button class="primary-action" data-check-evidence>Test this evidence</button>
        <p class="practice-status" id="sliceStatus">A detail can be true, funny, and completely irrelevant to the claim.</p>
        ${done ? completePanel(3, 'Both details explain the danger of removing the core.', 'Enter the Storm Boss') : ''}`;
    }
    default:
      return renderStormBoss(session);
  }
}

function renderStormBoss(session) {
  if (session.bossPassed) return renderStormCelebration(session);
  const a = session.answers;
  const conclusionPassed = a.bossConclusion === 'keep';
  const evidencePassed = a.bossEvidence === 'lanterns';
  const defense = a.bossDefense || '';
  const writingPassed = defense.trim().length >= (session.difficulty === 'normal' ? 25 : 45);
  return `${stageHeading('Part 5 · Boss', 'The Blackout Beacon', 'A new situation tests whether your reasoning transfers. Read, decide, select evidence, and defend the decision.', '🌩')}
    <article class="transfer-passage"><p>A rescue beacon is making a painful screech. Ryn wants to smash its battery. Mara notices that every emergency lantern goes dark whenever the battery disconnects. The beacon is annoying, but lost hikers are still following its light through the fog. Mara can reroute the speaker without removing the battery.</p>${session.difficulty === 'master' ? '<p><b>Conflicting witness:</b> Ryn says, “The battery must be bad because the screech stops when I unplug it.” Decide what that observation proves—and what it does not.</p>' : ''}</article>
    <div class="boss-grid storm-boss-grid">
      <fieldset class="boss-card"><legend>Best decision</legend><button data-boss-conclusion="remove">Remove the battery immediately.</button><button data-boss-conclusion="keep">Keep the battery and reroute the speaker.</button></fieldset>
      <fieldset class="boss-card"><legend>Strongest evidence</legend><button data-boss-evidence="screech">The screech is painful.</button><button data-boss-evidence="lanterns">The lanterns go dark when the battery disconnects.</button><button data-boss-evidence="fog">The hikers are walking in fog.</button></fieldset>
    </div>
    <label class="thinking-note boss-defense">Defend the decision in ${session.difficulty === 'normal' ? 'one or two' : 'two or more'} sentences.<textarea id="bossDefense" placeholder="Mara should... because...">${esc(defense)}</textarea></label>
    <button class="primary-action" data-check-storm-boss>Test my defense</button>
    <p class="practice-status" id="sliceStatus">${conclusionPassed && evidencePassed && writingPassed ? 'Your defense is ready to submit.' : 'The conclusion, relevant evidence, and explanation must work together.'}</p>`;
}

function renderStormCelebration(session) {
  return `<div class="victory-panel storm-victory"><span>★</span><div><p>Trial complete</p><h3>The city stayed hidden. The sandwich did not.</h3><p>Your conclusion, evidence, and explanation were saved as separate inspectable evidence.</p><b>${DIFFICULTY_POINTS[session.difficulty]} points · ${session.difficulty} difficulty</b></div></div>
    <section class="rewrite-studio"><p>Optional story lab</p><h4>Change one fact. What changes next?</h4><p>Rewrite the choice by changing one piece of evidence. Make the new consequence follow logically.</p><textarea id="stormRewrite" placeholder="If the screen had called the core a weapon instead...">${esc(session.answers.rewrite || '')}</textarea><button data-save-rewrite>Save alternate scene</button><p class="practice-status" id="sliceStatus">Saved writing appears with this mission's work.</p></section>`;
}

function shortATextbook() {
  return `<article class="mini-textbook"><header><span>Field Guide 01</span><h3>The Short-A Workshop</h3><p>Read it yourself or tap examples to hear them.</p></header><section><h4>1. The sound</h4><p>Short <b>a</b> is /ă/, the middle sound in <button data-speak="map">map</button>, <button data-speak="cat">cat</button>, and <button data-speak="jam">jam</button>.</p></section><section><h4>2. One sound, one place</h4><p>Say <em>sat</em> slowly: /s/ /ă/ /t/. Three sounds fit into three sound pods. Then letters record those sounds: <b>s-a-t</b>.</p></section><section><h4>3. Change one part</h4><p><b>sat → mat → map</b>. The middle stays /ă/. One changed sound creates a different word.</p></section><section><h4>Grown-up prompt</h4><p>Ask, “What sound do you hear?” before naming a letter. If Robby is stuck, stretch the word without supplying the answer.</p></section></article>`;
}

function stormTextbook() {
  return `<article class="mini-textbook"><header><span>Mission Dossier 01</span><h3>Cause, inference, and evidence</h3><p>A compact field manual for story detectives.</p></header><section><h4>Cause is stronger than order</h4><p>“This happened, then that happened” is sequence. Cause explains how the first event produced or influenced the second.</p></section><section><h4>Inference joins clue and knowledge</h4><p>The story may not announce every answer. A strong inference combines a text clue with a reasonable idea you already understand.</p></section><section><h4>Relevant evidence does work</h4><p>A true detail is not automatically useful. Evidence is relevant when it helps prove the exact claim under discussion.</p></section><section><h4>Reader check</h4><p>Ask: What changed? Why? What did the character notice? Which sentence best proves my answer?</p></section></article>`;
}

function bindGuidedSlice() {
  const session = getSliceSession();
  const root = $('#lessonContent');
  root.querySelector('[data-guided-close]')?.addEventListener('click', closeGuidedSlice);
  root.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
    stopSpeech();
    updateSliceSession({ stage: Number(button.dataset.stage) });
    renderGuidedSlice();
  }));
  root.querySelectorAll('[data-next-stage]').forEach(button => button.addEventListener('click', () => {
    updateSliceSession({ stage: Number(button.dataset.nextStage) });
    renderGuidedSlice();
  }));
  root.querySelectorAll('[data-difficulty]').forEach(button => button.addEventListener('click', () => {
    updateSliceSession({ difficulty: button.dataset.difficulty });
    showToast(`${button.textContent.trim().split(/\s+/)[0]} difficulty selected`);
    renderGuidedSlice();
  }));
  root.querySelectorAll('[data-speak]').forEach(button => button.addEventListener('click', () => speakText(button.dataset.speak, .78)));
  if (activeSlice.slice === 'short-a') bindShortAStage(session, root);
  else bindStormStage(session, root);
}

function bindShortAStage(session, root) {
  const a = session.answers;
  root.querySelectorAll('[data-sound-sort]').forEach(button => button.addEventListener('click', () => {
    const word = button.dataset.soundSort;
    speakText(word, .78);
    if (button.dataset.correct === 'true') {
      a.soundCorrect ||= [];
      if (!a.soundCorrect.includes(word)) a.soundCorrect.push(word);
      button.classList.add('correct');
      $('#sliceStatus').textContent = SHORT_A_SOUND_WORDS.find(item => item[0] === word)[2];
      if (a.soundCorrect.length === 3) { markStageComplete(0); setTimeout(renderGuidedSlice, 450); }
    } else {
      session.support.hints++;
      button.classList.add('try-again');
      $('#sliceStatus').textContent = SHORT_A_SOUND_WORDS.find(item => item[0] === word)[2] + ' Try another word.';
    }
    saveState();
  }));
  root.querySelector('[data-speak-build]')?.addEventListener('click', button => {
    session.support.wordAudio = true;
    speakText(button.currentTarget.dataset.speakBuild, .72);
    saveState();
  });
  root.querySelectorAll('[data-build-letter]').forEach(button => button.addEventListener('click', () => {
    a.builtLetters ||= [];
    if (a.builtLetters.length < 3) a.builtLetters.push(button.dataset.buildLetter);
    saveState(); renderGuidedSlice();
  }));
  root.querySelectorAll('[data-remove-letter]').forEach(button => button.addEventListener('click', () => {
    a.builtLetters ||= []; a.builtLetters.splice(Number(button.dataset.removeLetter), 1); saveState(); renderGuidedSlice();
  }));
  root.querySelector('[data-clear-build]')?.addEventListener('click', () => { a.builtLetters = []; saveState(); renderGuidedSlice(); });
  root.querySelector('[data-check-build]')?.addEventListener('click', button => {
    const made = (a.builtLetters || []).join('');
    if (made === button.currentTarget.dataset.checkBuild) {
      a.buildRound = (a.buildRound || 0) + 1; a.builtLetters = [];
      if (a.buildRound >= SHORT_A_BUILD_WORDS.length) markStageComplete(1); else saveState();
      showToast('Word built! One sound in each pod.'); renderGuidedSlice();
    } else {
      session.support.hints++; saveState(); $('#sliceStatus').textContent = 'Not yet. Say the word slowly and check the middle pod.';
    }
  });
  root.querySelectorAll('[data-transform-choice]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.transformChoice === button.dataset.answer) {
      const item = SHORT_A_TRANSFORMS[a.transformRound || 0];
      button.classList.add('correct'); $('#sliceStatus').textContent = `${item.from} became ${item.result}. The middle /ă/ stayed stable.`;
      a.transformRound = (a.transformRound || 0) + 1;
      if (a.transformRound >= SHORT_A_TRANSFORMS.length) markStageComplete(2); else saveState();
      setTimeout(renderGuidedSlice, 550);
    } else {
      session.support.hints++; saveState(); button.classList.add('wrong'); $('#sliceStatus').textContent = 'That would make a different word. Compare the target one sound at a time.';
    }
  }));
  root.querySelector('[data-read-story]')?.addEventListener('click', button => {
    session.support.readAloud = true; saveState(); speakText(button.currentTarget.dataset.readStory, .82);
  });
  root.querySelectorAll('[data-word-audio]').forEach(button => button.addEventListener('click', () => {
    session.support.wordAudio = true; saveState(); speakText(button.dataset.wordAudio, .72);
  }));
  root.querySelectorAll('[data-delivery-answer]').forEach(button => button.addEventListener('click', () => {
    a.deliveryAnswer = button.dataset.deliveryAnswer;
    if (a.deliveryAnswer === 'cat') { markStageComplete(3); showToast('You tracked the ending.'); renderGuidedSlice(); }
    else { session.support.hints++; saveState(); $('#sliceStatus').textContent = 'Look at the final sentence. Who had the ham then?'; }
  }));
  root.querySelector('[data-boss-speak]')?.addEventListener('click', button => speakText(button.currentTarget.dataset.bossSpeak, .68));
  root.querySelectorAll('[data-boss-letter]').forEach(button => button.addEventListener('click', () => {
    a.bossLetters ||= []; if (a.bossLetters.length < 3) a.bossLetters.push(button.dataset.bossLetter); saveState(); renderGuidedSlice();
  }));
  root.querySelectorAll('[data-boss-remove]').forEach(button => button.addEventListener('click', () => {
    a.bossLetters ||= []; a.bossLetters.splice(Number(button.dataset.bossRemove), 1); saveState(); renderGuidedSlice();
  }));
  root.querySelector('[data-check-boss-spell]')?.addEventListener('click', button => {
    if ((a.bossLetters || []).join('') === button.currentTarget.dataset.checkBossSpell) {
      a.bossSpellRound = (a.bossSpellRound || 0) + 1; a.bossLetters = []; saveState(); showToast('Spelling secured.'); renderGuidedSlice();
    } else { $('#sliceStatus').textContent = 'Check one sound at a time. The middle sound is /ă/.'; }
  });
  root.querySelectorAll('[data-boss-sentence]').forEach(button => button.addEventListener('click', () => {
    a.bossSentence = button.dataset.bossSentence; saveState(); renderGuidedSlice();
  }));
  root.querySelector('[data-finish-slice]')?.addEventListener('click', finishGuidedSlice);
  bindDrawing(root, session);
}

function bindStormStage(session, root) {
  const a = session.answers;
  root.querySelectorAll('[data-storm-prediction]').forEach(button => button.addEventListener('click', () => {
    a.prediction = button.dataset.stormPrediction;
    a.predictionWhy = $('#predictionWhy')?.value || '';
    if (a.prediction === 'shield') { markStageComplete(0); showToast('Prediction linked to a clue.'); renderGuidedSlice(); }
    else { session.support.hints++; saveState(); $('#sliceStatus').textContent = 'That is possible in a silly universe, but which prediction follows the flicker clue?'; }
  }));
  root.querySelector('[data-read-storm]')?.addEventListener('click', () => {
    session.support.readAloud = true; saveState(); speakText(STORM_STORY.join(' '), .94);
  });
  root.querySelector('[data-stop-speech]')?.addEventListener('click', stopSpeech);
  root.querySelectorAll('[data-rapid-check]').forEach(button => button.addEventListener('click', () => {
    a.rapidReadCheck = button.dataset.rapidCheck;
    if (a.rapidReadCheck === 'regulator') { markStageComplete(1); showToast('System relationship found.'); renderGuidedSlice(); }
    else { session.support.hints++; saveState(); $('#sliceStatus').textContent = 'Look at paragraphs 2–4. Which answer explains both storm and shield?'; }
  }));
  root.querySelectorAll('[data-sequence-add]').forEach(button => button.addEventListener('click', () => {
    a.sequence ||= []; a.sequence.push(button.dataset.sequenceAdd); saveState(); renderGuidedSlice();
  }));
  root.querySelectorAll('[data-sequence-remove]').forEach(button => button.addEventListener('click', () => {
    a.sequence = (a.sequence || []).filter(id => id !== button.dataset.sequenceRemove); saveState(); renderGuidedSlice();
  }));
  root.querySelector('[data-sequence-reset]')?.addEventListener('click', () => { a.sequence = []; a.sequencePassed = false; saveState(); renderGuidedSlice(); });
  root.querySelector('[data-check-sequence]')?.addEventListener('click', () => {
    a.sequencePassed = JSON.stringify(a.sequence || []) === JSON.stringify(['flicker', 'reach', 'notice', 'reroute']);
    if (a.sequencePassed) { markStageComplete(2); showToast('Causal chain restored.'); renderGuidedSlice(); }
    else { session.support.hints++; saveState(); $('#sliceStatus').textContent = 'Not yet. Begin with the clue that reveals danger, then track choices and consequence.'; }
  });
  root.querySelectorAll('[data-evidence]').forEach(button => button.addEventListener('click', () => {
    a.evidence ||= []; const id = button.dataset.evidence;
    if (a.evidence.includes(id)) a.evidence = a.evidence.filter(item => item !== id);
    else if (a.evidence.length < 2) a.evidence.push(id);
    saveState(); renderGuidedSlice();
  }));
  root.querySelector('[data-check-evidence]')?.addEventListener('click', () => {
    a.evidencePassed = (a.evidence || []).length === 2 && ['screen', 'shield'].every(id => a.evidence.includes(id));
    if (a.evidencePassed) { markStageComplete(3); showToast('Evidence core charged.'); renderGuidedSlice(); }
    else { session.support.hints++; saveState(); $('#sliceStatus').textContent = 'One chosen detail may be true but irrelevant. Which two explain the danger of removing the core?'; }
  });
  root.querySelectorAll('[data-boss-conclusion]').forEach(button => button.addEventListener('click', () => { a.bossConclusion = button.dataset.bossConclusion; saveState(); renderGuidedSlice(); }));
  root.querySelectorAll('[data-boss-evidence]').forEach(button => button.addEventListener('click', () => { a.bossEvidence = button.dataset.bossEvidence; saveState(); renderGuidedSlice(); }));
  root.querySelector('#bossDefense')?.addEventListener('input', event => { a.bossDefense = event.target.value; saveState(); });
  root.querySelector('[data-check-storm-boss]')?.addEventListener('click', () => {
    a.bossDefense = $('#bossDefense').value;
    const enough = a.bossDefense.trim().length >= (session.difficulty === 'normal' ? 25 : 45);
    if (a.bossConclusion === 'keep' && a.bossEvidence === 'lanterns' && enough) finishGuidedSlice();
    else { session.support.hints++; saveState(); $('#sliceStatus').textContent = 'Strengthen the chain: decision + directly relevant evidence + why it matters.'; }
  });
  root.querySelector('[data-save-rewrite]')?.addEventListener('click', () => {
    session.answers.rewrite = $('#stormRewrite').value.trim(); saveState(); showToast('Alternate scene saved.');
  });
}

function finishGuidedSlice() {
  const session = getSliceSession();
  if (session.bossPassed) return;
  state.pointsLedger ||= [];
  session.bossPassed = true;
  if (!session.completedStages.includes(4)) session.completedStages.push(4);
  session.completedAt = new Date().toISOString();
  const points = DIFFICULTY_POINTS[session.difficulty];
  const existing = state.progress.find(item => item.learner === state.current && item.lessonId === activeSlice.id);
  const shortAEvidence = [
    'Sorted spoken words by the middle /ă/ sound.',
    'Built four short-a CVC words from phonemes and letters.',
    'Transformed words while holding the middle vowel stable.',
    'Read a controlled passage and answered for meaning.',
    'Spelled map and sat and read a new cumulative sentence.'
  ];
  const stormEvidence = [
    'Predicted a consequence from a causal clue.',
    'Identified the Storm Core as part of a connected system.',
    'Reconstructed cause, action, response, and consequence.',
    'Selected two details directly relevant to a claim.',
    'Defended a transfer conclusion with relevant evidence.'
  ];
  const completedEvidence = (activeSlice.slice === 'short-a' ? shortAEvidence : stormEvidence)
    .filter((item, index) => session.completedStages.includes(index))
    .join(' ');
  const snapshot = {
    capturedAt: session.completedAt,
    title: activeSlice.title,
    subject: activeSlice.subject,
    skill: activeSlice.skill,
    kind: 'guided-slice',
    difficulty: session.difficulty,
    supportsUsed: { ...session.support },
    completedStages: [...session.completedStages],
    evidence: completedEvidence,
    response: session.answers.bossDefense || ''
  };
  const record = existing || { id: crypto.randomUUID(), learner: state.current, subject: activeSlice.subject, lessonId: activeSlice.id, title: activeSlice.title, skill: activeSlice.skill, kind: 'mission' };
  Object.assign(record, { date: session.completedAt, difficulty: session.difficulty, points, snapshot });
  if (!existing) state.progress.unshift(record);
  state.pointsLedger.push({ id: crypto.randomUUID(), learner: state.current, lessonId: activeSlice.id, date: session.completedAt, points, reason: `${session.difficulty} boss completion` });
  saveState();
  updateHeader();
  showToast(`Boss defeated · ${points} points saved`);
  renderGuidedSlice();
}

function bindDrawing(root, session) {
  const canvas = root.querySelector('#sliceDrawing');
  if (!canvas) return;
  const drawing = session.drawing ||= { strokes: [], label: '', color: '#ff706a' };
  const context = canvas.getContext('2d');
  function redraw() {
    context.fillStyle = '#fffdf3'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = 'round'; context.lineJoin = 'round'; context.lineWidth = 8;
    for (const stroke of drawing.strokes || []) {
      if (stroke.points.length < 2) continue;
      context.strokeStyle = stroke.color; context.beginPath();
      stroke.points.forEach((point, index) => index ? context.lineTo(point.x * canvas.width, point.y * canvas.height) : context.moveTo(point.x * canvas.width, point.y * canvas.height));
      context.stroke();
    }
  }
  redraw();
  let stroke = null;
  const point = event => { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }; };
  canvas.addEventListener('pointerdown', event => { canvas.setPointerCapture(event.pointerId); stroke = { color: drawing.color || '#ff706a', points: [point(event)] }; drawing.strokes.push(stroke); });
  canvas.addEventListener('pointermove', event => { if (!stroke) return; stroke.points.push(point(event)); redraw(); });
  canvas.addEventListener('pointerup', () => { stroke = null; saveState(); $('#sliceStatus').textContent = 'Drawing autosaved.'; });
  root.querySelectorAll('[data-draw-color]').forEach(button => button.addEventListener('click', () => { drawing.color = button.dataset.drawColor; saveState(); root.querySelectorAll('[data-draw-color]').forEach(item => item.classList.toggle('selected', item === button)); }));
  root.querySelector('[data-clear-drawing]')?.addEventListener('click', () => { drawing.strokes = []; saveState(); redraw(); });
  root.querySelector('[data-save-drawing]')?.addEventListener('click', () => {
    state.artifacts ||= [];
    drawing.label = $('#drawingLabel').value.trim();
    const artifactId = `${sliceKey()}:drawing`;
    const existing = state.artifacts.find(item => item.id === artifactId);
    const artifact = { id: artifactId, learner: state.current, lessonId: activeSlice.id, type: 'drawing', title: drawing.label || 'Short-a snack creature', date: new Date().toISOString(), strokes: drawing.strokes };
    if (existing) Object.assign(existing, artifact); else state.artifacts.push(artifact);
    saveState(); showToast('Drawing saved with the mission.');
  });
}

function closeGuidedSlice() {
  stopSpeech();
  saveState();
  $('#lessonDialog').close();
  $('#lessonDialog').classList.remove('slice-mode');
  openSubject('reading');
}

$('#lessonDialog').addEventListener('close', () => {
  stopSpeech();
  if (activeSlice) saveState();
  activeSlice = null;
  $('#lessonDialog').classList.remove('slice-mode');
});

