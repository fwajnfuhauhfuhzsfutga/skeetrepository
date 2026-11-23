(() => {
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[randInt(0, arr.length - 1)];

  // Форматирование числа с пробелом для тысяч (как в листке: 37 100)
  function formatNum(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0");
  }

  // Подсветка последних 1 или 2 цифр в отформатированном числе
  function renderNum(n, tailLen, isDivisible) {
    const str = String(n);
    const tail = str.slice(-tailLen);
    const headRaw = str.slice(0, str.length - tailLen);

    // Аккуратно форматируем пробелами целое число, затем оборачиваем хвост
    const formatted = formatNum(n);
    // В отформатированной строке последние tailLen цифр (без учёта пробела внутри последних 3 цифр)
    // Так как tailLen <= 2, последние tailLen символов в formatted всегда цифры!
    const prefix = formatted.slice(0, formatted.length - tailLen);
    const suffix = formatted.slice(-tailLen);
    const cls = isDivisible ? "num-yes" : "num-no";
    return `<span class="num ${cls}">${prefix}<span class="tail">${suffix}</span></span>`;
  }

  // Генераторы примеров, строго соблюдающие правила и формат листка
  function generateRule2() {
    const evenDigits = [0, 2, 4, 6, 8];
    const oddDigits = [1, 3, 5, 7, 9];

    const lastYes = pick(evenDigits);
    const yesNum = randInt(10, 99) * 10 + lastYes;

    const lastNo = pick(oddDigits);
    const noNum = randInt(10, 99) * 10 + lastNo;

    return `Например: ${renderNum(yesNum, 1, true)} делится на 2 (оканчивается на ${lastYes}), а ${renderNum(noNum, 1, false)} — нет.`;
  }

  function generateRule5() {
    const yesZero = randInt(100, 999) * 10;
    const yesFive = randInt(100, 999) * 10 + 5;
    const badLast = pick([1, 2, 3, 4, 6, 7, 8, 9]);
    const noNum = randInt(100, 999) * 10 + badLast;

    return `Например: ${renderNum(yesZero, 1, true)} и ${renderNum(yesFive, 1, true)} делятся на 5, а ${renderNum(noNum, 1, false)} — нет.`;
  }

  function generateRule10() {
    const yesNum = randInt(100, 999) * 10;
    const badLast = randInt(1, 9);
    const noNum = randInt(100, 999) * 10 + badLast;

    return `Например: ${renderNum(yesNum, 1, true)} делится на 10, а ${renderNum(noNum, 1, false)} — нет.`;
  }

  function generateRule4() {
    // 1) Две последние цифры — нули (5-значное число, как 37 100)
    const zeroEndNum = randInt(100, 999) * 100;

    // 2) Две последние цифры не нули, но образуют число, которое делится на 4 (например 04..96)
    const mult4 = randInt(1, 24) * 4; // 4..96
    const mult4Num = randInt(100, 999) * 100 + mult4;
    const mult4Str = String(mult4).padStart(2, "0");

    // 3) Две последние цифры не делятся на 4
    let nonMult4 = randInt(1, 99);
    while (nonMult4 % 4 === 0) {
      nonMult4 = randInt(1, 99);
    }
    const nonMult4Num = randInt(100, 999) * 100 + nonMult4;
    const nonMult4Str = String(nonMult4).padStart(2, "0");

    return `Например: ${renderNum(zeroEndNum, 2, true)} (в конце два нуля) и ${renderNum(mult4Num, 2, true)} (${mult4} : 4 = ${mult4 / 4}) делятся на 4, а ${renderNum(nonMult4Num, 2, false)} (${nonMult4Str} не делится на 4) — нет.`;
  }

  const generators = {
    2: generateRule2,
    5: generateRule5,
    10: generateRule10,
    4: generateRule4,
  };

  function triggerAnim(el) {
    if (!el) return;
    el.classList.remove("is-animating");
    void el.offsetWidth;
    el.classList.add("is-animating");
  }

  function refreshRule(ruleKey) {
    const el = document.getElementById(`example-${ruleKey}`);
    if (el && generators[ruleKey]) {
      el.innerHTML = generators[ruleKey]();
      triggerAnim(el);
    }
  }

  function refreshAllRules() {
    Object.keys(generators).forEach(refreshRule);
  }

  // Переключение вкладок
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      panels.forEach((p) => {
        const active = p.id === `tab-${target}`;
        p.classList.toggle("is-active", active);
        p.hidden = !active;
      });
    });
  });

  document.getElementById("randomize-all-btn").addEventListener("click", refreshAllRules);
  document.querySelectorAll("[data-refresh]").forEach((btn) => {
    btn.addEventListener("click", () => refreshRule(btn.dataset.refresh));
  });

  // Объяснение делимости для произвольного натурального числа
  function explainDivisibility(numStr, divisor) {
    const clean = numStr.replace(/\D/g, "");
    if (!clean) return null;

    const last1 = Number(clean.slice(-1));
    const last2Str = clean.slice(-2).padStart(2, "0");
    const last2 = Number(last2Str);

    if (divisor === 2) {
      const ok = last1 % 2 === 0;
      return {
        ok,
        text: ok
          ? `Оканчивается на чётную цифру ${last1} — делится на 2.`
          : `Оканчивается на нечётную цифру ${last1} — не делится на 2.`,
      };
    }

    if (divisor === 5) {
      const ok = last1 === 0 || last1 === 5;
      return {
        ok,
        text: ok
          ? `Оканчивается на цифру ${last1} — делится на 5.`
          : `Оканчивается на цифру ${last1} (нужно 0 или 5) — не делится на 5.`,
      };
    }

    if (divisor === 10) {
      const ok = last1 === 0;
      return {
        ok,
        text: ok
          ? `Оканчивается на 0 — делится на 10.`
          : `Оканчивается на ${last1} (нужен 0) — не делится на 10.`,
      };
    }

    if (divisor === 4) {
      const ok = last2 % 4 === 0;
      if (clean.length === 1) {
        return {
          ok,
          text: ok
            ? `${last2} : 4 = ${last2 / 4} — делится на 4.`
            : `${last2} не делится на 4.`,
        };
      }
      if (last2 === 0) {
        return {
          ok: true,
          text: `Две последние цифры — нули (00) — делится на 4.`,
        };
      }
      return {
        ok,
        text: ok
          ? `Последние две цифры образуют ${last2} (${last2} : 4 = ${last2 / 4}) — делится на 4.`
          : `Последние две цифры образуют ${last2Str}, а ${last2} не делится на 4.`,
      };
    }

    return null;
  }

  // Тренажёр
  const DIVISORS = [2, 4, 5, 10];
  let selectedFilter = "all";
  let currentQuestion = null;
  let scoreCorrect = 0;
  let scoreTotal = 0;
  let scoreStreak = 0;

  const quizDivisorLabel = document.getElementById("quiz-divisor-label");
  const quizNumberEl = document.getElementById("quiz-number");
  const quizFeedbackEl = document.getElementById("quiz-feedback");
  const quizNextBtn = document.getElementById("quiz-next");
  const ansYesBtn = document.getElementById("ans-yes");
  const ansNoBtn = document.getElementById("ans-no");

  function generateQuizNumber(divisor) {
    // 50% шанс сгенерировать делящееся число, 50% — не делящееся
    const wantDivisible = Math.random() < 0.5;
    const base = randInt(10, 999);

    if (divisor === 2) {
      const d = wantDivisible ? pick([0, 2, 4, 6, 8]) : pick([1, 3, 5, 7, 9]);
      return base * 10 + d;
    }
    if (divisor === 5) {
      const d = wantDivisible ? pick([0, 5]) : pick([1, 2, 3, 4, 6, 7, 8, 9]);
      return base * 10 + d;
    }
    if (divisor === 10) {
      const d = wantDivisible ? 0 : randInt(1, 9);
      return base * 10 + d;
    }
    // divisor === 4
    if (wantDivisible) {
      const tail = randInt(0, 24) * 4;
      return randInt(10, 999) * 100 + tail;
    }
    let tail = randInt(1, 99);
    while (tail % 4 === 0) tail = randInt(1, 99);
    return randInt(10, 999) * 100 + tail;
  }

  function nextQuestion() {
    const divisor = selectedFilter === "all" ? pick(DIVISORS) : Number(selectedFilter);
    const number = generateQuizNumber(divisor);
    currentQuestion = { divisor, number };

    quizDivisorLabel.textContent = `на ${divisor}`;
    quizNumberEl.textContent = formatNum(number);
    triggerAnim(quizNumberEl);
    quizFeedbackEl.hidden = true;
    quizNextBtn.hidden = true;
    ansYesBtn.disabled = false;
    ansNoBtn.disabled = false;
  }

  function answerQuestion(userSaysYes) {
    if (!currentQuestion) return;
    const info = explainDivisibility(String(currentQuestion.number), currentQuestion.divisor);
    const isRight = userSaysYes === info.ok;

    scoreTotal += 1;
    if (isRight) {
      scoreCorrect += 1;
      scoreStreak += 1;
    } else {
      scoreStreak = 0;
    }

    document.getElementById("score-correct").textContent = String(scoreCorrect);
    document.getElementById("score-total").textContent = String(scoreTotal);
    document.getElementById("score-streak").textContent = String(scoreStreak);

    quizFeedbackEl.className = `quiz-feedback ${isRight ? "is-ok" : "is-err"}`;
    quizFeedbackEl.textContent = `${isRight ? "Верно!" : "Неверно."} ${info.text}`;
    quizFeedbackEl.hidden = false;
    quizNextBtn.hidden = false;
    ansYesBtn.disabled = true;
    ansNoBtn.disabled = true;
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedFilter = chip.dataset.divisor;
      document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
      nextQuestion();
    });
  });

  ansYesBtn.addEventListener("click", () => answerQuestion(true));
  ansNoBtn.addEventListener("click", () => answerQuestion(false));
  quizNextBtn.addEventListener("click", nextQuestion);

  // Проверка своего числа
  const customInput = document.getElementById("custom-number-input");
  const checkerResults = document.getElementById("checker-results");

  function updateChecker() {
    const raw = customInput.value.replace(/\D/g, "");
    if (customInput.value !== raw) {
      customInput.value = raw;
    }
    if (!raw) {
      checkerResults.innerHTML = `<p class="checker-empty">Введи число, и здесь появится разбор по всем четырём правилам.</p>`;
      return;
    }

    checkerResults.innerHTML = [2, 4, 5, 10]
      .map((d) => {
        const res = explainDivisibility(raw, d);
        return `
          <div class="check-card ${res.ok ? "is-yes" : "is-no"}">
            <div class="check-card-title">На ${d}: ${res.ok ? "делится" : "не делится"}</div>
            <div class="check-card-desc">${res.text}</div>
          </div>
        `;
      })
      .join("");
  }

  customInput.addEventListener("input", updateChecker);
  document.getElementById("checker-random-btn").addEventListener("click", () => {
    customInput.value = String(randInt(100, 99999));
    updateChecker();
  });

  // Инициализация
  refreshAllRules();
  nextQuestion();
  updateChecker();
})();
