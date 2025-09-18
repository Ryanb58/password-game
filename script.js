// Password Game logic

const levels = [
  {
    label: "Enter password:",
    validator: (v) => v === 'password',
    answer: 'password',
    hint: 'Yes, the literal word password.'
  },
  {
    label: "Password is incorrect",
    validator: (v) => v === 'incorrect',
    answer: 'incorrect',
    hint: 'What word appears (and is emphasized) in the label?'
  },
  {
    label: "Try again.",
    validator: (v) => v === 'again',
    answer: 'again',
    hint: 'Ignore punctuation. One word stands out.'
  },
  {
    label: "Please try again later.",
    validator: (v) => v === 'again later',
    answer: 'again later',
    hint: 'Take the last two meaningful words.'
  },
  {
    label: "The password equals the number of words in this sentence.",
    // Accept either the numerical count OR the literal phrase for flexibility.
    validator: (v) => {
      const t = v.trim().toLowerCase();
      return t === '10' || t === 'the number of words in this sentence';
    },
    preprocessInput: (input) => input.trim(),
    answer: '10 OR "the number of words in this sentence"',
    hint: 'Either give the count (10) or literally type the phrase after "equals".'
  },
  {
    label: "Type the previous level's answer twice, no space.",
    validator: (v, ctx) => {
      const candidate = v.trim();
      const expected = ctx.prevAnswer.repeat(2);
      if (candidate === expected) return true;
      // Alternate interpretation: literally type the label phrase (sans punctuation)
      const literal = 'the previous level\'s answer twice no space'.toLowerCase().replace(/[,.'"]/g,'');
      const norm = candidate.toLowerCase().replace(/[,.'"]/g,'');
      if (norm === literal) return true;
      // Another lenient option: prevAnswer + 'x2'
      if (candidate.toLowerCase() === (ctx.prevAnswer + 'x2').toLowerCase()) return true;
      return false;
    },
    setup: (ctx) => ({ prevAnswer: ctx.lastAnswer }),
    answer: (ctx) => ctx.prevAnswer.repeat(2) + ' OR phrase or prevAnswerx2',
    hint: 'Either double it exactly, write the instruction literally, or try prevAnswer + x2.'
  },
  {
    label: "Enter the first 4 letters of the alphabet backwards.",
    validator: (v) => {
      const raw = v.trim();
      const noSpace = raw.replace(/\s+/g,'').toLowerCase();
      if (noSpace === 'dcba') return true; // canonical
      // Accept spaced or capitalized variants already handled by normalization.
      // Alternate playful interpretation: user literally types the phrase
      if (raw.toLowerCase() === 'the first 4 letters of the alphabet backwards') return true;
      return false;
    },
    answer: 'dcba (case/spacing flexible) OR the sentence itself',
    hint: 'Reverse A B C D -> D C B A. Or be literal with the instruction.'
  },
  {
    label: "Enter the sum of 12 and 35, then the word sum (no space).",
    validator: (v) => {
      const t = v.trim();
      if (t.toLowerCase() === '47sum') return true;
      // Accept uppercase SUM
      if (t === '47SUM') return true;
      // Accept 'sum47' as flipped interpretation
      if (t.toLowerCase() === 'sum47') return true;
      // Accept writing the math: 12+35=sum (sans spaces)
      if (t.replace(/\s+/g,'') === '12+35=sum') return true;
      return false;
    },
    answer: '47sum (also accepts 47SUM, sum47, 12+35=sum)',
    hint: 'Add them: 12 + 35. Then maybe append/precede the word sum.'
  },
  {
    label: "Type the current level number in binary.",
    validator: (v, ctx) => {
      const base = ctx.level.toString(2); // '1001' for level 9
      const t = v.trim().toLowerCase();
      if (t === base) return true;
      if (t === '0b' + base) return true; // prefixed form
      if (t === 'bin' + base) return true;
      if (t === ctx.levelNumber.toString()) return true; // lenient: decimal
      if (t === 'binary ' + ctx.levelNumber) return true; // phrase form
      return false;
    },
    setup: (ctx) => ({ level: ctx.levelNumber }),
    answer: (ctx) => ctx.level.toString(2) + ' (also accepts 0b'+ctx.level.toString(2)+', bin'+ctx.level.toString(2)+', decimal '+ctx.level+')',
    hint: 'Level 9 -> 1001 in binary. Prefixed or decimal also allowed.'
  },
  {
    label: "Final: I speak without a mouth and hear without ears. What am I?",
    validator: (v) => {
      const t = v.trim().toLowerCase();
      return t === 'echo' || t === 'an echo';
    },
    answer: 'echo',
    hint: 'It returns what you send to it—classic riddle.'
  }
];

let currentLevelIndex = 0;
const promptEl = document.getElementById('prompt');
const inputEl = document.getElementById('answerInput');
const feedbackEl = document.getElementById('feedback');
const submitBtn = document.getElementById('submitBtn');
const restartBtn = document.getElementById('skipBtn');
const levelNumberEl = document.getElementById('levelNumber');
const progressEl = document.getElementById('progress');
const hintArea = document.getElementById('hintArea');

const gameContext = {
  lastAnswer: null,
  history: []
};

function renderLevel() {
  const lvl = levels[currentLevelIndex];
  levelNumberEl.textContent = currentLevelIndex + 1;
  progressEl.value = currentLevelIndex + 1;
  const dynamic = lvl.dynamicLabel ? lvl.dynamicLabel(gameContext) : lvl.label;
  promptEl.textContent = dynamic;
  inputEl.value = '';
  inputEl.focus();
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  hintArea.textContent = '';
  promptEl.classList.add('fade-in');
  setTimeout(()=> promptEl.classList.remove('fade-in'), 400);

  // Setup additional context for this level if needed
  if (lvl.setup) {
    const extra = lvl.setup({ ...gameContext, levelNumber: currentLevelIndex + 1 });
    Object.assign(gameContext, extra);
  }
}

function getExpectedAnswer(lvl) {
  if (typeof lvl.answer === 'function') {
    return lvl.answer(gameContext);
  }
  return lvl.answer;
}

function submit() {
  const lvl = levels[currentLevelIndex];
  let value = inputEl.value;
  if (lvl.preprocessInput) value = lvl.preprocessInput(value);
  const valid = lvl.validator(value, { ...gameContext, levelNumber: currentLevelIndex + 1 });
  if (valid) {
    const answer = value;
    feedbackEl.textContent = '✔ Correct!';
    feedbackEl.className = 'feedback success';
    gameContext.lastAnswer = answer;
    gameContext.history.push(answer);

    currentLevelIndex++;
    if (currentLevelIndex >= levels.length) {
      promptEl.textContent = 'You win! 🎉';
      inputEl.disabled = true;
      submitBtn.disabled = true;
      return;
    }
    setTimeout(renderLevel, 550);
  } else {
    feedbackEl.textContent = '✖ Incorrect';
    feedbackEl.className = 'feedback error';
    // Auto-hint logic after 3 failed attempts per level
    lvl._fails = (lvl._fails || 0) + 1;
    if (lvl._fails >= 3 && lvl.hint) {
      hintArea.textContent = 'Hint: ' + lvl.hint;
    }
  }
}

submitBtn.addEventListener('click', submit);
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
restartBtn.addEventListener('click', () => {
  currentLevelIndex = 0;
  Object.assign(gameContext, { lastAnswer: null, history: [] });
  levels.forEach(l => delete l._fails);
  inputEl.disabled = false;
  submitBtn.disabled = false;
  renderLevel();
});

renderLevel();
