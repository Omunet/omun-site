/* Contact panel. Posts JSON as text/plain to OMUN.formEndpoint.
   The inbox address is not in this file. Nothing is stored in the browser
   except the moment the panel was opened, which the server uses as a timer. */
(function () {
  "use strict";

  var cfg = window.OMUN || {};
  var ENDPOINT = String(cfg.formEndpoint || "");
  var TOKEN = String(cfg.formToken || "");
  var MAX_BYTES = 18 * 1024 * 1024;
  var MAX_FILES = 10;
  var files = [];
  var sending = false;
  var statusKey = "";
  var statusTone = "";
  var seq = 1;
  var openedAt = 0;
  var ignoreOutsideUntil = 0;

  function pack() {
    var lang = document.documentElement.lang || "en";
    var copy = (cfg.copy && (cfg.copy[lang] || cfg.copy.en)) || {};
    return copy;
  }

  function t(key) {
    var value = pack()[key];
    return value == null ? "" : value;
  }

  function fill(template, token, value) {
    return String(template).split(token).join(value);
  }

  function focusEl(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (err) {
      el.focus();
    }
  }

  function syncLabel() {
    var btn = document.getElementById("contact-btn");
    if (!btn) return;
    var open = btn.getAttribute("aria-expanded") === "true";
    var key = open ? "form.close" : "icon.contact";
    btn.setAttribute("aria-label", t(key));
    btn.setAttribute("title", t(key));
  }

  function backdrop() {
    var el = document.getElementById("contact-backdrop");
    if (el) return el;
    var header = document.querySelector(".site-header");
    if (!header) return null;
    el = document.createElement("button");
    el.type = "button";
    el.id = "contact-backdrop";
    el.className = "contact-backdrop";
    el.tabIndex = -1;
    el.setAttribute("aria-hidden", "true");
    el.hidden = true;
    header.appendChild(el);
    el.addEventListener("click", function () {
      close(false);
    });
    return el;
  }

  function closeLang() {
    var menu = document.getElementById("lang-menu");
    var btn = document.getElementById("lang-btn");
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function open() {
    var panel = document.getElementById("contact-panel");
    var btn = document.getElementById("contact-btn");
    if (!panel || !btn) return;
    closeLang();
    if (!openedAt) openedAt = Date.now();
    var shade = backdrop();
    if (shade) shade.hidden = false;
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    syncLabel();
    focusEl(document.getElementById("contact-name"));
  }

  function close(restoreFocus) {
    var panel = document.getElementById("contact-panel");
    var btn = document.getElementById("contact-btn");
    if (!panel || !btn || panel.hidden) return false;
    panel.hidden = true;
    var shade = document.getElementById("contact-backdrop");
    if (shade) shade.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    syncLabel();
    if (restoreFocus) focusEl(btn);
    return true;
  }

  function setStatus(key, tone) {
    statusKey = key || "";
    statusTone = tone || "";
    var el = document.getElementById("contact-status");
    if (!el) return;
    el.textContent = statusKey ? t(statusKey) : "";
    el.className = "form-status" + (statusTone ? " is-" + statusTone : "");
  }

  function formatSize(bytes) {
    var lang = document.documentElement.lang || "en";
    var mb = bytes / (1024 * 1024);
    var text = mb >= 0.1 ? mb.toFixed(1) : (bytes / 1024).toFixed(0) + " KB";
    if (mb >= 0.1 && lang !== "en") text = text.replace(".", ",");
    if (mb < 0.1) return text;
    return text + (lang === "fr" ? " Mo" : " MB");
  }

  function fileExt(name) {
    var parts = String(name || "").toLowerCase().split(".");
    return parts.length > 1 ? parts.pop() : "";
  }

  function fileAllowed(file) {
    if (!file || !file.size) return false;
    var type = String(file.type || "").toLowerCase().split(";")[0].trim();
    var ext = fileExt(file.name);
    var images = { jpg: 1, jpeg: 1, png: 1, gif: 1, webp: 1, bmp: 1, heic: 1, heif: 1, avif: 1, svg: 1 };
    var videos = { mp4: 1, m4v: 1, webm: 1, mov: 1, avi: 1, mkv: 1, mpeg: 1, mpg: 1, "3gp": 1, ogv: 1 };
    if (ext === "pdf") return type === "application/pdf";
    if (images[ext]) return type.indexOf("image/") === 0;
    if (videos[ext]) return type.indexOf("video/") === 0;
    return false;
  }

  function renderFiles() {
    var list = document.getElementById("contact-files");
    var totalEl = document.getElementById("contact-total");
    if (!list) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    var total = 0;
    files.forEach(function (item) {
      total += item.file.size;
      var li = document.createElement("li");
      var name = document.createElement("span");
      name.className = "file-name";
      name.textContent = item.file.name;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "file-remove";
      btn.setAttribute("data-id", String(item.id));
      btn.textContent = t("form.remove");
      btn.setAttribute("aria-label", fill(t("form.removeNamed"), "{name}", item.file.name));
      if (sending) btn.disabled = true;
      li.appendChild(name);
      li.appendChild(btn);
      list.appendChild(li);
    });
    if (!totalEl) return;
    if (!files.length) {
      totalEl.hidden = true;
      totalEl.textContent = "";
      return;
    }
    totalEl.hidden = false;
    totalEl.textContent = fill(t("form.total"), "{size}", formatSize(total));
  }

  function addFiles(list) {
    var incoming = Array.prototype.slice.call(list || []);
    if (!incoming.length) return;
    var next = files.slice();
    var rejectedType = false;
    var rejectedCount = false;
    var rejectedSize = false;
    incoming.forEach(function (file) {
      if (!fileAllowed(file)) {
        rejectedType = true;
        return;
      }
      if (next.length >= MAX_FILES) {
        rejectedCount = true;
        return;
      }
      var duplicate = next.some(function (item) {
        var prev = item.file;
        return prev.name === file.name && prev.size === file.size && prev.lastModified === file.lastModified;
      });
      if (duplicate) return;
      var total = file.size;
      next.forEach(function (item) { total += item.file.size; });
      if (total > MAX_BYTES) {
        rejectedSize = true;
        return;
      }
      next.push({ id: seq++, file: file });
    });
    files = next;
    renderFiles();
    if (rejectedSize) setStatus("form.size", "error");
    else if (rejectedType) setStatus("form.type", "error");
    else if (rejectedCount) setStatus("form.count", "error");
    else if (statusKey === "form.size" || statusKey === "form.type" || statusKey === "form.count") setStatus("", "");
  }

  function trimField(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    var value = String(el.value || "").replace(/^\s+|\s+$/g, "");
    el.value = value;
    return value;
  }

  function readFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var raw = String(reader.result || "");
        var comma = raw.indexOf(",");
        resolve({
          name: file.name,
          type: file.type || "",
          data: comma >= 0 ? raw.slice(comma + 1) : raw
        });
      };
      reader.onerror = function () { reject(new Error("read")); };
      reader.readAsDataURL(file);
    });
  }

  function setBusy(on) {
    sending = on;
    var form = document.getElementById("contact-form");
    var sendBtn = document.getElementById("contact-send");
    if (form) form.setAttribute("aria-busy", on ? "true" : "false");
    if (sendBtn) {
      sendBtn.disabled = on;
      sendBtn.textContent = on ? t("form.sending") : t("form.send");
    }
    if (!form) return;
    Array.prototype.forEach.call(form.querySelectorAll("input, textarea, button"), function (control) {
      if (control === sendBtn) return;
      if (control.type === "file") return;
      control.disabled = on;
    });
  }

  function knownStatus(code) {
    if (code === "wait") return "form.wait";
    if (code === "rate") return "form.rate";
    if (code === "busy") return "form.busy";
    if (code === "size") return "form.size";
    if (code === "too_large") return "form.tooLarge";
    if (code === "invalid") return "form.invalid";
    return "form.error";
  }

  var root = document.querySelector(".contact");
  var btn = document.getElementById("contact-btn");
  var panel = document.getElementById("contact-panel");
  var form = document.getElementById("contact-form");
  if (!root || !btn || !panel || !form) return;

  btn.addEventListener("click", function () {
    if (panel.hidden) open();
    else close(false);
  });

  var closeBtn = document.getElementById("contact-close");
  if (closeBtn) closeBtn.addEventListener("click", function () { close(true); });

  document.addEventListener("click", function (e) {
    if (Date.now() < ignoreOutsideUntil) return;
    if (root.contains(e.target)) return;
    close(false);
  });

  root.addEventListener("focusout", function (e) {
    if (!e.relatedTarget) return;
    if (!root.contains(e.relatedTarget)) close(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (close(true)) e.preventDefault();
  });

  var fileInput = document.getElementById("contact-file");
  var attachBtn = document.getElementById("contact-attach");
  if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", function () {
      ignoreOutsideUntil = Date.now() + 2000;
      fileInput.click();
    });
  }
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      ignoreOutsideUntil = Date.now() + 500;
      addFiles(fileInput.files);
      fileInput.value = "";
    });
  }
  window.addEventListener("focus", function () {
    if (Date.now() < ignoreOutsideUntil) ignoreOutsideUntil = Date.now() + 400;
  });

  var fileList = document.getElementById("contact-files");
  if (fileList) {
    fileList.addEventListener("click", function (e) {
      var target = e.target.closest ? e.target.closest("button") : null;
      if (!target || !fileList.contains(target) || sending) return;
      var id = target.getAttribute("data-id");
      files = files.filter(function (item) { return String(item.id) !== id; });
      renderFiles();
      if (statusKey === "form.size" || statusKey === "form.type" || statusKey === "form.count") setStatus("", "");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    trimField("contact-name");
    trimField("contact-surname");
    trimField("contact-email");
    trimField("contact-phone");
    trimField("contact-message");
    if (!form.reportValidity()) return;
    var total = 0;
    files.forEach(function (item) { total += item.file.size; });
    if (total > MAX_BYTES) {
      setStatus("form.size", "error");
      return;
    }
    if (!ENDPOINT || ENDPOINT.indexOf("REPLACE_WITH") !== -1) {
      setStatus("form.unconfigured", "error");
      return;
    }
    if (!openedAt || Date.now() - openedAt < 3000) {
      setStatus("form.wait", "error");
      return;
    }
    setStatus("", "");
    setBusy(true);
    Promise.all(files.map(function (item) { return readFile(item.file); }))
      .then(function (encoded) {
        var payload = {
          name: document.getElementById("contact-name").value,
          surname: document.getElementById("contact-surname").value,
          email: document.getElementById("contact-email").value,
          phone: document.getElementById("contact-phone").value,
          message: document.getElementById("contact-message").value,
          company: (document.getElementById("contact-company") || { value: "" }).value,
          lang: document.documentElement.lang || "en",
          started: openedAt,
          origin: location.origin,
          files: encoded
        };
        if (TOKEN) payload.token = TOKEN;
        return fetch(ENDPOINT, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload)
        }).then(function (res) { return res.text(); });
      })
      .then(function (text) {
        var data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error("bad-response");
        }
        if (!data || data.ok !== true) {
          var failure = new Error("form");
          failure.code = data && data.error;
          throw failure;
        }
        form.reset();
        files = [];
        renderFiles();
        openedAt = Date.now();
        setStatus("form.success", "ok");
      })
      .catch(function (err) {
        setStatus(knownStatus(err && err.code), "error");
      })
      .then(function () {
        setBusy(false);
        renderFiles();
      });
  });
})();
