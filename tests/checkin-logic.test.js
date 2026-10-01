import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeState, normalizeCheckIn, upsertCheckIn, serializeCheckInForShare } from '../app-logic.mjs';

test('migration adds checkIns without changing existing data', () => {
  const oldState = { programs: [{ id: 'p1' }], logs: [{ date: '2026-10-01' }], view: 'train' };
  const next = normalizeState(oldState);
  assert.deepEqual(next.programs, oldState.programs);
  assert.deepEqual(next.logs, oldState.logs);
  assert.deepEqual(next.checkIns, []);
});

test('check-in converts blank optional numbers to null', () => {
  const result = normalizeCheckIn({ weekKey: '2026-W40', averageWeight: '79.35', bodyFat: '', calories: '2200', notes: '  bene  ' });
  assert.equal(result.averageWeight, 79.35);
  assert.equal(result.bodyFat, null);
  assert.equal(result.calories, 2200);
  assert.equal(result.notes, 'bene');
});

test('upsert keeps one check-in per week', () => {
  const result = upsertCheckIn([{ weekKey: '2026-W40', calories: 2200 }], { weekKey: '2026-W40', calories: 2300 });
  assert.equal(result.length, 1);
  assert.equal(result[0].weekKey, '2026-W40');
  assert.equal(result[0].calories, 2300);
});

test('share text contains readable summary fields', () => {
  const text = serializeCheckInForShare({ weekKey: '2026-W40', averageWeight: 79.35, bodyFat: 13.4, calories: 2300, notes: 'recupero buono' });
  assert.match(text, /79,35/);
  assert.match(text, /13,4/);
  assert.match(text, /recupero buono/);
});

test('share summary is plain text and does not contain program logs', () => {
  const text = serializeCheckInForShare({ weekKey: '2026-W40', averageWeight: 79.35, bodyFat: 13.4, calories: 2300, notes: 'ok' });
  assert.doesNotMatch(text, /workoutId|exerciseId|updatedAt/);
  assert.match(text, /CHECK-IN IRONLOG/);
});
