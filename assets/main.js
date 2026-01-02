const DEFAULT_LANG = "en";
const DEFAULT_ROUTE = "about";

const contentEl = document.getElementById("content");
const titleEl = document.getElementById("pageTitle");
const languageBtn = document.getElementById("languageBtn");
const themeBtn = document.getElementById("themeBtn");

const I18N = {
  en: {
    "nav.about": "About",
    "nav.resume": "Résumé",
  },
  de: {
    "nav.about": "Über mich",
    "nav.resume": "Lebenslauf",
  },
};

function getRoute() {
  const hash = window.location.hash.replace("#", "").trim().toLowerCase();
  return hash === "resume" ? "resume" : "about";
}


function setActiveNav(route) {
  document.querySelectorAll("a.navigation").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === route);
  });
}

function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const value = I18N[lang]?.[key];
    if (value) el.textContent = value;
  });
}


function getLang() {
  const stored = localStorage.getItem("lang");
  if (stored === "de" || stored === "en") return stored;

  const browser = (navigator.language || "").toLowerCase();
  return browser.startsWith("de") ? "de" : DEFAULT_LANG;
}

function setLang(lang) {
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  languageBtn.textContent = lang.toUpperCase();
  applyTranslations(lang);
}


function getTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀" : "☾";
}

function pageTitle(route, lang) {
  if (route === "resume") return lang === "de" ? "Lebenslauf" : "Résumé";
  return lang === "de" ? "Über mich" : "About";
}

async function loadMarkdown(route, lang) {
  const file = `./content/${lang}/${route}.md`;
  const res = await fetch(file, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${file} (HTTP ${res.status})`);
  const md = await res.text();
  return window.marked.parse(md);
}

async function render() {
  const route = getRoute();
  const lang = getLang();

  setActiveNav(route);
  setLang(lang);

  titleEl.textContent = pageTitle(route, lang);
  contentEl.innerHTML = `<p style="color: var(--muted);">Loading…</p>`;

  try {
    const html = await loadMarkdown(route, lang);
    contentEl.innerHTML = html;
  } catch (e) {
    contentEl.innerHTML = `
      <p><strong>Couldn’t load content.</strong></p>
      <p style="color: var(--muted);">${e.message}</p>
      <p style="color: var(--muted);">
        Expected files:
        <code>content/en/about.md</code>,
        <code>content/en/resume.md</code>,
        <code>content/de/about.md</code>,
        <code>content/de/resume.md</code>
      </p>
    `;
  }
}

themeBtn.addEventListener("click", () => {
  const current = getTheme();
  setTheme(current === "dark" ? "light" : "dark");
});

languageBtn.addEventListener("click", () => {
  const current = getLang();
  const next = current === "en" ? "de" : "en";
  setLang(next);
  render();
});

window.addEventListener("hashchange", render);

setTheme(getTheme());

render();
