/* Omun copy and header slots.
   Add a social link: append one object to socials.
   Add a centre-menu icon: append one object to menu.
   Add a sentence: add the same key under every language in copy,
   then put data-i18n="that.key" on the element (data-i18n-aria or
   data-i18n-alt for attributes). Icon names are listed in js/site.js. */
(function (global) {
  global.OMUN = {
    socials: [
      // { name: "Instagram", url: "https://www.instagram.com/example", icon: "instagram" },
    ],
    menu: [
      // { labelKey: "menu.home", url: "/", icon: "home" },
    ],
    copy: {
      en: {
        "meta.title": "Omun",
        "meta.description": "Omun",
        "logo.alt": "Omun",
        "skip": "Skip to content",
        "social.label": "Social",
        "menu.label": "Menu",
        "lang.label": "Choose language"
      },
      fr: {
        "meta.title": "Omun",
        "meta.description": "Omun",
        "logo.alt": "Omun",
        "skip": "Aller au contenu",
        "social.label": "Réseaux",
        "menu.label": "Menu",
        "lang.label": "Choisir la langue"
      },
      es: {
        "meta.title": "Omun",
        "meta.description": "Omun",
        "logo.alt": "Omun",
        "skip": "Saltar al contenido",
        "social.label": "Redes",
        "menu.label": "Menú",
        "lang.label": "Elegir idioma"
      },
      ca: {
        "meta.title": "Omun",
        "meta.description": "Omun",
        "logo.alt": "Omun",
        "skip": "Salta al contingut",
        "social.label": "Xarxes",
        "menu.label": "Menú",
        "lang.label": "Tria l'idioma"
      }
    }
  };
})(window);
