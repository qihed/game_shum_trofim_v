/* global window, document, navigator */

(function () {
  const data = window.GAME_DATA;
  if (!data) {
    throw new Error("GAME_DATA not found. Ensure gameData.js is loaded before app.js");
  }

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    card: $("#card"),
    stats: $("#stats"),
    btnBack: $("#btnBack"),
    btnRestart: $("#btnRestart"),
    btnCopyRun: $("#btnCopyRun"),
    hostScript: $("#hostScript"),
    aboutContent: $("#aboutContent"),
    viewPlay: $("#viewPlay"),
    viewHost: $("#viewHost"),
    viewAbout: $("#viewAbout"),
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const round = (n) => Math.round(n);

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function getStageById(id) {
    const s = data.stages.find((x) => x.id === id);
    if (!s) throw new Error(`Stage not found: ${id}`);
    return s;
  }

  const state = {
    stageId: "intro",
    stats: deepClone(data.startStats),
    flags: {},
    history: [],
    pendingResult: null,
    ended: null,
    selectedTab: "play",
  };

  function statColor(value) {
    if (value <= 30) return "is-bad";
    if (value >= 70) return "is-good";
    return "";
  }

  function renderStats() {
    const min = data.clamps.min;
    const max = data.clamps.max;
    const html = data.stats
      .map((s) => {
        const v = clamp(round(state.stats[s.key] ?? 0), min, max);
        const pct = ((v - min) / (max - min)) * 100;
        const klass = statColor(v);
        return `
          <div class="stat" title="${escapeHtml(s.help)}">
            <div class="stat__label">${escapeHtml(s.label)}</div>
            <div class="stat__value">${v}</div>
            <div class="bar" aria-hidden="true">
              <div class="bar__fill ${klass}" style="width:${pct}%"></div>
            </div>
          </div>
        `;
      })
      .join("");
    els.stats.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatEffects(effects) {
    const keys = Object.keys(effects || {});
    if (!keys.length) return "";
    const nameByKey = Object.fromEntries(data.stats.map((s) => [s.key, s.label]));
    const parts = keys
      .map((k) => {
        const v = effects[k];
        const sign = v > 0 ? "+" : "";
        return `${nameByKey[k] || k}: ${sign}${v}`;
      })
      .join(" · ");
    return parts;
  }

  function applyEffects(effects) {
    const min = data.clamps.min;
    const max = data.clamps.max;
    Object.entries(effects || {}).forEach(([k, delta]) => {
      const next = (state.stats[k] ?? 0) + delta;
      state.stats[k] = clamp(next, min, max);
    });
  }

  function applyFlags(flags) {
    Object.entries(flags || {}).forEach(([k, v]) => {
      state.flags[k] = v;
    });
  }

  function pushHistory(snapshot) {
    state.history.push(snapshot);
    els.btnBack.disabled = state.history.length === 0;
  }

  function popHistory() {
    const snap = state.history.pop();
    els.btnBack.disabled = state.history.length === 0;
    return snap;
  }

  function toStage(stageId) {
    state.pendingResult = null;
    state.ended = null;
    state.stageId = stageId;
    render();
  }

  function computeScore() {
    const s = state.stats;
    return (
      s.voice * 0.18 +
      s.craft * 0.26 +
      s.team * 0.22 +
      s.reputation * 0.18 +
      s.resilience * 0.16
    );
  }

  function resolveEnding(explicit) {
    if (explicit) return explicit;

    const score = computeScore();
    if (state.stats.resilience <= 25 || state.stats.team <= 22) return "burnout";
    if (score >= 68 && state.stats.craft >= 55 && state.stats.reputation >= 45) return "nextProject";
    return "lesson";
  }

  function selectChoice(choiceIdx) {
    const stage = getStageById(state.stageId);
    const choice = stage.choices[choiceIdx];
    if (!choice) return;

    // Save snapshot for "Back"
    pushHistory(deepClone({ stageId: state.stageId, stats: state.stats, flags: state.flags, ended: state.ended }));

    // Apply outcome
    applyEffects(choice.effects);
    applyFlags(choice.flags);

    // If this choice ends the game explicitly (finale)
    if (choice.ending) {
      const endingKey = resolveEnding(choice.ending);
      state.ended = endingKey;
      state.pendingResult = {
        stageId: stage.id,
        title: stage.title,
        kicker: stage.kicker,
        choiceText: choice.text,
        effectsText: formatEffects(choice.effects),
        consequence: choice.consequence,
        analysis: choice.analysis,
        tag: choice.tag,
        discussion: stage.discussion,
        takeaway: stage.takeaway,
        next: null,
        isEnding: true,
      };
      render();
      return;
    }

    state.pendingResult = {
      stageId: stage.id,
      title: stage.title,
      kicker: stage.kicker,
      choiceText: choice.text,
      effectsText: formatEffects(choice.effects),
      consequence: choice.consequence,
      analysis: choice.analysis,
      tag: choice.tag,
      discussion: stage.discussion,
      takeaway: stage.takeaway,
      next: choice.next,
      isEnding: false,
    };

    render();
  }

  function renderIntro(stage) {
    const hero = data.hero;
    return `
      <div class="kicker">${escapeHtml(stage.kicker)}</div>
      <h1 class="h1">${escapeHtml(data.title)}</h1>
      <p class="lead">${escapeHtml(data.formatBlurb.programPitch)}</p>
      <div class="result">
        <div class="result__row">
          <div class="badge">${escapeHtml(hero.name)}, ${escapeHtml(hero.age)} года</div>
          <div class="badge is-warn">Это не «викторина» — это тренажёр решений</div>
        </div>
        <div class="result__title">Легенда</div>
        <p class="result__text">${escapeHtml(hero.legend).replaceAll("\n", "<br/>")}</p>
        <div class="result__grid">
          <div class="callout">
            <div class="callout__label">Формулировка для игроков</div>
            <div class="callout__body"><strong>${escapeHtml(hero.playerPrompt)}</strong></div>
          </div>
        </div>
      </div>

      <div class="choices">
        ${stage.choices
          .map(
            (c, idx) => `
              <button class="choice" type="button" data-choice="${idx}">
                <div class="choice__title">${escapeHtml(c.text)}</div>
                <div class="choice__note">${escapeHtml(c.note || "")}</div>
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  }

  function renderStage(stage) {
    return `
      <div class="kicker">${escapeHtml(stage.kicker)}</div>
      <h1 class="h1">${escapeHtml(stage.title)}</h1>
      <div class="scene">${escapeHtml(stage.scene).replaceAll("\n", "<br/>")}</div>
      <div class="meta">
        <div class="pill"><strong>Вопрос</strong> → обсуждение после выбора</div>
        <div class="pill"><strong>Разбор</strong> → почему это сработало/не сработало</div>
      </div>
      <div class="choices" aria-label="Выбор">
        ${stage.choices
          .map((c, idx) => {
            const ef = formatEffects(c.effects);
            return `
              <button class="choice" type="button" data-choice="${idx}">
                <div class="choice__title">${escapeHtml(c.text)}</div>
                <div class="choice__note">
                  ${escapeHtml(c.note || "")}
                  ${ef ? `<br/><span class="badge">${escapeHtml(ef)}</span>` : ""}
                </div>
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function outcomeBadgeClass(tagText) {
    const t = (tagText || "").toLowerCase();
    if (t.includes("проф")) return "is-good";
    if (t.includes("ошибка") || t.includes("провал") || t.includes("опас")) return "is-bad";
    if (t.includes("риск") || t.includes("баланс")) return "is-warn";
    return "";
  }

  function renderResultCard(result) {
    const badgeClass = outcomeBadgeClass(result.tag);
    const nextButton =
      result.isEnding
        ? `<button class="btn" type="button" data-action="showEnding">Показать финал</button>`
        : `<button class="btn" type="button" data-action="continue">Дальше</button>`;

    return `
      <div class="kicker">${escapeHtml(result.kicker || "")}</div>
      <h1 class="h1">${escapeHtml(result.title || "")}</h1>
      <div class="result">
        <div class="result__row">
          <div class="badge ${badgeClass}">${escapeHtml(result.tag || "Последствие")}</div>
          ${result.effectsText ? `<div class="badge">${escapeHtml(result.effectsText)}</div>` : `<div></div>`}
        </div>
        <div class="result__title">Вы выбрали</div>
        <p class="result__text"><strong>${escapeHtml(result.choiceText)}</strong></p>

        <div class="result__grid">
          <div class="callout ${badgeClass}">
            <div class="callout__label">Последствия</div>
            <div class="callout__body">${escapeHtml(result.consequence || "")}</div>
          </div>
          <div class="callout">
            <div class="callout__label">Разбор (почему это так)</div>
            <div class="callout__body">${escapeHtml(result.analysis || "")}</div>
          </div>
          <div class="callout is-warn">
            <div class="callout__label">Вопрос для обсуждения</div>
            <div class="callout__body">${escapeHtml(result.discussion || "")}</div>
          </div>
          <div class="callout is-good">
            <div class="callout__label">Профессиональный вывод</div>
            <div class="callout__body">${escapeHtml(result.takeaway || "")}</div>
          </div>
        </div>

        <div class="nextRow">
          ${nextButton}
        </div>
      </div>
    `;
  }

  function renderEnding(endingKey) {
    const ending = data.endings[endingKey];
    if (!ending) return `<div class="scene">Финал не найден.</div>`;

    const score = round(computeScore());
    const badgeClass = endingKey === "burnout" ? "is-bad" : endingKey === "nextProject" ? "is-good" : "is-warn";

    return `
      <div class="kicker">Итог</div>
      <h1 class="h1">${escapeHtml(ending.title)}</h1>
      <p class="lead">${escapeHtml(ending.summary)}</p>

      <div class="result">
        <div class="result__row">
          <div class="badge ${badgeClass}">Итоговый индекс траектории: ${score}/100</div>
          <div class="badge">Голос/Ремесло/Команда/Репутация/Устойчивость</div>
        </div>
        <div class="result__grid">
          <div class="callout is-warn">
            <div class="callout__label">Финальный вывод для участников</div>
            <div class="callout__body">${escapeHtml(data.stages.find((s)=>s.id==="finale").takeaway)}</div>
          </div>
          <div class="callout">
            <div class="callout__label">Для обсуждения</div>
            <div class="callout__body">${escapeHtml(ending.forParticipants)}</div>
          </div>
          <div class="callout is-good">
            <div class="callout__label">Практики «что делать каждую неделю»</div>
            <div class="callout__body">
              <ul>
                ${ending.checklist.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>
        <div class="nextRow">
          <button class="btn" type="button" data-action="restart">Сыграть ещё раз</button>
        </div>
      </div>
    `;
  }

  function renderHost() {
    const hp = data.hostPack;
    const stats = data.stats;

    const statsHtml = stats
      .map(
        (s) => `
          <div class="callout">
            <div class="callout__label">${escapeHtml(s.label)}</div>
            <div class="callout__body">${escapeHtml(s.help)}</div>
          </div>
        `,
      )
      .join("");

    const stageOutline = data.stages
      .filter((s) => s.type !== "intro")
      .map((s) => {
        const options = (s.choices || [])
          .map((c, i) => `<li><strong>Вариант ${i + 1}:</strong> ${escapeHtml(c.text)}</li>`)
          .join("");
        return `
          <div class="callout">
            <div class="callout__label">${escapeHtml(s.kicker)} — ${escapeHtml(s.title)}</div>
            <div class="callout__body">
              <p>${escapeHtml((s.scene || "").split("\n\n")[0] || "")}</p>
              <ul>${options}</ul>
              <p><strong>Вопрос:</strong> ${escapeHtml(s.discussion || "")}</p>
              <p><strong>Вывод:</strong> ${escapeHtml(s.takeaway || "")}</p>
            </div>
          </div>
        `;
      })
      .join("");

    els.hostScript.innerHTML = `
      <h2>Краткое описание для программы</h2>
      <p>${escapeHtml(data.formatBlurb.programPitch)}</p>

      <h2>Цель ведущего</h2>
      <p>${escapeHtml(data.formatBlurb.hostGoal)}</p>

      <h2>Правила для участников</h2>
      <ul>${hp.rules.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

      <h2>Система показателей героя</h2>
      <div class="grid">${statsHtml}</div>

      <h2>Тайминг (пример)</h2>
      <ul>${hp.timing.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

      <h2>Ключевые темы, которые встроены в путь</h2>
      <ul>${hp.keyTopics.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>

      <h2>Структура этапов (шпаргалка)</h2>
      ${stageOutline}
    `;
  }

  function renderAbout() {
    els.aboutContent.innerHTML = `
      <h2>Что это за сайт</h2>
      <p>
        <strong>${escapeHtml(data.title)}</strong> — интерактивная история с выбором, где герой проходит путь
        от начинающего режиссёра к профессиональному мышлению. После каждого решения вы получаете
        последствия и разбор — чтобы видеть, как «талант» превращается в практику.
      </p>

      <h2>Почему это тренажёр, а не «квест»</h2>
      <ul>
        <li><strong>Каждый выбор</strong> меняет показатели: голос, ремесло, команда, репутация, устойчивость.</li>
        <li><strong>После развилки</strong> есть разбор: где смелость стала упрямством, а свобода — хаосом.</li>
        <li><strong>Вопросы для обсуждения</strong> встроены в темп — формат рассчитан на группу и ведущего.</li>
      </ul>

      <h2>Как запустить</h2>
      <ul>
        <li>Открой файл <code>c:\\dev\\game_shum\\index.html</code> в браузере.</li>
        <li>Если браузер ругается на локальные файлы — используй любой простой локальный сервер (например, расширение Live Server).</li>
      </ul>
    `;
  }

  function bindCardEvents() {
    els.card.querySelectorAll("[data-choice]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-choice"));
        const stage = getStageById(state.stageId);
        const choice = stage.choices[idx];
        if (!choice) return;
        if (state.pendingResult) return;
        selectChoice(idx);
      });
    });

    els.card.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        if (action === "continue") {
          const next = state.pendingResult?.next;
          if (next) toStage(next);
        }
        if (action === "restart") restart();
        if (action === "showEnding") {
          const endKey = resolveEnding(state.ended);
          els.card.innerHTML = renderEnding(endKey);
          bindCardEvents();
          renderStats();
        }
      });
    });
  }

  function renderPlay() {
    const stage = getStageById(state.stageId);

    if (state.pendingResult) {
      els.card.innerHTML = renderResultCard(state.pendingResult);
      bindCardEvents();
      renderStats();
      return;
    }

    if (stage.type === "intro") {
      els.card.innerHTML = renderIntro(stage);
      bindCardEvents();
      renderStats();
      return;
    }

    els.card.innerHTML = renderStage(stage);
    bindCardEvents();
    renderStats();
  }

  function setTab(tabKey) {
    state.selectedTab = tabKey;
    $$(".tab").forEach((t) => t.classList.toggle("is-active", t.getAttribute("data-tab") === tabKey));
    [els.viewPlay, els.viewHost, els.viewAbout].forEach((v) => v.classList.remove("is-active"));
    if (tabKey === "play") els.viewPlay.classList.add("is-active");
    if (tabKey === "host") els.viewHost.classList.add("is-active");
    if (tabKey === "about") els.viewAbout.classList.add("is-active");
  }

  function restart() {
    state.stageId = "intro";
    state.stats = deepClone(data.startStats);
    state.flags = {};
    state.history = [];
    state.pendingResult = null;
    state.ended = null;
    els.btnBack.disabled = true;
    render();
  }

  function goBack() {
    if (!state.history.length) return;
    const snap = popHistory();
    if (!snap) return;
    state.stageId = snap.stageId;
    state.stats = snap.stats;
    state.flags = snap.flags;
    state.ended = snap.ended;
    state.pendingResult = null;
    render();
  }

  function copyRunText() {
    const text =
      "Как запустить сайт: откройте файл c:\\dev\\game_shum\\index.html в браузере. Если нужен сервер — используйте Live Server/любой локальный http-сервер.";
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function render() {
    renderPlay();
  }

  // init
  renderHost();
  renderAbout();
  render();

  // tabs
  $$(".tab").forEach((t) => {
    t.addEventListener("click", () => {
      const tabKey = t.getAttribute("data-tab");
      setTab(tabKey);
    });
  });

  // nav buttons
  els.btnRestart.addEventListener("click", restart);
  els.btnBack.addEventListener("click", goBack);
  els.btnCopyRun.addEventListener("click", copyRunText);
})();

