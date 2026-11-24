(function () {
  "use strict";

  var KEY = "omun-lang";
  var LANGS = ["en", "fr", "es", "ca"];
  var ALPHA = "/assets/omun-spark.webm";
  var FLAT = "/assets/omun-spark.mp4";
  var cfg = window.OMUN || { socials: [], menu: [], copy: {} };

  /* Inline icons for the header slots. Add a key here, then reference it from config. */
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"></rect><circle cx="12" cy="12" r="4.15" fill="none" stroke="currentColor" stroke-width="1.6"></circle><circle cx="17.35" cy="6.65" r="1.05" fill="currentColor"></circle></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="2.75" y="6" width="18.5" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"></rect><path d="M11 10.2v3.6l3.3-1.8L11 10.2z" fill="currentColor"></path></svg>',
    email: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"></rect><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path></svg>',
    x: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 5.5 10.4 12 5.2 18.5h2.1l4-5 3.6 5H19l-5.6-7.1 5-6H16.4l-3.6 4.5-3.3-4.5H5z" fill="currentColor"></path></svg>',
    mastodon: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12.1 4.2c-2.3 0-4.1.6-5.3 1.7C5.6 7.1 5 9 5 11.6v5.2c0 1.3.8 2 2.1 2h1.5v-3.3c.9.6 2 .9 3.4.9 1.3 0 2.4-.3 3.3-.9V18.8h1.5c1.3 0 2.1-.7 2.1-2v-5.2c0-2.6-.6-4.5-1.8-5.7-1.2-1.1-3-1.7-5-1.7zm-2 3.6c.7-.2 1.5-.3 2.2-.3.8 0 1.5.1 2.1.3.5.2.8.7.8 1.2v3.4c-.5.4-1.3.7-2.2.7-.7 0-1.3-.2-1.8-.5-.4.3-1 .5-1.7.5-1 0-1.8-.3-2.3-.8V9c0-.5.3-1 .9-1.2z" fill="currentColor"></path></svg>',
    github: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.5c-2.4.5-2.9-1-2.9-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.9-.2-3.9-1-3.9-4.3 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8.2 8.2 0 0 1 4.4 0c1.7-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.3-2 4.1-3.9 4.3.3.3.6.8.6 1.6v2.3c0 .2.2.5.6.4A8.5 8.5 0 0 0 12 3.5z" fill="currentColor"></path></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M14.2 20.5v-7.2h2.4l.4-2.8h-2.8V8.8c0-.8.2-1.4 1.4-1.4h1.5V4.9c-.3 0-1.1-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.8v2h-2.4v2.8h2.4v7.1h3z" fill="currentColor"></path></svg>',
    linkedin: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="4" y="9.2" width="3.3" height="10.3" fill="currentColor"></rect><circle cx="5.65" cy="5.9" r="1.7" fill="currentColor"></circle><path d="M10.2 9.2h3.2v1.4h.1c.4-.8 1.5-1.6 3.1-1.6 3.3 0 3.9 2.2 3.9 5v5.5h-3.3v-4.9c0-1.2 0-2.7-1.6-2.7s-1.9 1.3-1.9 2.6v5h-3.3V9.2z" fill="currentColor"></path></svg>',
    bluesky: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 13.4c-1.1-2.1-4-6-6.7-7.9-1.6-1.1-2.3-.3-2.1 1.3.2 1.4 1.1 4.6 1.6 5.3.6.8 1.3 1 2.1.8-.1 1.8-1.3 3.2-3.4 3.6 2.5 1.5 5.1.4 6.4-1.5.4.6.8 1.1 1.3 1.5.2.2.5.3.8.3s.6-.1.8-.3c.5-.4.9-.9 1.3-1.5 1.3 1.9 3.9 3 6.4 1.5-2.1-.4-3.3-1.8-3.4-3.6.8.2 1.5 0 2.1-.8.5-.7 1.4-3.9 1.6-5.3.2-1.6-.5-2.4-2.1-1.3-2.7 1.9-5.6 5.8-6.7 7.9z" fill="currentColor"></path></svg>',
    home: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M4 11.2 12 4.2l8 7V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-8.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path></svg>',
    projects: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M14.2 4.4 19.6 9.8 16.8 12.6 11.4 7.2 14.2 4.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path><path d="M11.1 7.5 5.4 13.2a2 2 0 0 0 0 2.8l.3.3M7.6 15.4 4.2 18.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>',
    events: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><rect x="4" y="5.5" width="16" height="14.5" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"></rect><path d="M4 10h16M8 3.5v4M16 3.5v4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>',
    info: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" stroke-width="1.6"></circle><path d="M12 11v5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path><circle cx="12" cy="8.1" r="0.9" fill="currentColor"></circle></svg>'
  };

  var lang = document.documentElement.lang;
  if (LANGS.indexOf(lang) === -1) lang = "en";

  function pack() {
    return cfg.copy[lang] || cfg.copy.en || {};
  }

  function text(key) {
    var value = pack()[key];
    return value == null ? "" : value;
  }

  function applyCopy() {
    var t = pack();
    document.documentElement.lang = lang;
    if (t["meta.title"]) document.title = t["meta.title"];
    ["description"].forEach(function (name) {
      var el = document.querySelector('meta[name="' + name + '"]');
      var key = "meta." + name;
      if (el && t[key]) el.setAttribute("content", t[key]);
    });
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (ogTitle && t["meta.title"]) ogTitle.setAttribute("content", t["meta.title"]);
    if (ogDesc && t["meta.description"]) ogDesc.setAttribute("content", t["meta.description"]);
    if (twTitle && t["meta.title"]) twTitle.setAttribute("content", t["meta.title"]);
    if (twDesc && t["meta.description"]) twDesc.setAttribute("content", t["meta.description"]);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (t[key] != null) el.setAttribute("aria-label", t[key]);
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      if (t[key] != null) el.setAttribute("alt", t[key]);
    });
  }

  function iconSvg(name) {
    return ICONS[name] || ICONS.info;
  }

  function fillSlot(list, items, kind) {
    if (!list) return;
    list.replaceChildren();
    (items || []).forEach(function (item) {
      if (!item || !item.url) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      var label = item.name || text(item.labelKey) || item.labelKey || item.url;
      a.href = item.url;
      a.setAttribute("aria-label", label);
      if (kind === "menu") a.title = label;
      if (/^https?:/i.test(item.url)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      a.innerHTML = iconSvg(item.icon);
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function remember(next) {
    try {
      localStorage.setItem(KEY, next);
    } catch (e) {}
  }

  function setupLanguage() {
    var root = document.querySelector(".lang");
    var btn = document.getElementById("lang-btn");
    var menu = document.getElementById("lang-menu");
    if (!root || !btn || !menu) return;
    var options = menu.querySelectorAll("[data-lang]");

    function closeMenu() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }

    function openMenu() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }

    options.forEach(function (link) {
      var code = link.getAttribute("data-lang");
      link.setAttribute("aria-selected", code === lang ? "true" : "false");
      link.addEventListener("click", function (e) {
        remember(code);
        if (code === lang) {
          e.preventDefault();
          closeMenu();
        }
      });
    });

    btn.addEventListener("click", function () {
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    btn.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      openMenu();
      var items = menu.querySelectorAll('[role="option"]');
      var target = e.key === "ArrowUp" ? items[items.length - 1] : items[0];
      if (target) target.focus();
    });

    menu.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(menu.querySelectorAll('[role="option"]'));
      var index = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var dir = e.key === "ArrowDown" ? 1 : -1;
        var next = items[(index + dir + items.length) % items.length];
        if (next) next.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeMenu();
        btn.focus();
      }
    });

    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) closeMenu();
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) {
        closeMenu();
        btn.focus();
      }
    });
  }

  /* WebKit paints VP9 alpha as opaque black. Every iOS browser is WebKit. */
  function supportsWebmAlpha() {
    var probe = document.createElement("video");
    var can = probe.canPlayType('video/webm; codecs="vp09.00.10.08"') || probe.canPlayType('video/webm; codecs="vp9"');
    if (!can) return false;
    var ua = navigator.userAgent || "";
    if (/iP(hone|ad|od)/.test(ua)) return false;
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return false;
    var branded = /Chrom(e|ium)\/|Edg\/|OPR\/|Firefox\/|FxiOS|CriOS|EdgiOS/.test(ua);
    if (/AppleWebKit\//.test(ua) && !branded) return false;
    return true;
  }

  function startMotion() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var video = document.querySelector(".logo-motion");
    var mark = document.getElementById("mark");
    if (reduce || !video || !mark) return;

    var usingFlat = !supportsWebmAlpha();

    function reveal() {
      if (video.readyState >= 2) mark.classList.add("is-playing");
    }

    function useFlat() {
      if (usingFlat && video.getAttribute("src") === FLAT) return;
      usingFlat = true;
      video.src = FLAT;
      var play = video.play();
      if (play && play.catch) play.catch(function () {});
    }

    video.addEventListener("playing", reveal);
    video.addEventListener("error", function () {
      if (!usingFlat) useFlat();
    });

    video.preload = "auto";
    video.src = usingFlat ? FLAT : ALPHA;
    var play = video.play();
    if (play && play.catch) play.catch(function () {});
  }

  applyCopy();
  fillSlot(document.getElementById("social-list"), cfg.socials, "social");
  fillSlot(document.getElementById("menu-list"), cfg.menu, "menu");
  setupLanguage();
  startMotion();
})();
