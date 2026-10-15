# Website Immanuel Akomoeje

Statische website: HTML, CSS en JavaScript, zonder build-stap of database.

## Online zetten (gratis)

**Netlify (makkelijkst):** ga naar https://app.netlify.com/drop en sleep de hele map `website` erin. Je krijgt meteen een werkende link. Een eigen domein koppel je daarna onder *Domain settings*.

**Vercel:** maak een nieuw project aan, upload de map, en kies bij *Framework* voor "Other".

**GitHub Pages:** zet de bestanden in een repository en zet *Settings → Pages* aan op de `main`-branch.

## Na het koppelen van een domein

Vul in `index.html` het volledige adres in bij de deelafbeelding, zodat WhatsApp en LinkedIn een voorbeeld tonen:

```html
<link rel="canonical" href="https://JOUWDOMEIN.nl/">
<meta property="og:url" content="https://JOUWDOMEIN.nl/">
<meta property="og:image" content="https://JOUWDOMEIN.nl/assets/img/og-image.jpg">
```

## Teksten aanpassen

- Alle teksten staan in `index.html`.
- De tijdlijn (jaren en uitleg) staat bovenaan in `assets/js/main.js`, in de lijst `T`.
- Kleuren staan bovenaan in `assets/css/style.css` (`--accent` is het pastelrood).

## Bestanden

```
index.html            de website
404.html              pagina voor een verkeerde link
favicon.svg           icoon in het tabblad
apple-touch-icon.png  icoon op het beginscherm van een iPhone
robots.txt            toestemming voor zoekmachines
assets/css/style.css  opmaak
assets/js/main.js     menu, tijdlijn, kopieerknoppen
assets/fonts/         lettertypes (Archivo, DM Mono), zelf gehost
assets/img/           foto's (webp + jpg, 3 formaten) en deelafbeelding
```
