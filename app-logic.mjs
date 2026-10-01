const numericFields = ['averageWeight', 'minimumWeight', 'maximumWeight', 'bodyFat', 'calories', 'protein', 'carbs', 'fat', 'completedWorkouts', 'plannedWorkouts', 'steps', 'cardioMinutes', 'sleepHours', 'hunger', 'stress', 'recovery'];

const finiteNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const cleanText = (value) => String(value ?? '').trim();

export function normalizeState(rawState = {}) {
  const state = rawState && typeof rawState === 'object' ? rawState : {};
  return { ...state, checkIns: Array.isArray(state.checkIns) ? state.checkIns : [] };
}

export function normalizeCheckIn(input = {}) {
  const result = {
    weekKey: cleanText(input.weekKey),
    performance: cleanText(input.performance),
    cardioType: cleanText(input.cardioType),
    notes: cleanText(input.notes),
    symptoms: cleanText(input.symptoms),
    savedAt: input.savedAt || new Date().toISOString(),
  };
  numericFields.forEach((field) => { result[field] = finiteNumber(input[field]); });
  return result;
}

export function upsertCheckIn(checkIns = [], checkIn) {
  const normalized = normalizeCheckIn(checkIn);
  const next = [...checkIns.filter((item) => item.weekKey !== normalized.weekKey), normalized];
  return next.sort((a, b) => String(b.weekKey).localeCompare(String(a.weekKey)));
}

export function buildWeeklySummary(state, weekKey) {
  const checkIn = (state.checkIns || []).find((item) => item.weekKey === weekKey) || null;
  const weights = (state.weightEntries || []).filter((entry) => entry.weekKey === weekKey && Number.isFinite(Number(entry.weight))).map((entry) => Number(entry.weight));
  const averageWeight = weights.length ? weights.reduce((sum, weight) => sum + weight, 0) / weights.length : checkIn?.averageWeight ?? null;
  return { ...checkIn, weekKey, averageWeight };
}

const formatNumber = (value, digits = 1) => value === null || value === undefined || value === '' ? '—' : Number(value).toLocaleString('it-IT', { maximumFractionDigits: digits });
const formatValue = (value, suffix = '') => value === null || value === undefined || value === '' ? '—' : `${value}${suffix}`;

export function serializeCheckInForShare(summary = {}) {
  return [
    'CHECK-IN IRONLOG',
    `Settimana: ${summary.weekKey || '—'}`,
    `Peso medio 7 giorni: ${formatNumber(summary.averageWeight, 2)} kg`,
    `Body fat: ${formatNumber(summary.bodyFat, 1)} %`,
    `Calorie medie: ${formatValue(summary.calories, ' kcal')}`,
    `Proteine: ${formatValue(summary.protein, ' g')}`,
    `Carboidrati: ${formatValue(summary.carbs, ' g')}`,
    `Grassi: ${formatValue(summary.fat, ' g')}`,
    `Allenamenti: ${formatValue(summary.completedWorkouts)} / ${formatValue(summary.plannedWorkouts)}`,
    `Passi medi: ${formatNumber(summary.steps, 0)}`,
    `Cardio: ${formatValue(summary.cardioMinutes, ' min')}${summary.cardioType ? ` (${summary.cardioType})` : ''}`,
    `Sonno: ${formatNumber(summary.sleepHours, 1)} h`,
    `Fame: ${formatValue(summary.hunger)}/5`,
    `Stress: ${formatValue(summary.stress)}/5`,
    `Recupero: ${formatValue(summary.recovery)}/5`,
    `Performance: ${summary.performance || '—'}`,
    `Sintomi/dolori: ${summary.symptoms || '—'}`,
    `Note: ${summary.notes || '—'}`,
  ].join('\n');
}

export function validateCheckIn(input = {}) {
  const errors = {};
  const ranges = {
    averageWeight: [20, 400], minimumWeight: [20, 400], maximumWeight: [20, 400], bodyFat: [1, 60], calories: [0, 10000],
    protein: [0, 500], carbs: [0, 1500], fat: [0, 500], completedWorkouts: [0, 14], plannedWorkouts: [0, 14], steps: [0, 100000],
    cardioMinutes: [0, 2000], sleepHours: [0, 24], hunger: [1, 5], stress: [1, 5], recovery: [1, 5],
  };
  Object.entries(ranges).forEach(([field, [min, max]]) => {
    const value = finiteNumber(input[field]);
    if (value !== null && (value < min || value > max)) errors[field] = `Valore non valido: inserisci un numero tra ${min} e ${max}.`;
  });
  if (!cleanText(input.weekKey)) errors.weekKey = 'Seleziona la settimana.';
  return errors;
}
