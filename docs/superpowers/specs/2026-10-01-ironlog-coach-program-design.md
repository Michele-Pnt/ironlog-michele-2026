# Ironlog — design del programma coach e della webapp

Data: 2026-10-01  
Stato: proposta approvata in chat, in attesa di revisione della specifica scritta

## Obiettivo

Evolvere Ironlog da logbook per una split a 4 giorni a strumento personale per:

- allenamento bodybuilding intermedio su 5 giorni;
- aumento controllato della massa magra fino a marzo 2027;
- gestione nutrizionale per fasi, dalla risalita calorica al bulk;
- monitoraggio di peso, body fat, performance, recupero e volume;
- registrazione dell'allenamento con il minor numero pratico di click.

## Vincoli confermati

- Allenamento: lunedì, martedì, mercoledì, venerdì e sabato.
- Ogni sessione deve restare sotto 90 minuti.
- Attrezzatura completa da palestra.
- Nessun infortunio o limitazione dichiarata.
- Priorità: arti superiori, comprese spalle e braccia.
- Gambe: attualmente bilanciate; non richiedono aumento automatico del volume.
- Fondamentali all'inizio della seduta per forza e progressione.
- Progressione principale: progressive overload.
- Deload quando recupero e performance lo richiedono.
- Cardio contestualizzato alla fase e al trend del peso.
- Passi medi: circa 5.000 al giorno, escluso eventuale cardio.
- Sonno medio: circa 7 ore; stress variabile; recupero attualmente buono.
- Peso misurato quotidianamente; body fat da bilancia smart economica; foto quando disponibili.
- Target dichiarato: almeno +2 kg di massa magra entro marzo 2027, mantenendo body fat circa entro 14–14,5%.
- Alimentazione: 4 pasti, pesi a crudo, due alternative equivalenti per macro, ciclizzazione training/rest.
- Supplementi: nessuno attuale; creatina solo se valutata e compatibile con il quadro sanitario.
- Esami: ALT elevata nei referti di gennaio 2026; l'utente riferisce valutazione medica rassicurante. Non verrà fatta diagnosi dall'app.

## Programma di allenamento

La split iniziale proposta è upper-priority su tre esposizioni e lower su due esposizioni:

### A — Upper forza: panca + rematore

Mantiene la seduta attuale con panca piana e rematore come primi fondamentali. Seguono lavoro per petto, dorso, deltoidi laterali e braccia, con volume contenuto entro il limite di tempo.

### B — Lower quadricipiti

Mantiene leg extension, pressa 45°, lavoro unilaterale, leg curl, polpacci e addome. Il volume parte vicino a quello attuale e non cresce automaticamente nel bulk.

### C — Upper forza: trazioni + dip

Mantiene trazioni e dip come fondamentali. Seguono rematore supportato, petto, deltoidi posteriori/laterali e tricipiti.

### D — Lower femorali

Mantiene RDL, leg curl, pressa o variante unilaterale, affondi se utili, polpacci e addome. Sarà esclusivamente una seduta gambe, senza panca tecnica, pulley o richiamo braccia, così da separare chiaramente il recupero lower da quello upper.

### E — Specializzazione spalle e braccia

Nuova seduta esclusivamente upper dedicata alla carenza dichiarata: deltoidi laterali/posteriori, bicipiti e tricipiti. Potrà contenere lavoro diretto mirato per spalle e braccia e, solo se necessario per il bilanciamento, esercizi upper secondari; non conterrà lavoro per gambe. Non sarà una seduta casuale ad alto volume: avrà un budget di serie e una durata massima.

## Volume e progressione

- Il conteggio principale sarà per serie effettive dirette.
- Le serie indirette verranno conteggiate con criterio prudente per evitare doppio conteggio eccessivo.
- L'aumento calorico non comporterà automaticamente più serie.
- Si aggiungeranno serie solo se il gruppo è prioritario, il recupero è buono, la performance è stabile e il volume attuale non produce progressi sufficienti.
- I fondamentali useranno prevalentemente buffer controllato; il cedimento sarà riservato soprattutto a esercizi stabili e a basso rischio tecnico.
- Le progressioni saranno registrate per carico, ripetizioni e, quando disponibile, RIR/cedimento.
- Il deload sarà guidato da performance, recupero, dolore muscolare persistente e aderenza, non da un calendario rigido.

## Nutrizione fino a marzo 2027

La nutrizione sarà modellata come una sequenza di fasi, non come un unico numero calorico fisso:

1. stabilizzazione post-cut e raccolta del trend;
2. risalita calorica controllata;
3. bulk conservativo con aumento di peso lento;
4. eventuale fase di mantenimento o mini-aggiustamento prima di marzo.

Ogni settimana verranno valutati:

- media peso su 7 giorni;
- variazione rispetto alla settimana precedente;
- body fat e sue tendenze, interpretate con cautela;
- performance e recupero;
- fame, sonno e stress;
- passi e cardio;
- aderenza reale alla dieta.

Le calorie verranno modificate a piccoli incrementi o mantenute in base al trend. Il piano conterrà 4 pasti, pesi a crudo, alternative equivalenti per macro e distinzione training/rest day. Il valore calorico effettivo della dieta attuale dovrà essere verificato prima di fissare il primo incremento, perché le quantità riportate devono essere convertite usando le etichette dei prodotti o valori nutrizionali coerenti.

## Monitoraggio e criteri decisionali

L'app dovrà consentire di registrare:

- peso quotidiano;
- body fat quando disponibile;
- serie, kg e ripetizioni;
- eventuale RIR o cedimento;
- note su sonno, stress e recupero;
- passi e cardio;
- check-in settimanale;
- fase nutrizionale e calorie/macronutrienti correnti.

Regole iniziali:

- non reagire a un singolo peso o a una singola lettura di body fat;
- usare trend di almeno 7 giorni;
- non aumentare calorie e volume nello stesso momento se non necessario;
- modificare una variabile alla volta quando possibile;
- mantenere backup JSON e migrazioni dello schema.

## UX per ridurre i click

La schermata di allenamento dovrà:

- aprire automaticamente la seduta prevista per il giorno;
- mostrare subito l'ultima prestazione per ogni serie;
- offrire "Riprendi tutta la sessione";
- permettere inserimento kg/ripetizioni con avanzamento automatico;
- avere un'azione unica per segnare una serie completata;
- mantenere il focus sul campo successivo;
- offrire selezione rapida per RIR/cedimento;
- mostrare un riepilogo di serie e volume al termine;
- evitare navigazioni o salvataggi manuali superflui.

## Persistenza e deploy

- I dati personali restano locali sul dispositivo.
- La chiave e lo schema dei dati saranno versionati.
- Gli aggiornamenti dovranno migrare lo stato senza cancellare log o programmi.
- L'export/import JSON resterà disponibile.
- GitHub Pages pubblicherà il codice tramite GitHub Actions.
- Nessun cloud sync o invio remoto dei dati senza autorizzazione esplicita.

## Piano di verifica

- Testare che la vecchia struttura dati venga caricata senza perdita.
- Testare logging rapido di una sessione completa.
- Testare selezione automatica del workout per giorno.
- Testare grafici e riepilogo delle serie effettive.
- Testare export/import dopo un aggiornamento.
- Verificare su viewport mobile reale o simulato.
- Verificare che il workflow GitHub Pages pubblichi senza modificare dati locali.

## Questioni da risolvere prima dell'implementazione

1. Confermare i numeri di serie per ogni esercizio dopo la mappatura completa delle immagini, mantenendo D esclusivamente lower ed E esclusivamente upper.
2. Verificare il totale calorico reale della dieta attuale e le marche/etichette principali.
3. Definire se il tracking userà un campo binario cedimento/non cedimento oppure RIR numerico.
4. Definire il primo incremento calorico dopo la settimana di stabilizzazione.
5. Decidere se il piano nutrizionale verrà mostrato come calendario settimanale o come fase con storico modifiche.
