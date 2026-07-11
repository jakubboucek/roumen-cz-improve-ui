# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Jazyková pravidla

- **Komunikace s uživatelem a tento soubor: česky.**
- **Vše code-related anglicky:** kód, názvy proměnných, komentáře v kódu, commit messages.
- Pozn.: UI texty rozšíření (popup, tooltip) jsou česky, protože cílový web (rouming.cz) je český.

## O projektu

Chrome rozšíření **„Rouming.cz improve UI"** – content script vylepšující UX webů www.rouming.cz a www.roumenovomaso.cz (klávesové zkratky, škálování obrázků, deobfuskace odkazů, přeskakování nepopulárních obrázků, mute videí v GIFníku…). Žádný build systém, žádné závislosti, žádné testy – čistý vanilla JS nasazovaný přímo.

Manifest je **v2** (`manifest.json`), používá `chrome.storage.sync` a `chrome.extension.getURL()`.

## Struktura

- `manifest.json` – definice rozšíření; content script se spouští `document_end` na obou doménách
- `roumen.js` – celá logika content scriptu (jediný soubor)
- `roumen.css` – styly content scriptu (třídy `scaled`, `scaledRouming`, `floatPanel`, `showSidebar`, `activated`)
- `popup.html` + `popup.js` – popup s nastavením (checkboxy → `chrome.storage.sync`)
- `origin/` – **není součástí rozšíření**; originální skripty určené k nasazení přímo na Rouming (po dohodě s Roumenem). Když Roumen funkcionalitu nasadí na web, odpovídající kód v rozšíření se odstraní/zakomentuje (viz git historie: gifnik volume, key shortcuts)
- `deploy.sh` – vytvoří `dist/release.zip` pro Chrome Web Store (vynechává dotfiles, `*.sh`, `*.md`; `origin/` a `dist/` vynechá implicitně, protože balí jen soubory v rootu)

## Architektura roumen.js

Jeden content script, který podle URL (regex na `location.href`) větví chování pro jednotlivé stránky webu:

- `roumingShow.php` / `masoShow.php` – detail obrázku: přesměrování kliknutí na starší obrázek, scale-to-screen, prefetch dalšího obrázku, přeskakování disliked obrázků
- `roumingGIF.php` / `masoGIF.php` – GIFník: save/mute handlery pro video/gif
- `roumingLinks.php` – odkazník: `target="_blank"` + `noopener`
- `roumingVideo.php` – kopírování ovládacích prvků mezi panely

Průřezové mechanismy:

- **Selektory cílí na DOM webu Rouming** – prvky se hledají přes `title` atributy českých tooltipů (např. `a[title="Starší obrázek"]`). Křehké vůči změnám webu; při úpravách zachovat přesné znění titulků.
- **Klávesové zkratky** – jediný globální `arrowHandler` na `keydown` (capture): šipky/`J`/`K` navigace, `L` like, `R` random, `P` expand, `M` mute, `S` save. Akce zkratek fungují „nakliknutím" příslušného tlačítka na stránce (`button.click()`).
- **Handlery `scaleHandler`/`muteHandler`/`saveHandler`** jsou globální proměnné nastavované podle typu stránky; zkratka se aktivuje jen tam, kde byl handler nastaven.
- **Nastavení** – async getter `getOption(key)` nad `chrome.storage.sync` (výchozí hodnoty definované v `roumen.js`); změny se propagují živě přes `chrome.storage.onChanged`.
- **Skip disliked** – parametr `_ruia=next` (Rouming Ui Improve Action) v URL označuje automatickou navigaci; obrázek se záporným ratingem (like + dislike < 0) se přeskočí na další.

## Release

1. Zvýšit `version` v `manifest.json` (commit `Version X.Y.Z`)
2. `./deploy.sh` → `dist/release.zip`
3. Ručně nahrát do Chrome Web Store
