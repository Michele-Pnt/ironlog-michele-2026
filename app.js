import { normalizeState, normalizeCheckIn, upsertCheckIn, buildWeeklySummary, serializeCheckInForShare, validateCheckIn } from './app-logic.mjs';

const STORAGE_KEY = 'ironlog-local-v1';

const makeSetLog = (date, workoutId, exerciseId, setIndex, weight, reps) => ({
  date, workoutId, exerciseId, setIndex, weight: Number(weight), reps: Number(reps), updatedAt: Date.now(),
});

function previousSet(logs, workoutId, exerciseId, setIndex, beforeDate) {
  const latest = logs
    .filter((log) => log.workoutId === workoutId && log.exerciseId === exerciseId && log.setIndex === setIndex && log.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt)[0];
  return latest ? { weight: latest.weight, reps: latest.reps } : null;
}

function chartPoints(logs, exerciseId) {
  const byDate = new Map();
  logs.filter((log) => log.exerciseId === exerciseId && log.weight > 0 && log.reps > 0).forEach((log) => {
    const current = byDate.get(log.date);
    if (!current || log.weight > current.weight || (log.weight === current.weight && log.reps > current.reps)) byDate.set(log.date, log);
  });
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).map(({ date, weight, reps }) => ({ date, weight, reps }));
}

const nutritionCut = {
  phase: 'Cut', trainingCalories: '1.850-1.950 kcal', restCalories: '1.750-1.850 kcal', protein: '165-175 g', fat: '55-70 g',
  meals: [
    { name: 'Colazione', base: '220 g albume + 1 uovo intero + 40 g avena + 1 frutto', alt: '60 g pane oppure 4-5 fette biscottate. Frutto: mela, pera, pesca, arancia, kiwi o ~150 g frutti di bosco.' },
    { name: 'Pranzo', base: '70 g riso + 180 g merluzzo + verdure + 10 g olio EVO', alt: '70 g pasta/cous cous oppure ~280 g patate. 160-180 g pollo/tacchino oppure 180-200 g pesce magro.' },
    { name: 'Pre-workout', base: '170-200 g yogurt greco 0% + 1 banana + 35 g pane', alt: '170-200 g skyr. Altro frutto. ~30 g cereali/riso soffiato oppure 4-5 gallette.' },
    { name: 'Cena post-workout', base: '200 g pollo + 65 g riso + verdure + 10 g olio EVO', alt: '200 g tacchino, ~220 g pesce magro o 150-170 g carne bovina magra. 65 g pasta oppure ~260 g patate.' },
  ],
  rest: 'Proteine invariata; pranzo 55-60 g riso, cena 45-50 g riso. Verdure, proteine e grassi restano presenti.',
  timing: 'Allenamento serale: pre-workout 2-3 ore prima e cena dopo. Allenamento mattutino: sposta parte dei carboidrati verso colazione/pre-workout e pranzo/post-workout.',
  adjustment: 'Mantieni la base per 10-14 giorni e guarda la media peso di 7 giorni. Target: -0,2/-0,4 kg a settimana. Se fermo per 10-14 giorni: -100 kcal/die o più attività. Se il calo è troppo rapido e peggiorano recupero/performance: +100-150 kcal/die.',
};

globalThis.IronlogLogic = { makeSetLog, previousSet, chartPoints, nutritionCut, normalizeState, normalizeCheckIn, upsertCheckIn, buildWeeklySummary, serializeCheckInForShare, validateCheckIn };

const uid = () => `x${Math.random().toString(36).slice(2, 9)}`;
const ex = (name, sets, reps, rest, method = 'Classico', note = '') => ({ id: uid(), name, sets, reps, rest, method, note });
const pair = (name, left, right, sets, reps, rest, note = '') => ({ id: uid(), name, sets, reps, rest, method: 'Superset', note, pair: [left, right] });

const cutTrainingProgram = () => ({
  id: 'cut-4-split', name: 'Cut - 4 Split', duration: 'Fase attuale', workouts: [
    { id: 'A', title: 'Upper - Panca + Dorso', warmup: 'Riscaldamento e avvicinamento progressivo ai fondamentali', exercises: [
      ex('Panca Piana Bilanciere', 3, '5-7 + 6-8', '2′30″-4′', 'Top set + Back off', 'Top set RIR 1 + 2 back-off RIR 1-2'), ex('Rematore', 3, '6-8 + 8-10', '2′30″-4′', 'Top set + Back off', 'Progressive overload'), ex('Distensioni Manubri Inclinata', 2, '8-12', '90″-2′'), ex('Iliac Pulldown Unilaterale', 2, '10-15', '90″', 'Classico', 'Controllo e allungamento'), ex('Alzate Laterali Cavo', 3, '12-20', '60″-90″', 'Cluster', 'Cluster opzionale'), ex('Curl Scott', 2, '8-12', '60″-90″'), ex('Hammer Curl / Cavo', 2, '12-15', '60″-90″'),
    ] },
    { id: 'B', title: 'Lower - Quadricipiti', warmup: 'Riscaldamento anche, ginocchia e serie di avvicinamento', exercises: [
      ex('Leg Extension', 3, '10-15', '60″-90″', 'Classico', 'Ultima serie RIR 0-1'), ex('Hip Belt Squat', 3, '8-10 + 10-12', '2′30″-4′', 'Top set + Back off'), ex('Leg Press 45°', 2, '10-12 + 12-15', '90″-2′', 'Top set + Back off'), ex('Sissy Squat', 2, '15-20', '60″-90″', 'Classico', 'Controllo'), ex('Leg Curl Seduto', 3, '8-12', '60″-90″', 'Classico', 'Progressione'), ex('Calf Raise', 4, '8-12', '60″-90″', 'Classico', 'Pausa e ROM completo'), ex('Crunch Cavo', 3, '12-20', '60″-90″', 'Classico', 'Progressione'),
    ] },
    { id: 'C', title: 'Upper - Trazioni + Dip', warmup: 'Riscaldamento spalle/scapole e serie di avvicinamento', exercises: [
      ex('Trazioni', 3, '5-8', '2′30″-4′', 'Classico', 'RIR 1-2; zavorra dopo 8/8/8 pulite'), ex('Dip', 3, '6-8 + 8-10', '2′30″-4′', 'Top set + Back off', 'Zavorra se necessaria'), ex('Chest-Supported Row / Dorsy Bar', 2, '8-12', '90″-2′'), ex('Lento Smith', 2, '8-10', '90″-2′', 'Classico', 'RIR 1-2'), ex('Alzate Laterali', 3, '12-20', '60″-90″', 'Cluster', 'Cluster opzionale'), ex('Reverse Cross', 2, '15-20', '60″-90″'), ex('French Press Cavo', 3, '10-15', '60″-90″'),
    ] },
    { id: 'D', title: 'Lower Femorali + Richiamo Upper', warmup: 'Riscaldamento anche, femorali e serie di avvicinamento', exercises: [
      ex('Romanian Deadlift', 3, '6-8 + 8-10', '2′30″-4′', 'Top set + Back off'), ex('Leg Curl Seduto', 3, '8-12', '60″-90″', 'Cluster', 'Cluster opzionale in blocchi futuri'), ex('Bulgarian Split Squat / Pressa', 2, '8-12', '90″-2′'), ex('Calf', 3, '10-15', '60″-90″'), ex('Panca Piana Tecnica', 3, '6-8', '2′30″-4′', 'Classico', 'RIR ~3'), ex('Pulley / Low Row', 2, '10-15', '90″-2′'), pair('Bicipiti + Tricipiti', 'Bicipiti', 'Tricipiti', 2, '10-15 ciascuno', '60″-90″', 'Superset opzionale'),
    ] },
  ],
});
globalThis.IronlogLogic.cutTrainingProgram = cutTrainingProgram();

const initialProgram = () => ({
  id: 'mesociclo-2', name: '2° Mesociclo - 5 Split', duration: '10-12 settimane', workouts: [
    { id: 'A', title: 'Pettorali, Spalle e Braccia', warmup: '10′: tapis roulant, mobilità bacino/ginocchia, foam roller', exercises: [
      ex('Distensioni Manubri Panca 45°', 3, '10', '90″', 'Classico', 'RIR 1 · TUT controllato'),
      ex('Distensioni Smith Machine Panca 30°', 3, '10', '2-3′', 'Top set + Back off -20%', 'Set 1-2 avvicinamento; settimane alterne tecnica intensità'),
      ex('Dip Focus Pettorali', 3, 'Max', '45″'), ex('Lento Avanti 2 Manubri Panca 60/75°', 3, '8', '90″', 'Classico', 'RIR 1-2'),
      ex('Alzate Laterali Manubri', 4, '10-15', '1′', 'Ramping', 'Solo ultimo set a cedimento'), ex('Alzate Unilaterali Cavo Basso Dietro Schiena', 2, '15', '1′'),
      ex('Curl Bilanciere Presa Medio Larga', 3, '8-10', '75″'), ex('Curl Scott Machine', 3, '10-15', '1′'), ex('Estensioni Cavo Alto Vulken', 2, '15', '1′'), ex('Sit Up Panca Romana', 4, '25', '30″', 'Classico', 'Piccolo sovraccarico'),
    ] },
    { id: 'B', title: 'Gambe - Focus Quadricipiti', warmup: '10′: tapis roulant e mobilità con bastone/elastico', exercises: [
      ex('Leg Extension', 4, '12', '90″', 'Ramping', 'Solo ultimo set a cedimento'), ex('Hack/Belt Squat', 4, '6-8', '2′', 'Classico', 'RIR 1'), ex('Leg Press 45°', 3, '12-15', '75″'),
      ex('Bulgarian Split Squat', 3, '10-12', '2-3′', 'Top set + Back off -20%', 'Step per ROM; settimane alterne intensità'), ex('Leg Curl Seduto', 3, '12-15', '1′'), ex('Abduttori alla Macchina', 3, '10-15', '1′'), ex('Hip Thruster Bilanciere o Macchina', 3, '10', '90″', 'Ramping', 'RIR 1-2'), ex('Standing Calf', 3, '25', '5″ pause'), ex('Crunch al Cavo Alto', 5, '20', '30″'),
    ] },
    { id: 'C', title: 'Dorsali e Braccia', warmup: '10′: tapis roulant e mobilità spalle/scapole/tronco', exercises: [
      ex('Pectoral Inversa', 4, '15', '1′'), ex('Rematore Manubrio', 3, '10', '2′', 'Ramping'), ex('Lat Machine Presa Larga Busto Flesso', 4, '12RM', '75″'), ex('Row Machine Presa Neutra Petto in Appoggio', 2, '12-15', '1′'), ex('French Press 2 Manubri Panca 30°', 3, '12', '90″', 'Ramping'), ex('Press Down Vulken', 4, '8-12', '20″', 'Cluster'), pair('Bayesian Curl + Curl Unilaterale', 'Bayesian Curl Unilaterale', 'Curl Unilaterale', 2, '10-12 + Max', '1′', 'Prima un braccio poi l’altro'), pair('Crunch Gambe 90° + Leg Raises', 'Crunch Gambe 90°', 'Leg Raises Parallele', 3, '30 + 15', '—'),
    ] },
    { id: 'D', title: 'Spalle e Braccia Metabolico', warmup: '10′: tapis roulant e mobilità spalle/scapole/tronco', exercises: [
      ex('Alzate Laterali Manubri', 4, '15', '1′'), ex('Alzate Laterali Macchina o Delt Machine', 3, '8-12', '1′'), ex('Alzate Y Cavo Altezza Ginocchio Unilaterale', 3, '15', '30-45″'), ex('Shoulder Press o Smith Machine', 3, '10', '2-3′', 'Top set + Back off -20%', '1-2 serie avvicinamento'), pair('Curl Alternato + Push Down Corde', 'Curl Manubri Alternato in Piedi', 'Push Down Corde', 3, '12', '75″'), pair('Hammer Curl + Estensioni Cavo Alto', 'Hammer Curl Manubri Diagonale', 'Estensioni Cavo Alto', 3, '12', '75″'), pair('Curl Cavo Alto + Dip tra Panche', 'Curl Cavo Alto Panca 45°', 'Dip Tra 2 Panche', 2, 'Max', '1′'), ex('Crunch Fit Ball', 5, 'Max', '30″'),
    ] },
    { id: 'E', title: 'Gambe - Femorali + Richiamo', warmup: '10′: tapis roulant e mobilità bacino/ginocchia/scapole/tronco', exercises: [
      ex('Stacchi Rumeni Bilanciere', 3, '8', '90″', 'Classico', 'RIR 2'), ex('Leg Curl In Piedi', 3, '15', '1′'), ex('Leg Curl Prono', 2, '15-20', '1′'), ex('Leg Extension / Sissy Squat / Affondi Camminati', 5, 'A scelta', 'Variabile', 'Metabolico', 'Scegli in base al pump'), ex('Dorsy Bar o Rematore 2 Manubri', 4, '12RM', '1′'), pair('Chest Press Alta + Alzate Frontali', 'Chest Press Alta Convergente', 'Alzate Frontali Convergenti 2 KB', 3, '10 + 12-15', '1′'), ex('Alzate Unilaterali Cavo Basso Dietro Schiena', 3, '12-15', 'Senza sosta'), ex('Crunch Chiusura Libretto', 4, '25', '30″'),
    ] },
  ],
});

const defaultState = () => ({ programs: [cutTrainingProgram()], activeProgramId: 'cut-4-split', activeWorkoutId: 'A', selectedDate: new Date().toISOString().slice(0, 10), logs: [], checkIns: [], view: 'train', cut4MigrationDone: true });
let state;
try { state = normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState()); } catch { state = defaultState(); }
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
if (!state.cut4MigrationDone) {
  const oldIndex = state.programs.findIndex((program) => program.id === 'mesociclo-2');
  const hasOldLogs = state.logs.length > 0;
  if (oldIndex >= 0 && hasOldLogs) state.programs[oldIndex].name = 'Archivio - 2° Mesociclo 5 Split';
  if (oldIndex >= 0 && !hasOldLogs) state.programs.splice(oldIndex, 1);
  state.programs.unshift(cutTrainingProgram()); state.activeProgramId = 'cut-4-split'; state.activeWorkoutId = 'A'; state.cut4MigrationDone = true; save();
}
const activeProgram = () => state.programs.find((p) => p.id === state.activeProgramId) ?? state.programs[0];
const activeWorkout = () => activeProgram().workouts.find((w) => w.id === state.activeWorkoutId) ?? activeProgram().workouts[0];
const $ = (sel) => document.querySelector(sel);
const esc = (v = '') => String(v).replace(/[&<>'"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]);

function sessionLog(exerciseId, setIndex) { return state.logs.find((l) => l.date === state.selectedDate && l.workoutId === activeWorkout().id && l.exerciseId === exerciseId && l.setIndex === setIndex); }
function updateLog(exerciseId, setIndex, field, value) {
  const existing = sessionLog(exerciseId, setIndex);
  const item = existing ?? makeSetLog(state.selectedDate, activeWorkout().id, exerciseId, setIndex, '', '');
  item[field] = Number(value || 0); item.updatedAt = Date.now();
  if (!existing) state.logs.push(item); save(); renderTrain();
}

function renderTrain() {
  const workout = activeWorkout();
  const program = activeProgram();
  $('#content').innerHTML = `<section class="workout-head"><div><p class="eyebrow">${esc(program.name)}</p><h1><span>${workout.id}</span>${esc(workout.title)}</h1></div>
    <div style="display: flex; gap: 10px;">
      <label class="select-label">Scheda
        <select id="workout-select">
          ${program.workouts.map(w => `<option value="${w.id}" ${w.id === state.activeWorkoutId ? 'selected' : ''}>${w.id}</option>`).join('')}
        </select>
      </label>
      <label class="date-label">Data<input id="session-date" type="date" value="${state.selectedDate}"></label>
    </div>
    </section>
    <p class="warmup">◎ ${esc(workout.warmup)}</p><div class="tip">Ogni campo mostra in trasparenza la serie dell’ultimo allenamento. Tocca “Riprendi” per copiarla tutta e correggere solo ciò che cambia.</div>
    <div class="exercise-list">${workout.exercises.map((exercise, idx) => exerciseCard(exercise, idx)).join('')}</div>`;
  
  $('#workout-select').onchange = (e) => { state.activeWorkoutId = e.target.value; save(); renderTrain(); };
  $('#session-date').onchange = (e) => { state.selectedDate = e.target.value; save(); renderTrain(); };
  document.querySelectorAll('[data-copy]').forEach((button) => button.onclick = () => copyPrevious(button.dataset.copy));
  document.querySelectorAll('[data-log]').forEach((input) => input.onchange = () => updateLog(input.dataset.ex, Number(input.dataset.set), input.dataset.log, input.value));
}

function exerciseCard(exercise, index) {
  const rows = [...Array(Number(exercise.sets) || 1)].map((_, setIndex) => {
    const current = sessionLog(exercise.id, setIndex); const previous = previousSet(state.logs, activeWorkout().id, exercise.id, setIndex, state.selectedDate);
    const ghost = previous ? `${previous.weight || '—'} kg × ${previous.reps || '—'}` : 'nessun dato';
    return `<div class="set-row"><b>${setIndex + 1}</b><label><span>kg</span><input inputmode="decimal" type="number" min="0" step="0.5" value="${current?.weight || ''}" placeholder="${previous?.weight ?? '—'}" data-log="weight" data-ex="${exercise.id}" data-set="${setIndex}" aria-label="Peso serie ${setIndex + 1}"></label><label><span>rep</span><input inputmode="numeric" type="number" min="0" step="1" value="${current?.reps || ''}" placeholder="${previous?.reps ?? '—'}" data-log="reps" data-ex="${exercise.id}" data-set="${setIndex}" aria-label="Ripetizioni serie ${setIndex + 1}"></label><small class="ghost">prec. ${ghost}</small></div>`;
  }).join('');
  return `<article class="exercise-card"><header><div><p class="exercise-number">${String(index + 1).padStart(2, '0')}</p><h2>${esc(exercise.name)}</h2>${exercise.pair ? `<p class="pair">${esc(exercise.pair.join(' + '))}</p>` : ''}</div><button class="copy" data-copy="${exercise.id}" title="Copia la prestazione precedente">Riprendi</button></header><div class="badges"><span>${esc(exercise.method)}</span><span>${exercise.sets} × ${esc(exercise.reps)}</span><span>rec. ${esc(exercise.rest)}</span></div>${exercise.note ? `<p class="note">${esc(exercise.note)}</p>` : ''}<div class="sets">${rows}</div></article>`;
}

function copyPrevious(exerciseId) {
  const exercise = activeWorkout().exercises.find((e) => e.id === exerciseId);
  [...Array(Number(exercise.sets) || 1)].forEach((_, setIndex) => {
    const prior = previousSet(state.logs, activeWorkout().id, exerciseId, setIndex, state.selectedDate);
    if (!prior) return;
    const existing = sessionLog(exerciseId, setIndex); const target = existing ?? makeSetLog(state.selectedDate, activeWorkout().id, exerciseId, setIndex, prior.weight, prior.reps);
    target.weight = prior.weight; target.reps = prior.reps; target.updatedAt = Date.now(); if (!existing) state.logs.push(target);
  }); save(); renderTrain();
}

function renderProgress() {
  const allExercises = activeProgram().workouts.flatMap((w) => w.exercises.map((e) => ({ ...e, workout: w })));
  const selected = $('#progress-exercise')?.value || allExercises[0]?.id;
  const exercise = allExercises.find((e) => e.id === selected) || allExercises[0]; const points = chartPoints(state.logs, exercise?.id);
  $('#content').innerHTML = `<section class="page-head"><p class="eyebrow">LOGBOOK</p><h1>Progressione carichi</h1><p>Il grafico usa la miglior serie completata in ciascuna sessione.</p></section><label class="select-label">Esercizio<select id="progress-exercise">${allExercises.map((e) => `<option value="${e.id}" ${e.id === exercise?.id ? 'selected' : ''}>${esc(e.workout.id)} · ${esc(e.name)}</option>`).join('')}</select></label><section class="chart-card">${drawChart(points)}<div class="chart-table">${points.length ? points.map((p) => `<div><span>${new Date(`${p.date}T12:00`).toLocaleDateString('it-IT', { day:'2-digit', month:'short' })}</span><b>${p.weight} kg</b><em>× ${p.reps}</em></div>`).join('') : '<p>Nessuna serie registrata: inizia dal tab Allenati.</p>'}</div></section>`;
  $('#progress-exercise').onchange = renderProgress;
}

function renderNutrition() {
  $('#content').innerHTML = `<section class="page-head nutrition-head"><p class="eyebrow">ALIMENTAZIONE</p><h1>Fase ${nutritionCut.phase}</h1><p>Base operativa: pesi di riso, pasta, avena e cous cous a crudo salvo diversa indicazione.</p></section><section class="macro-strip"><div><b>${nutritionCut.trainingCalories}</b><span>Training day</span></div><div><b>${nutritionCut.restCalories}</b><span>Rest day</span></div><div><b>${nutritionCut.protein}</b><span>Proteine</span></div><div><b>${nutritionCut.fat}</b><span>Grassi</span></div></section><p class="nutrition-rule">I carboidrati occupano la quota restante e sono concentrati vicino all’allenamento.</p><section class="meal-list"><h2>Training day</h2>${nutritionCut.meals.map((meal, i) => `<article class="meal-card"><p class="meal-index">${String(i + 1).padStart(2, '0')}</p><h3>${meal.name}</h3><p class="meal-base">${meal.base}</p><details><summary>Alternative</summary><p>${meal.alt}</p></details></article>`).join('')}</section><section class="food-note"><h2>Rest day</h2><p>${nutritionCut.rest}</p></section><section class="food-note"><h2>Timing allenamento</h2><p>${nutritionCut.timing}</p></section><section class="food-note accent"><h2>Quando modificare</h2><p>${nutritionCut.adjustment}</p></section><p class="disclaimer">Indicazioni informative: per patologie, sintomi, disturbi gastrointestinali o altri problemi di salute, confrontati con un professionista sanitario abilitato.</p>`;
}

function drawChart(points) {
  if (!points.length) return '<div class="empty-chart">Il tuo primo punto apparirà qui.</div>';
  const width = 340, height = 190, pad = 28; const values = points.map((p) => p.weight); const min = Math.min(...values) - 2.5, max = Math.max(...values) + 2.5; const span = max - min || 1;
  const coords = points.map((p, i) => ({ x: pad + i * ((width - pad * 2) / Math.max(points.length - 1, 1)), y: height - pad - ((p.weight - min) / span) * (height - pad * 2), ...p }));
  return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img" aria-label="Grafico peso"><line x1="${pad}" x2="${width-pad}" y1="${height-pad}" y2="${height-pad}"/><path d="M ${coords.map((p) => `${p.x},${p.y}`).join(' L ')}"/><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#FF804A"/><stop offset="1" stop-color="#FFD06E"/></linearGradient></defs>${coords.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="5"><title>${p.date}: ${p.weight} kg × ${p.reps}</title></circle><text x="${p.x}" y="${p.y - 12}">${p.weight}</text>`).join('')}</svg>`;
}

function isoWeekKey(date = new Date()) {
  const day = new Date(date); day.setHours(0, 0, 0, 0); day.setDate(day.getDate() + 4 - (day.getDay() || 7));
  const yearStart = new Date(day.getFullYear(), 0, 1); const week = Math.ceil((((day - yearStart) / 86400000) + 1) / 7);
  return `${day.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const checkinFields = [
  ['averageWeight', 'Peso medio 7 giorni', 'number', '0.01', 'kg'], ['minimumWeight', 'Peso minimo', 'number', '0.01', 'kg'], ['maximumWeight', 'Peso massimo', 'number', '0.01', 'kg'], ['bodyFat', 'Body fat', 'number', '0.1', '%'],
  ['calories', 'Calorie medie', 'number', '1', 'kcal'], ['protein', 'Proteine medie', 'number', '1', 'g'], ['carbs', 'Carboidrati medi', 'number', '1', 'g'], ['fat', 'Grassi medi', 'number', '1', 'g'],
  ['completedWorkouts', 'Allenamenti completati', 'number', '1', ''], ['plannedWorkouts', 'Allenamenti previsti', 'number', '1', ''], ['steps', 'Passi medi', 'number', '1', ''], ['cardioMinutes', 'Cardio', 'number', '1', 'min'], ['sleepHours', 'Sonno medio', 'number', '0.1', 'h'],
];

function inputField([name, label, type, step, suffix], value = '') {
  return `<label class="checkin-field"><span>${label}${suffix ? ` <em>${suffix}</em>` : ''}</span><input name="${name}" type="${type}" inputmode="decimal" step="${step}" min="0" value="${value ?? ''}"></label>`;
}

function selectField(name, label, options, value = '') {
  return `<label class="checkin-field"><span>${label}</span><select name="${name}"><option value="">—</option>${options.map(([key, text]) => `<option value="${key}" ${String(key) === String(value) ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
}

function renderCheckin() {
  const weekKey = $('#checkin-week')?.value || isoWeekKey(); const existing = state.checkIns.find((item) => item.weekKey === weekKey) || {};
  $('#content').innerHTML = `<section class="page-head checkin-head"><p class="eyebrow">MONITORAGGIO</p><h1>Check-in settimanale</h1><p>Compilalo una volta a settimana: il riepilogo è pronto da copiare in chat.</p></section>
    <form id="checkin-form" class="checkin-card"><div class="checkin-toolbar"><label class="select-label">Settimana<input id="checkin-week" name="weekKey" type="week" value="${esc(weekKey)}"></label><span class="checkin-hint">Dati locali</span></div>
    <h2>Trend corporeo</h2><div class="checkin-grid">${checkinFields.map((field) => inputField(field, existing[field[0]])).join('')}</div>
    <h2>Attività e recupero</h2><div class="checkin-grid">${inputField(['cardioType', 'Tipo cardio', 'text', '1', ''])}${selectField('performance', 'Performance', [['peggiorata', 'Peggiorata'], ['stabile', 'Stabile'], ['migliorata', 'Migliorata']], existing.performance)}${selectField('hunger', 'Fame', [['1', '1 — bassa'], ['2', '2'], ['3', '3 — media'], ['4', '4'], ['5', '5 — alta']], existing.hunger)}${selectField('stress', 'Stress', [['1', '1 — basso'], ['2', '2'], ['3', '3 — medio'], ['4', '4'], ['5', '5 — alto']], existing.stress)}${selectField('recovery', 'Recupero', [['1', '1 — scarso'], ['2', '2'], ['3', '3 — medio'], ['4', '4'], ['5', '5 — ottimo']], existing.recovery)}</div>
    <label class="checkin-wide"><span>Sintomi, dolori o segnali da segnalare</span><textarea name="symptoms" rows="2">${esc(existing.symptoms || '')}</textarea></label><label class="checkin-wide"><span>Note della settimana</span><textarea name="notes" rows="3">${esc(existing.notes || '')}</textarea></label><p id="checkin-error" class="form-error" role="alert"></p><button class="primary checkin-save" type="button">Salva check-in</button></form>
    <section class="checkin-actions"><button class="primary" id="share-checkin">Condividi su iPhone</button><button class="secondary" id="copy-checkin">Copia testo</button><button class="secondary" id="download-checkin">Scarica .txt</button><button class="secondary" id="export-full-backup">Esporta backup completo</button></section>
    <section class="checkin-history"><h2>Storico recente</h2>${state.checkIns.slice(0, 8).map((item) => `<button class="history-row" data-week="${esc(item.weekKey)}"><b>${esc(item.weekKey)}</b><span>${item.averageWeight ?? '—'} kg</span><span>${item.bodyFat ?? '—'}%</span><span>${item.calories ?? '—'} kcal</span></button>`).join('') || '<p class="muted">Nessun check-in salvato.</p>'}</section>`;
  $('#checkin-week').onchange = renderCheckin;
  $('#checkin-form').onsubmit = (event) => { event.preventDefault(); saveCheckInFromForm(event.currentTarget); };
  $('.checkin-save').onclick = () => saveCheckInFromForm($('#checkin-form'));
  document.querySelectorAll('[data-week]').forEach((button) => button.onclick = () => { $('#checkin-week').value = button.dataset.week; renderCheckin(); });
  $('#share-checkin').onclick = () => exportWeeklyCheckIn(weekKey, 'share'); $('#copy-checkin').onclick = () => exportWeeklyCheckIn(weekKey, 'clipboard'); $('#download-checkin').onclick = () => exportWeeklyCheckIn(weekKey, 'download'); $('#export-full-backup').onclick = exportData;
}

function readCheckInForm(form) { return Object.fromEntries(new FormData(form).entries()); }

function saveCheckInFromForm(form) {
  const error = $('#checkin-error');
  try {
    const input = readCheckInForm(form); const errors = validateCheckIn(input);
    if (Object.keys(errors).length) { error.textContent = Object.values(errors)[0]; return; }
    state.checkIns = upsertCheckIn(state.checkIns, input); save(); renderCheckin();
  } catch (exception) { error.textContent = `Errore salvataggio: ${exception.message}`; }
}

async function exportWeeklyCheckIn(weekKey, mode) {
  const text = serializeCheckInForShare(buildWeeklySummary(state, weekKey));
  if (mode === 'share' && navigator.share) { await navigator.share({ title: 'Ironlog check-in', text }); return; }
  if (mode === 'clipboard' && navigator.clipboard) { await navigator.clipboard.writeText(text); alert('Check-in copiato. Incollalo in chat.'); return; }
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = `ironlog-checkin-${weekKey}.txt`; anchor.click(); URL.revokeObjectURL(anchor.href);
}

function renderManage() {
  const program = activeProgram();
  $('#content').innerHTML = `<section class="page-head"><p class="eyebrow">EDITOR</p><h1>Le tue schede</h1><p>Modifica senza perdere il tuo logbook.</p></section><div class="program-actions"><button class="primary" id="new-program">+ Nuovo programma</button><button class="secondary" id="export-data">Esporta backup</button><label class="secondary import">Importa<input type="file" accept="application/json" id="import-data"></label></div>${program.workouts.map((workout) => `<article class="manage-workout"><header><div><span class="workout-letter">${workout.id}</span><input class="workout-title" data-workout-title="${workout.id}" value="${esc(workout.title)}"></div><button class="add-exercise" data-add-exercise="${workout.id}">+ esercizio</button></header>${workout.exercises.map((e) => `<div class="edit-exercise"><input data-edit="name" data-w="${workout.id}" data-e="${e.id}" value="${esc(e.name)}"><input data-edit="sets" data-w="${workout.id}" data-e="${e.id}" type="number" min="1" value="${e.sets}" aria-label="Serie"><input data-edit="reps" data-w="${workout.id}" data-e="${e.id}" value="${esc(e.reps)}" aria-label="Ripetizioni"><select data-edit="method" data-w="${workout.id}" data-e="${e.id}">${['Classico','Top set + Back off -20%','Ramping','Cluster','Superset','Compound set','Metabolico','Rest pause'].map((m) => `<option ${m === e.method ? 'selected' : ''}>${m}</option>`).join('')}</select><input data-edit="rest" data-w="${workout.id}" data-e="${e.id}" value="${esc(e.rest)}" aria-label="Recupero"><button data-delete="${e.id}" data-w="${workout.id}" aria-label="Elimina ${esc(e.name)}">×</button></div>`).join('')}</article>`).join('')}`;
  $('#new-program').onclick = newProgram; $('#export-data').onclick = exportData; $('#import-data').onchange = importData;
  document.querySelectorAll('[data-edit]').forEach((el) => el.onchange = editExercise);
  document.querySelectorAll('[data-workout-title]').forEach((el) => el.onchange = () => { program.workouts.find((w) => w.id === el.dataset.workoutTitle).title = el.value; save(); });
  document.querySelectorAll('[data-add-exercise]').forEach((el) => el.onclick = () => { const w = program.workouts.find((x) => x.id === el.dataset.addExercise); w.exercises.push(ex('Nuovo esercizio', 3, '10', '1′')); save(); renderManage(); });
  document.querySelectorAll('[data-delete]').forEach((el) => el.onclick = () => { const w = program.workouts.find((x) => x.id === el.dataset.w); w.exercises = w.exercises.filter((x) => x.id !== el.dataset.delete); save(); renderManage(); });
}

function editExercise(e) { const el = e.target; const exercise = activeProgram().workouts.find((w) => w.id === el.dataset.w).exercises.find((x) => x.id === el.dataset.e); exercise[el.dataset.edit] = el.dataset.edit === 'sets' ? Number(el.value) : el.value; save(); }
function newProgram() { const clone = JSON.parse(JSON.stringify(activeProgram())); clone.id = uid(); clone.name = `Nuovo programma ${state.programs.length + 1}`; clone.workouts = clone.workouts.map((w, i) => ({ ...w, id: String.fromCharCode(65 + i), exercises: w.exercises.map((e) => ({ ...e, id: uid() })) })); state.programs.push(clone); state.activeProgramId = clone.id; state.activeWorkoutId = clone.workouts[0].id; save(); renderManage(); }
function exportData() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `ironlog-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href); }
function importData(e) { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { state = JSON.parse(reader.result); save(); render(); } catch { alert('Backup non valido.'); } }; reader.readAsText(file); }
function render() { document.querySelectorAll('[data-nav]').forEach((button) => button.classList.toggle('active', button.dataset.nav === state.view)); if (state.view === 'train') renderTrain(); else if (state.view === 'progress') renderProgress(); else if (state.view === 'nutrition') renderNutrition(); else if (state.view === 'checkin') renderCheckin(); else renderManage(); }
function boot() { document.querySelectorAll('[data-nav]').forEach((button) => button.onclick = () => { state.view = button.dataset.nav; save(); render(); }); render(); }
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', boot);
