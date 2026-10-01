# Ironlog - uso locale

Web app statica per il logbook del 2° mesociclo. I dati sono salvati solo nel browser/app che la apre; non vengono inviati online.

## Aprire su Mac

Apri `index.html` con un browser moderno. Per cancellare o sostituire i dati usa il backup JSON dal tab **Schede**.

## Trasferire su iPhone senza hosting

Su iPhone Safari non può trasformare con affidabilità un file HTML in una PWA installata dalla cartella File. Per usare questa versione senza hosting serve un visualizzatore HTML locale che tenga aperto il file, ad esempio un’app di tipo “HTML viewer / local web server”. Copia l’intera cartella `ironlog` in File/iCloud Drive, aprila da quel visualizzatore e seleziona `index.html`. Tutti i dati restano sul telefono in quell’app.

Per una vera icona Home che si apre direttamente e conserva i dati nel browser, l’opzione 2 (hosting statico gratuito) è necessaria. Non richiede server né database.
