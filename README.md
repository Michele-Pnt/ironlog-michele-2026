# Ironlog - uso locale

Web app statica per il logbook del 2° mesociclo. I dati sono salvati solo nel browser/app che la apre; non vengono inviati online.

## Aprire su Mac

Apri `index.html` con un browser moderno. Per cancellare o sostituire i dati usa il backup JSON dal tab **Schede**.

## Trasferire su iPhone senza hosting

Su iPhone Safari non può trasformare con affidabilità un file HTML in una PWA installata dalla cartella File. Per usare questa versione senza hosting serve un visualizzatore HTML locale che tenga aperto il file, ad esempio un’app di tipo “HTML viewer / local web server”. Copia l’intera cartella `ironlog` in File/iCloud Drive, aprila da quel visualizzatore e seleziona `index.html`. Tutti i dati restano sul telefono in quell’app.

Per una vera icona Home che si apre direttamente e conserva i dati nel browser, l’opzione 2 (hosting statico gratuito) è necessaria. Non richiede server né database.

## Check-in settimanale e passaggio in chat

Apri il tab **Check-in** e compila i dati della settimana: peso medio, minimo/massimo, body fat, calorie e macro, allenamenti completati, passi, cardio, sonno, fame, stress, recupero, performance ed eventuali sintomi/note.

Premi **Salva check-in**. Viene mantenuto un solo record per settimana e i dati restano nel localStorage del dispositivo. Per inviarmi il riepilogo da iPhone usa **Condividi su iPhone** oppure **Copia testo** e incolla il contenuto in chat. **Scarica .txt** è una riserva leggibile; **Esporta backup completo** salva invece tutto lo stato JSON, compresi log, programmi e check-in.

Il deploy GitHub Pages pubblica soltanto i file dell’app: non contiene né sovrascrive il localStorage del telefono. Prima di cambiare dispositivo o browser, esporta il backup JSON e conservalo in File/iCloud Drive; l’importazione del backup resta disponibile nel tab **Schede**.

La scheda attiva è **Bulk controllato - 5 giorni**: A upper forza panca/dorso, B lower quadricipiti, C upper forza trazioni/dip, D lower femorali, E upper con specializzazione spalle/braccia. La vecchia scheda resta selezionabile nell’editor e i suoi log non vengono cancellati.

## Deploy

Ogni push su `main` avvia il workflow GitHub Pages in `.github/workflows/deploy.yml`. Dopo il primo run, abilita GitHub Pages nelle impostazioni del repository scegliendo **GitHub Actions** come sorgente, se GitHub non lo ha già configurato automaticamente.
