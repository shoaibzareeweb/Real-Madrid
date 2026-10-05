const menuButton = document.querySelector(".nav-toggle");
const navigation = document.querySelector(".club-nav");

function closeMenu() {
  if (!menuButton || !navigation) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation",
    );
    navigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });
  navigation
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((element) => revealObserver.observe(element));
} else {
  document
    .querySelectorAll(".reveal")
    .forEach((element) => element.classList.add("is-visible"));
}

const archiveData = window.whiteBookData;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let firstVisit = false;
try {
  firstVisit = sessionStorage.getItem("white-book-entered") !== "yes";
  sessionStorage.setItem("white-book-entered", "yes");
} catch {}

if (firstVisit && !reducedMotion) {
  const loader = document.createElement("div");
  loader.className = "entry-loader";
  loader.setAttribute("role", "status");
  loader.innerHTML =
    '<span class="loader-crest" aria-hidden="true">RM</span><span class="loader-label">ENTERING THE LEGACY</span><span class="loader-percent">00%</span><span class="loader-rule"><i></i></span>';
  document.body.prepend(loader);
  let progress = 0;
  const progressTimer = window.setInterval(() => {
    progress = Math.min(100, progress + 20);
    loader.querySelector(".loader-percent").textContent =
      `${String(progress).padStart(2, "0")}%`;
    loader.querySelector(".loader-rule i").style.width = `${progress}%`;
  }, 75);
  window.setTimeout(() => {
    window.clearInterval(progressTimer);
    loader.classList.add("is-leaving");
    window.setTimeout(() => loader.remove(), 550);
  }, 500);
}

const chapterNav = document.querySelector(".club-nav");
const currentPage = location.pathname.split("/").pop() || "index.html";
const navigationItems = [
  ["Home", "index.html", "index.html"],
  ["Legacy", "index.html#legacy", "legacy.html"],
  ["Legends", "legends.html", "legends.html"],
  ["Managers", "coaches.html", "coaches.html"],
  ["Trophies", "honours.html", "honours.html"],
  ["Stadium", "index.html#stadium", "stadium"],
  ["Team", "squad.html", "squad.html"],
  ["Matches", "index.html#matches", "matches"],
  ["News", "index.html#journal", "journal"],
  ["Gallery", "index.html#gallery", "gallery"],
];

if (chapterNav) {
  chapterNav.replaceChildren(
    ...navigationItems.map(([label, href, match]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (
        currentPage === match ||
        (currentPage === "index.html" && match === "index.html")
      ) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
      link.addEventListener("click", closeMenu);
      return link;
    }),
  );
}

document.querySelectorAll(".chapter-header,.club-header").forEach((header) => {
  const updateHeader = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
});

const eraEntries = Object.fromEntries(
  (archiveData?.history ?? []).map((entry) => [
    entry.year,
    [entry.era, entry.title, entry.note],
  ]),
);

document.querySelectorAll(".history-stop").forEach((stop) => {
  stop.addEventListener("click", () => {
    const entry = eraEntries[stop.dataset.era];
    const reveal = document.querySelector(".history-reveal");
    if (!entry || !reveal) return;
    document.querySelectorAll(".history-stop").forEach((item) => {
      const active = item === stop;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
    });
    reveal.innerHTML = `<p class="eyebrow">${entry[0]}</p><h3>${entry[1]}</h3><p>${entry[2]}</p><a href="legacy.html" class="text-link">OPEN THE FULL TIMELINE <span>↗</span></a>`;
  });
});

const museumDialog = document.querySelector("#museum-dialog");
function showDialog(dialog, kicker, title, description) {
  if (!dialog) return;
  const content = dialog.querySelector(".dialog-content");
  content.innerHTML = `<span class="dialog-kicker">${kicker}</span><h2>${title}</h2><p>${description}</p>`;
  dialog.showModal();
}

document.querySelectorAll("[data-hotspot]").forEach((button) => {
  button.addEventListener("click", () =>
    showDialog(
      museumDialog,
      "BERNABÉU · THE HOME",
      button.dataset.hotspot,
      button.dataset.detail,
    ),
  );
});

document.querySelectorAll(".detail-dialog").forEach((dialog) => {
  dialog
    .querySelector(".dialog-close")
    ?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const legendGrid = document.querySelector("#legend-grid");
if (legendGrid && archiveData?.legends) {
  legendGrid.replaceChildren(
    ...archiveData.legends.map((person) => {
      const button = document.createElement("button");
      button.className = "legend-item";
      button.dataset.initial = person.name.split(/\s+/).at(-1)?.[0] ?? "R";
      button.innerHTML = `<small>${person.era}</small><strong>${person.name}</strong><span>${person.role} · ${person.years}</span>`;
      button.addEventListener("click", () =>
        showDialog(
          document.querySelector("#profile-dialog"),
          `${person.era} · ${person.years}`,
          person.name,
          `${person.role}. ${person.note}`,
        ),
      );
      return button;
    }),
  );
}

const trophyGrid = document.querySelector("#trophy-grid");
if (trophyGrid && archiveData?.trophies) {
  trophyGrid.replaceChildren(
    ...archiveData.trophies.map((trophy) => {
      const button = document.createElement("button");
      button.className = "trophy-item";
      button.innerHTML = `<small>${trophy.mark} / ${trophy.count} WINS THROUGH 2024</small><span class="trophy-silhouette" aria-hidden="true">✦</span><strong>${trophy.name}</strong><span>${trophy.note}</span>`;
      button.addEventListener("click", () =>
        showDialog(
          document.querySelector("#trophy-dialog"),
          `TROPHY ROOM · ${trophy.count} THROUGH 2024`,
          trophy.name,
          trophy.note,
        ),
      );
      return button;
    }),
  );
}

const lightbox = document.querySelector("#museum-dialog");
document.querySelectorAll("[data-lightbox]").forEach((button) => {
  button.addEventListener("click", () => {
    showDialog(
      lightbox,
      "THE WHITE BOOK · GALLERY",
      button.dataset.lightbox,
      "An image from the independent club archive.",
    );
    const artwork = document.createElement("div");
    artwork.className = "dialog-photo";
    artwork.setAttribute("role", "img");
    artwork.setAttribute("aria-label", button.dataset.lightbox);
    artwork.style.backgroundImage =
      getComputedStyle(button).getPropertyValue("--gallery-image");
    lightbox.querySelector(".dialog-content").prepend(artwork);
  });
});

const toast = document.querySelector(".interaction-toast");
let crestClicks = 0;
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => toast.classList.remove("is-visible"),
    2400,
  );
}
document.querySelectorAll("[data-crest],.crest-relief").forEach((crest) => {
  crest.addEventListener("click", (event) => {
    if (crest.matches("[data-crest]")) event.preventDefault();
    crestClicks += 1;
    if (crestClicks === 7) {
      document.body.classList.toggle("legends-mode");
      showToast(
        document.body.classList.contains("legends-mode")
          ? "LEGENDS MODE · HALA MADRID"
          : "HALA MADRID.",
      );
      crestClicks = 0;
    }
  });
});

document.querySelectorAll("[data-tilt]").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.transform = `rotateY(${x * 14}deg) rotateX(${y * -12}deg)`;
  });
  element.addEventListener("pointerleave", () => {
    element.style.transform = "rotateY(0) rotateX(0)";
  });
});

const managerList = document.querySelector(".architect-list");
if (managerList && archiveData?.managers) {
  managerList.replaceChildren(
    ...archiveData.managers.map((manager, index) => {
      const article = document.createElement("article");
      const years = document.createElement("span");
      years.className = "architect-year";
      years.textContent = manager.years;
      const details = document.createElement("div");
      const identity = document.createElement("small");
      identity.textContent = "THE ARCHITECT";
      const name = document.createElement("h3");
      name.textContent = manager.name;
      const philosophy = document.createElement("p");
      philosophy.textContent = manager.identity;
      const honors = document.createElement("b");
      honors.textContent = manager.honors;
      const number = document.createElement("span");
      number.className = "architect-mark";
      number.textContent = String(index + 1).padStart(2, "0");
      details.append(identity, name, philosophy, honors);
      article.append(years, details, number);
      return article;
    }),
  );
}

document.querySelectorAll(".architect-list article").forEach((chapter) => {
  const name = chapter.querySelector("h3")?.textContent?.trim();
  if (!name) return;
  chapter.tabIndex = 0;
  chapter.setAttribute("role", "button");
  chapter.setAttribute("aria-label", `Open ${name} manager chapter`);
  const openChapter = () =>
    showDialog(
      document.querySelector("#manager-dialog"),
      `${chapter.querySelector(".architect-year")?.textContent?.trim()} · ${chapter.querySelector("small")?.textContent?.trim()}`,
      name,
      `${chapter.querySelector("p")?.textContent?.trim()} ${chapter.querySelector("b")?.textContent?.trim()}. The archive omits win percentages where source definitions differ.`,
    );
  chapter.addEventListener("click", openChapter);
  chapter.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openChapter();
    }
  });
});
