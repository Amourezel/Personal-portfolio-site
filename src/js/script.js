/* =========================
   DATA
========================= */

const WORKS = [
  {
    name: "AN ONE SWORD",
    img: "img/works/AnOldSword.jpg",
    url: "https://www.artstation.com/artwork/XJRPJa",
  },
];

const EMAIL = "amourezel@ukr.net";

const CONTACTS = [
  {
    label: "ArtStation",
    hint: "Portfolio",
    url: "https://www.artstation.com/amourezel",
    color: "#ff2d2d",
    icon: "AS",
  },
  {
    label: "LinkedIn",
    hint: "Profile",
    url: "https://www.linkedin.com/in/ihor-lohvenyuk-1107463a9/",
    color: "#0a66c2",
    icon: "IN",
  },
  {
    label: "Email",
    hint: EMAIL,
    url: `mailto:${EMAIL}`,
    color: "#7a5aff",
    icon: "@",
  },
];

const I18N = {
  en: {
    menu_home: "Home",
    menu_about: "About",
    menu_skills: "Skills",
    menu_works: "Works",
    menu_cv: "CV",
    menu_contacts: "Contacts",
    k_home: "Home",
    k_about: "About",
    k_skills: "Skills",
    k_works: "Works",
    k_cv: "CV",
    k_contacts: "Contacts",
    welcome: "WELCOME!",
    open_work: "Open work →",
    open_cv: "Open CV (PDF) →",
    skills_label: "Skills",
    workflows_label: "Workflows",
    software_label: "Software",
    about_text: `My name is Ihor. Nickname Amourezel.<br><br>
               I'm a 3D artist specializing in different medieval weapons for video games.<br><br>
               In my work I aim for a strong look with optimization for game engines.<br><br>
               I'm open to collaboration.`,
  },
  ua: {
    menu_home: "Головна",
    menu_about: "Про мене",
    menu_skills: "Навички",
    menu_works: "Роботи",
    menu_cv: "CV",
    menu_contacts: "Контакти",
    k_home: "Головна",
    k_about: "Про мене",
    k_skills: "Навички",
    k_works: "Роботи",
    k_cv: "CV",
    k_contacts: "Контакти",
    welcome: "ВІТАЮ!",
    open_work: "Відкрити роботу →",
    open_cv: "Відкрити CV (PDF) →",
    skills_label: "Навички",
    workflows_label: "Процеси",
    software_label: "Софт",
    about_text: `Звати Ігор. Нікнейм Amourezel.<br><br>
               Я 3D художник, спеціалізуюся на різноманітній середньовічній зброї для комп'ютерних ігор.<br><br>
               У своїх роботах намагаюся поєднати крутий вигляд з оптимізацією під ігрові рушії.<br><br>
               Буду радий співпраці.`,
  },
};

/* =========================
   DOM
========================= */

const cube = document.getElementById("cube");
const rightPane = document.getElementById("rightPane");
const menuBtns = document.querySelectorAll("#menuPanel button");
const uiWorks = document.getElementById("uiWorks");
const uiCv = document.getElementById("uiCv");
const uiContacts = document.getElementById("uiContacts");
const mBurger = document.getElementById("mBurger");
const mNavPanel = document.getElementById("mNavPanel");
const mHeader = document.querySelector(".mHeader");

/* =========================
   CONSTANTS / STATE
========================= */

const ROT = {
  front: "rotateX(0deg) rotateY(0deg)",
  right: "rotateX(0deg) rotateY(-90deg)",
  back: "rotateX(0deg) rotateY(-180deg)",
  left: "rotateX(0deg) rotateY(90deg)",
  top: "rotateX(-90deg) rotateY(0deg)",
  bottom: "rotateX(90deg) rotateY(0deg)",
};

let lang = "en";
let face = "front";
let mobileMenuOpen = false;
let uiRevealTimer = 0;
const UI_REVEAL_PROGRESS = 0.7;
const MOBILE_SCROLL_DELAY_MS = 360;

/* =========================
   FUNCTIONS
========================= */

const applyLang = (next) => {
  lang = next;
  document.documentElement.lang = lang === "ua" ? "uk" : "en";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = I18N[lang][key];
    if (val == null) return;
    key === "about_text" ? (el.innerHTML = val) : (el.textContent = val);
  });

  document
    .querySelectorAll(".langBtn")
    .forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));

  document.querySelectorAll(".slideOverlay").forEach((overlay) => {
    overlay.dataset.openWork = I18N[lang]?.open_work || "Open work →";
    const hint = overlay.querySelector(".slideHint");
    if (hint) hint.textContent = I18N[lang]?.open_work || "Open work →";
  });
};

const renderContacts = (el) => {
  if (!el) return;

  el.innerHTML = "";

  CONTACTS.forEach((item) => {
    const a = document.createElement("a");
    a.className = "linkBtn";
    a.href = item.url;
    a.style.setProperty("--stripe", item.color || "#ff2d2d");

    const isMail = item.url.startsWith("mailto:");
    a.target = isMail ? "_self" : "_blank";
    a.rel = isMail ? "" : "noreferrer";

    a.innerHTML = `
      <div class="linkLeft">
        <div class="linkIcon">${item.icon || "→"}</div>
        <div class="linkTexts">
          <div class="linkLabel">${item.label}</div>
          ${item.hint ? `<div class="linkHint">${item.hint}</div>` : ""}
        </div>
      </div>
      <div class="linkArrow">→</div>
    `;

    el.appendChild(a);
  });
};

const initSlider = ({ link, name, dots, prev, next }) => {
  if (!link || !dots || !prev || !next) return;

  let i = 0;
  let lock = false;
  let drag = null;
  let suppressClick = false;

  const originalOverlay = link.querySelector(".slideOverlay");
  if (originalOverlay) originalOverlay.remove();

  const mkSlide = (work, x) => {
    const frame = document.createElement("div");
    frame.className = "slideFrame";
    frame.style.transform = `translateX(${x}%)`;

    const picture = document.createElement("picture");
    picture.className = "slidePic";

    const webp = document.createElement("source");
    webp.type = "image/webp";
    webp.srcset = work.img.replace(/\.(jpg|png)$/i, ".webp");

    const img = document.createElement("img");
    img.className = "slideImg";
    img.src = work.img;
    img.alt = "Work preview";
    img.loading = "lazy";

    picture.append(webp, img);
    frame.appendChild(picture);

    const overlay = document.createElement("div");
    overlay.className = "slideOverlay";
    overlay.dataset.openWork = I18N[lang]?.open_work || "Open work →";
    overlay.innerHTML = `
      <div style="min-width:0">
        <div class="slideName">${work.name || "Work"}</div>
        <div class="slideHint">${I18N[lang]?.open_work || "Open work →"}</div>
      </div>
      <div class="slideHint">→</div>
    `;
    frame.appendChild(overlay);

    return frame;
  };

  const getCurrentSlide = () => link.querySelector(".slideFrame");
  const getIncomingX = (direction, progress = 0) =>
    (direction === 1 ? 100 : -100) + progress;

  const renderDots = () => {
    dots.innerHTML = "";
    WORKS.forEach((_, idx) => {
      const b = document.createElement("button");
      b.className = "dot" + (idx === i ? " active" : "");
      b.type = "button";
      b.onclick = () => go(idx);
      dots.appendChild(b);
    });
  };

  const setInstant = (idx) => {
    const w = WORKS[idx] || WORKS[0];
    i = idx;

    link.querySelectorAll(".slideFrame").forEach((n) => n.remove());

    link.append(mkSlide(w, 0));
    link.href = w.url || "https://www.artstation.com/amourezel";
    if (name) name.textContent = w.name || "Work";
    renderDots();
  };

  const go = (idx) => {
    if (lock || idx === i) return;

    const dir = idx > i ? 1 : -1;
    const w = WORKS[idx] || WORKS[0];

    const cur = getCurrentSlide();
    if (!cur) {
      setInstant(idx);
      return;
    }

    lock = true;

    const incoming = mkSlide(w, dir === 1 ? 100 : -100);
    link.append(incoming);

    if (name) name.textContent = w.name || "Work";

    requestAnimationFrame(() => {
      cur.style.transform = `translateX(${dir === 1 ? -100 : 100}%)`;
      incoming.style.transform = "translateX(0%)";
    });

    cur.addEventListener(
      "transitionend",
      (e) => {
        if (e.propertyName !== "transform") return;
        cur.remove();
        i = idx;
        link.href = w.url || "https://www.artstation.com/amourezel";
        renderDots();
        lock = false;
      },
      { once: true },
    );
  };

  const pointerDown = (e) => {
    if (lock || e.button > 0) return;
    if (e.pointerType === "mouse" && window.innerWidth > 1100) return;

    drag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      deltaX: 0,
      active: false,
      dir: 0,
      incoming: null,
    };

    link.setPointerCapture?.(e.pointerId);
  };

  const pointerMove = (e) => {
    if (!drag || drag.id !== e.pointerId || lock) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (!drag.active) {
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag = null;
        return;
      }
      drag.active = true;
      suppressClick = true;
      link.classList.add("dragging");
    }

    drag.deltaX = dx;

    const current = getCurrentSlide();
    if (!current) return;

    const progress = (dx / Math.max(link.clientWidth, 1)) * 100;
    const dir = dx < 0 ? 1 : -1;

    if (!drag.incoming || drag.dir !== dir) {
      drag.incoming?.remove();
      drag.dir = dir;
      drag.incoming = mkSlide(
        WORKS[(i + dir + WORKS.length) % WORKS.length] || WORKS[0],
        getIncomingX(dir),
      );
      link.append(drag.incoming);
    }

    current.style.transition = "none";
    drag.incoming.style.transition = "none";
    current.style.transform = `translateX(${progress}%)`;
    drag.incoming.style.transform = `translateX(${getIncomingX(dir, progress)}%)`;
  };

  const pointerEnd = (e) => {
    if (!drag || drag.id !== e.pointerId) return;

    const current = getCurrentSlide();
    const incoming = drag.incoming;
    const dx = drag.deltaX;
    const threshold = Math.min(120, link.clientWidth * 0.18);
    const shouldMove = drag.active && Math.abs(dx) > threshold;
    const dir = dx < 0 ? 1 : -1;
    const nextIdx = (i + dir + WORKS.length) % WORKS.length;
    const nextWork = WORKS[nextIdx] || WORKS[0];

    link.classList.remove("dragging");
    link.releasePointerCapture?.(e.pointerId);

    if (current) current.style.transition = "";
    if (incoming) incoming.style.transition = "";

    if (!shouldMove || !current || !incoming) {
      if (current) current.style.transform = "translateX(0%)";
      if (incoming) {
        incoming.style.transform = `translateX(${getIncomingX(dir)}%)`;
        incoming.addEventListener(
          "transitionend",
          (evt) => {
            if (evt.propertyName !== "transform") return;
            incoming.remove();
          },
          { once: true },
        );
      }
      drag = null;
      return;
    }

    lock = true;
    current.style.transform = `translateX(${dir === 1 ? -100 : 100}%)`;
    incoming.style.transform = "translateX(0%)";

    current.addEventListener(
      "transitionend",
      (evt) => {
        if (evt.propertyName !== "transform") return;
        current.remove();
        i = nextIdx;
        link.href = nextWork.url || "https://www.artstation.com/amourezel";
        if (name) name.textContent = nextWork.name || "Work";
        renderDots();
        lock = false;
      },
      { once: true },
    );

    drag = null;
  };

  prev.onclick = () => go((i - 1 + WORKS.length) % WORKS.length);
  next.onclick = () => go((i + 1) % WORKS.length);

  link.addEventListener("pointerdown", pointerDown);
  link.addEventListener("pointermove", pointerMove);
  link.addEventListener("pointerup", pointerEnd);
  link.addEventListener("pointercancel", pointerEnd);
  link.addEventListener("click", (e) => {
    if (!suppressClick) return;
    e.preventDefault();
    suppressClick = false;
  });

  setInstant(0);
};

const setCubeSize = () => {
  if (!rightPane) return;

  const w = rightPane.clientWidth;
  const h = rightPane.clientHeight;

  const pad =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--pad"),
    ) || 36;

  const size =
    window.innerWidth < 930
      ? Math.min(w * 0.7, h * 0.7)
      : Math.max(160, Math.min(w, h) - pad);

  document.documentElement.style.setProperty("--s", size + "px");
};

const hideAllUi = () => {
  clearTimeout(uiRevealTimer);

  [uiWorks, uiCv, uiContacts].forEach((el) => {
    if (!el) return;
    el.classList.remove("show");
    el.classList.add("hideFast");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("hideFast"), 140);
  });
};

const showUiForFace = (f) => {
  const map = { right: uiWorks, bottom: uiCv, left: uiContacts };
  const el = map[f];
  if (!el) return;
  el.classList.remove("hideFast");
  requestAnimationFrame(() => el.classList.add("show"));
};

const parseTimeToMs = (value) => {
  const normalized = value.trim();
  if (!normalized) return 0;
  if (normalized.endsWith("ms")) return parseFloat(normalized);
  if (normalized.endsWith("s")) return parseFloat(normalized) * 1000;
  return parseFloat(normalized) || 0;
};

const getCubeRotationMs = () => {
  if (!cube) return 850;

  const styles = getComputedStyle(cube);
  const durations = styles.transitionDuration.split(",");
  const delays = styles.transitionDelay.split(",");

  return (
    durations.reduce((max, duration, idx) => {
      const total =
        parseTimeToMs(duration) +
        parseTimeToMs(delays[idx] || delays[0] || "0s");
      return Math.max(max, total);
    }, 0) || 850
  );
};

const scheduleUiReveal = (f) => {
  clearTimeout(uiRevealTimer);
  const delay = Math.round(getCubeRotationMs() * UI_REVEAL_PROGRESS - 70);
  uiRevealTimer = setTimeout(() => {
    uiRevealTimer = 0;
    showUiForFace(f);
  }, delay);
};

const setFace = (next) => {
  if (!cube) return;

  if (next === face) {
    hideAllUi();
    showUiForFace(next);
    return;
  }

  face = next;
  cube.dataset.face = next;

  menuBtns.forEach((b) =>
    b.classList.toggle("active", b.dataset.face === next),
  );

  hideAllUi();
  cube.style.transform = ROT[next] || ROT.front;
  scheduleUiReveal(next);
};

const setVH = () => {
  const viewportHeight =
    window.visualViewport?.height ||
    document.documentElement.clientHeight ||
    window.innerHeight;

  document.documentElement.style.setProperty(
    "--vh",
    viewportHeight * 0.01 + "px",
  );
};

const setMobileMenu = (open) => {
  if (!mBurger || !mNavPanel) return;

  mobileMenuOpen = open;
  mBurger.classList.toggle("active", open);
  mBurger.setAttribute("aria-expanded", String(open));
  mNavPanel.classList.toggle("open", open);
  mNavPanel.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("menuOpen", open);
  requestAnimationFrame(setMobileHeaderOffset);
};

const setMobileHeaderOffset = () => {
  const top = Math.max(0, mHeader?.getBoundingClientRect().top || 0);
  const height = mHeader?.offsetHeight || 0;
  const offset = Math.ceil(top + height + 10);
  document.documentElement.style.setProperty(
    "--m-header-offset",
    `${offset}px`,
  );
};

const scrollToMobileSection = (id) => {
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

  if (id === "m-home") {
    window.scrollTo({ top: 0, behavior });
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior, block: "start" });
};

/* =========================
   INIT / EVENTS
========================= */

cube?.addEventListener("transitionend", (e) => {
  if (e.propertyName !== "transform") return;
  if (!uiRevealTimer) showUiForFace(cube.dataset.face || "front");
});

menuBtns.forEach((b) =>
  b.addEventListener("click", () => setFace(b.dataset.face)),
);

if (rightPane) {
  new ResizeObserver(() => {
    setCubeSize();
    if (cube) cube.style.transform = ROT[face] || ROT.front;
  }).observe(rightPane);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".langBtn");
  if (btn?.dataset.lang) applyLang(btn.dataset.lang);

  if (e.target.closest(".mBurger")) {
    setMobileMenu(!mobileMenuOpen);
    return;
  }

  const navItem = e.target.closest(".mNavItem");
  if (navItem?.dataset.mobileTarget) {
    setMobileMenu(false);
    setTimeout(
      () => scrollToMobileSection(navItem.dataset.mobileTarget),
      MOBILE_SCROLL_DELAY_MS,
    );
    return;
  }

  if (mobileMenuOpen && e.target === mNavPanel) {
    setMobileMenu(false);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenuOpen) setMobileMenu(false);
});

applyLang("en");
renderContacts(document.getElementById("dContacts"));
renderContacts(document.getElementById("mContacts"));

initSlider({
  link: document.getElementById("dSlideLink"),
  name: document.getElementById("dSlideName"),
  dots: document.getElementById("dDots"),
  prev: document.querySelector('#uiWorks [data-act="prev"]'),
  next: document.querySelector('#uiWorks [data-act="next"]'),
});

initSlider({
  link: document.getElementById("mSlideLink"),
  name: document.getElementById("mSlideName"),
  dots: document.getElementById("mDots"),
  prev: document.querySelector('.mobilePage [data-scope="m"][data-act="prev"]'),
  next: document.querySelector('.mobilePage [data-scope="m"][data-act="next"]'),
});

setCubeSize();

if (cube) {
  cube.style.transform = ROT[face] || ROT.front;
  hideAllUi();
}

setVH();
setMobileHeaderOffset();
addEventListener("resize", () => {
  setVH();
  setMobileHeaderOffset();
  requestAnimationFrame(setVH);
  requestAnimationFrame(setMobileHeaderOffset);
  if (window.innerWidth > 1100 && mobileMenuOpen) setMobileMenu(false);
});
addEventListener("orientationchange", () => {
  setVH();
  setMobileHeaderOffset();
  requestAnimationFrame(setVH);
  requestAnimationFrame(setMobileHeaderOffset);
  setTimeout(setVH, 120);
  setTimeout(setMobileHeaderOffset, 120);
});
window.visualViewport?.addEventListener("resize", () => {
  setVH();
  setMobileHeaderOffset();
});
