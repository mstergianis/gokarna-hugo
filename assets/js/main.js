document.addEventListener("DOMContentLoaded", ready, false);

const THEME_PREF_STORAGE_KEY = "theme-preference";
const THEME_TO_ICON_CLASS = {
  dark: "feather-moon",
  light: "feather-sun",
};
const THEME_TO_ICON_TEXT_CLASS = {
  dark: "Dark mode",
  light: "Light mode",
};
let toggleIcon = "";
let darkThemeCss = "";

const HEADING_TO_TOC_CLASS = {
  H1: "level-1",
  H2: "level-2",
  H3: "level-3",
  H4: "level-4",
};

function createCopyIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("width", "24");
  icon.setAttribute("height", "24");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("class", "feather feather-copy");

  const iconRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  iconRect.setAttribute("x", 9);
  iconRect.setAttribute("y", 9);
  iconRect.setAttribute("width", 13);
  iconRect.setAttribute("height", 13);
  iconRect.setAttribute("rx", 2);
  iconRect.setAttribute("ry", 2);
  icon.appendChild(iconRect);

  const iconPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  iconPath.setAttribute(
    "d",
    "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  );
  icon.appendChild(iconPath);
  return icon;
}

function createCheckmarkIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("width", "24");
  icon.setAttribute("height", "24");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-color", "#228B22");
  icon.setAttribute("stroke-linejoin", "round");
  icon.setAttribute("class", "feather feather-check");

  const iconCheck = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline",
  );
  iconCheck.setAttribute("points", "20 6 9 17 4 12");
  icon.appendChild(iconCheck);

  return icon;
}

function ready() {
  if (navigator && navigator.clipboard) {
    document.querySelectorAll("pre > code").forEach((codeBlock) => {
      let container = document.createElement("div");
      container.setAttribute("class", "copy-container");
      let button = document.createElement("button");
      button.className = "copy-code-button";
      button.type = "button";
      button.addEventListener("click", function () {
        navigator.clipboard
          .writeText(codeBlock.innerText.replaceAll(/\n\n/g, "\n"))
          .then(
            function () {
              /* Chrome doesn't seem to blur automatically,
                 leaving the button in a focused state. */
              button.blur();

              button.removeChild(button.firstChild);
              button.appendChild(createCheckmarkIcon());
              setTimeout(() => {
                button.removeChild(button.firstChild);
                button.appendChild(createCopyIcon());
              }, 2000);
            },
            function (error) {
              console.error(error);
            },
          );
      });
      container.appendChild(button);

      const icon = createCopyIcon();
      button.appendChild(icon);

      codeBlock.appendChild(container);
    });
  }

  feather.replace({ "stroke-width": 1, width: 20, height: 20 });
  setThemeByUserPref();

  if (
    document.querySelector("main#content > .container") !== null &&
    document
      .querySelector("main#content > .container")
      .classList.contains("post")
  ) {
    if (document.getElementById("TableOfContents") !== null) {
      fixTocItemsIndent();
      createScrollSpy();
    } else {
      document.querySelector("main#content > .container.post").style.display =
        "block";
    }
  }

  // Elements to inject
  const svgsToInject = document.querySelectorAll("img.svg-inject");
  // Do the injection
  SVGInjector(svgsToInject);

  const observer = new MutationObserver(() => {
    normalizeSvgPaths();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function normalizeSvgPaths() {
    document.querySelectorAll(".nav-link a .svg-inject").forEach((path) => {
      const bbox = path.getBBox();
      const scaleX = 20 / bbox.width;
      const scaleY = 20 / bbox.height;
      const scale = Math.min(scaleX, scaleY);

      path.setAttribute(
        "transform",
        `scale(${scale}) translate(${-bbox.x}, ${-bbox.y})`,
      );
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "1");
      path.setAttribute("fill", "transparent");
    });
  }

  document
    .getElementById("hamburger-menu-toggle")
    .addEventListener("click", () => {
      const hamburgerMenu =
        document.getElementsByClassName("nav-hamburger-list")[0];
      const hamburgerMenuToggleTarget = document.getElementById(
        "hamburger-menu-toggle-target",
      );
      if (hamburgerMenu.classList.contains("visibility-hidden")) {
        hamburgerMenu.classList.remove("visibility-hidden");
        hamburgerMenuToggleTarget.setAttribute("aria-checked", "true");
      } else {
        hamburgerMenu.classList.add("visibility-hidden");
        hamburgerMenuToggleTarget.setAttribute("aria-checked", "false");
      }
    });
}

window.addEventListener("scroll", () => {
  if (window.innerWidth <= 820) {
    // For smaller screen, show shadow earlier
    toggleHeaderShadow(50);
  } else {
    toggleHeaderShadow(100);
  }
});

function fixTocItemsIndent() {
  document.querySelectorAll("#TableOfContents a").forEach(($tocItem) => {
    const itemId = $tocItem.getAttribute("href").substring(1);
    $tocItem.classList.add(
      HEADING_TO_TOC_CLASS[document.getElementById(itemId).tagName],
    );
  });
}

function createScrollSpy() {
  var elements = document.querySelectorAll("#toc a");
  document.addEventListener("scroll", function () {
    elements.forEach(function (element) {
      const boundingRect = document
        .getElementById(element.getAttribute("href").substring(1))
        .getBoundingClientRect();
      if (boundingRect.top <= 55 && boundingRect.bottom >= 0) {
        elements.forEach(function (elem) {
          elem.classList.remove("active");
        });
        element.classList.add("active");
      }
    });
  });
}

function toggleHeaderShadow(scrollY) {
  if (window.scrollY > scrollY) {
    document.querySelectorAll(".header").forEach(function (item) {
      item.classList.add("header-shadow");
    });
  } else {
    document.querySelectorAll(".header").forEach(function (item) {
      item.classList.remove("header-shadow");
    });
  }
}

function setThemeByUserPref() {
  darkThemeCss = document.getElementById("dark-theme");
  const savedTheme =
    localStorage.getItem(THEME_PREF_STORAGE_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  const darkThemeToggles = document.querySelectorAll(".dark-theme-toggle");
  setTheme(savedTheme, darkThemeToggles);
  darkThemeToggles.forEach((el) =>
    el.addEventListener("click", toggleTheme, { capture: true }),
  );
}

function toggleTheme(event) {
  toggleIcon = event.currentTarget.querySelector("a svg.feather");
  if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.dark) {
    setThemeAndStore("light", [event.currentTarget]);
  } else if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.light) {
    setThemeAndStore("dark", [event.currentTarget]);
  }
}

function setTheme(themeToSet, targets) {
  darkThemeCss.disabled = themeToSet === "light";
  targets.forEach((target) => {
    target.querySelector("a").innerHTML =
      feather.icons[THEME_TO_ICON_CLASS[themeToSet].split("-")[1]].toSvg();
    target.querySelector(
      ".dark-theme-toggle-screen-reader-target",
    ).textContent = [THEME_TO_ICON_TEXT_CLASS[themeToSet]];
  });
}

function setThemeAndStore(themeToSet, targets) {
  setTheme(themeToSet, targets);
  localStorage.setItem(THEME_PREF_STORAGE_KEY, themeToSet);
}
