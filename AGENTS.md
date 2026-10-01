# Ironlog — indice operativo del workspace

Questo file è l'indice principale per chi lavora sul progetto. Prima di modificare o creare file, leggere questo documento e seguire i riferimenti indicati.

## Regole del workspace

- La root del progetto è `/Users/michelepinotti/Documents/Codex/2026-08-20/sei-x20/outputs/ironlog`.
- Tutti i file persistenti creati o modificati devono rimanere dentro questa cartella.
- Non creare copie, export o documenti di lavoro in altre cartelle del computer.
- I file temporanei devono essere eliminati al termine dell'operazione.
- Non includere dati personali o dati di allenamento in servizi online senza autorizzazione esplicita.

## Struttura principale

- `index.html` — shell della webapp.
- `app.js` — logica, stato locale, schede, logbook e visualizzazioni.
- `style.css` — stile responsive mobile-first.
- `README.md` — istruzioni d'uso e note di distribuzione.
- `docs/coach-evidence-base.md` — bibliografia scientifica e criteri per allenamento/alimentazione.
- `tests/checkin-logic.test.js` — test di migrazione, normalizzazione e export del check-in.
- `app-logic.mjs` — funzioni pure per schema locale, check-in e riepilogo condivisibile.

## Dati dell'utente

- I dati del logbook devono restare local-first sul dispositivo.
- Il deploy non deve cancellare dati esistenti.
- Ogni modifica allo schema dei dati deve prevedere una migrazione compatibile.
- Mantenere export/import JSON come rete di sicurezza.
- Non aggiungere sincronizzazione cloud o raccolta remota senza richiesta esplicita.

## Profilo di riferimento attuale

- Età: 23 anni.
- Altezza: 178 cm.
- Peso minimo recente: 78,75 kg.
- Peso attuale dichiarato: 79,35 kg.
- Body fat dichiarata: 13,4%.
- BMR indicativo: circa 1.855 kcal.
- Allenamento: bodybuilding intermedio; 4 sessioni/settimana, passaggio a 5 sessioni previsto.
- Obiettivo: risalita calorica controllata, poi bulk con aumento della massa magra; cut previsto da marzo 2027 per arrivare in forma a giugno/luglio 2027.

## Repository

- Remote GitHub: `https://github.com/Michele-Pnt/ironlog-michele-2026.git`
- Branch principale remota: `main`.
- Deploy: GitHub Pages con workflow automatico `.github/workflows/deploy.yml` su push a `main`.

## Criteri di lavoro

- Usare la bibliografia in `docs/coach-evidence-base.md` come base; includere solo fonti pubblicate dal 2021-01-01 in poi.
- Distinguere sempre tra evidenza diretta, inferenza pratica e decisione individuale.
- Per nutrizione e allenamento usare trend e feedback, non un singolo dato isolato.
- Prima di modifiche architetturali o di deploy, proporre il design e attendere approvazione.
