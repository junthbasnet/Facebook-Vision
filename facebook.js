const locale = Array.from(document.body.classList).find((cls) =>
  cls.match(/^Locale_/)
);

/**
 * Update CV tags.
 * @param localeData
 */
const show_facebook_cv_tags = function (localeData) {
  const images = [...document.getElementsByTagName("img")];
  const localeRegex = new RegExp(localeData.separator_regex, "i");

  images.forEach((el) => {
    if (
      el.hasAttribute("data-prev-alt") &&
      el.getAttribute("data-prev-alt") === el.getAttribute("alt")
    ) {
      return;
    }

    el.setAttribute("data-prev-alt", el.alt);

    const altText = el.alt;
    const isCVTag = altText.startsWith(localeData.tag_prefix);

    if (isCVTag) {
      const tags = altText
        .slice(localeData.tag_prefix.length)
        .split(localeRegex);

      let html = '<ul class="fbVision">';

      tags.forEach(function (tag) {
        let prefix = "∙";

        if (tag in localeData.emoji_map) {
          prefix = localeData.emoji_map[tag];
        } else if (tag.endsWith(localeData.tag_ends_with)) {
          prefix = localeData.emoji_map[localeData.tag_ends_with_map];
        }

        html += `<li>${prefix} ${tag}</li>`;
      });

      html += "</ul>";

      el.style.position = "relative";
      el.insertAdjacentHTML("afterend", html);
    }
  });
};

/**
 * Initialize the plugin.
 * @param localeData
 */
const initializePlugin = function (localeData) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => show_facebook_cv_tags(localeData));
  });

  const config = {
    attributes: true,
    childList: true,
    characterData: false,
  };
  observer.observe(document.body, config);
  show_facebook_cv_tags(localeData);
};

/**
 * Make the fetch request to get locale data.
 * @param localePath
 */
const makeLocaleRequest = function (localePath) {
  fetch(chrome.extension.getURL(localePath))
    .then((response) => response.json())
    .then((data) => initializePlugin(data))
    .catch((err) => console.error("Facebook Vision Error!", err));
};

// Check for locale.
if (locale === "Locale_es_LA") {
  makeLocaleRequest("/locales/es_LA/messages.json");
} else if (locale === "Locale_en_GB" || locale === "Locale_en_US") {
  makeLocaleRequest("/locales/en_US/messages.json");
}
