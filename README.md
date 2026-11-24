# omun.net

Static homepage for [omun.net](https://omun.net), published with GitHub Pages.

The domain, DNS, and email stay at OVH. `CNAME` is `omun.net`. Do not change it in this repository.

## Pages

English is the default at `/`. French, Spanish, and Catalan are `/fr/`, `/es/`, and `/ca/`. Each page carries `hreflang` alternates. Strings for every language live in `js/config.js` under `OMUN.copy`, so a new line of copy is one key added in each language plus a `data-i18n` attribute.

Choosing a language stores `omun-lang` in `localStorage`. A later visit to `/` opens that language. A direct link to `/fr/`, `/es/`, or `/ca/` stays on the language in the URL.

## Header

The fixed header follows the Spectrum Patronum pattern: social icons on the left, an icon menu in the centre, and the language globe on the right. The centre holds the contact button. Social icons and any further menu icons are filled from lists in `js/config.js`:

```js
socials: [
  { name: "Instagram", url: "https://www.instagram.com/example", icon: "instagram" },
],
menu: [
  { labelKey: "menu.home", url: "/", icon: "home" },
],
```

Icon names (`instagram`, `youtube`, `email`, `x`, `mastodon`, `github`, `facebook`, `linkedin`, `bluesky`, `home`, `projects`, `events`, `info`) are the SVGs in `js/site.js`.

## Logo

Where the browser can composite VP9 alpha (Chrome, Edge, Firefox), the page plays `assets/omun-spark.webm` and the transparent pixels show `#0B0710`. Safari, including iOS, plays `assets/omun-spark.mp4`. That file is the same animation composited on `#0B0710`, because H.264 has no alpha; 4:2:0 rounding leaves the flat field one step of blue off the page colour, which does not read as a box. `prefers-reduced-motion` keeps the still frame `assets/omun-spark-still.webp` and does not request a video.

There is no analytics. The page does not load a third-party host. Sending the contact form posts to the Google Apps Script URL in `formEndpoint` (`js/config.js`). That value is a placeholder until `form-backend/Code.gs` is deployed. See `form-backend/README.md`. The form does not show an inbox address.

Accent colour is blood red (`#6E0B14` on buttons, `#C41E28` on focus rings and thin marks). There is no yellow.
