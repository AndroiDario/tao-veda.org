import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyticsProgressKey,
  readStoredList,
  trackCompletionMilestones,
  trackLessonView,
  writeStoredList,
} from '../src/lib/progress-events.mjs';

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

const base = {
  courseId: 'via-tao-veda',
  courseVersion: '2.0',
  moduleId: 'entrare-nella-visione',
  lessonId: 'orientamento-presente',
  lessonProgressId: 'entrare-nella-visione/orientamento-presente',
  isPublic: true,
  moduleLessonIds: [
    'entrare-nella-visione/laboratorio-culturale',
    'entrare-nella-visione/corpo-luogo-conoscenza',
    'entrare-nella-visione/orientamento-presente',
  ],
  courseLessonIds: [
    'entrare-nella-visione/laboratorio-culturale',
    'entrare-nella-visione/corpo-luogo-conoscenza',
    'entrare-nella-visione/orientamento-presente',
    'tradizioni-in-dialogo/tre-matrici',
  ],
};

test('lesson_view contiene soltanto coordinate editoriali e stato di anteprima', () => {
  const dataLayer = [];
  trackLessonView({ dataLayer, ...base });

  assert.deepEqual(dataLayer, [{
    event: 'lesson_view',
    course_id: 'via-tao-veda',
    course_version: '2.0',
    module_id: 'entrare-nella-visione',
    lesson_id: 'orientamento-presente',
    is_public: true,
  }]);
});

test('emette la lezione senza anticipare modulo e corso', () => {
  const storage = memoryStorage();
  const dataLayer = [];
  const emitted = trackCompletionMilestones({
    storage,
    dataLayer,
    ...base,
    completedLessonIds: [base.lessonProgressId],
  });

  assert.deepEqual(emitted, ['lesson_complete']);
  assert.deepEqual(dataLayer.map(({ event }) => event), ['lesson_complete']);
});

test('emette ogni traguardo una sola volta anche dopo l’azzeramento dei progressi', () => {
  const storage = memoryStorage();
  const dataLayer = [];
  const completedLessonIds = [...base.courseLessonIds];

  const first = trackCompletionMilestones({ storage, dataLayer, ...base, completedLessonIds });
  const second = trackCompletionMilestones({ storage, dataLayer, ...base, completedLessonIds });

  assert.deepEqual(first, ['lesson_complete', 'module_complete', 'course_complete']);
  assert.deepEqual(second, []);
  assert.equal(dataLayer.length, 3);
  assert.deepEqual(readStoredList(storage, analyticsProgressKey(base.courseId, base.courseVersion)), [
    `lesson:${base.lessonProgressId}`,
    `module:${base.moduleId}`,
    'course',
  ]);
});

test('una nuova versione del corso dispone di una deduplicazione distinta', () => {
  const storage = memoryStorage();
  const dataLayer = [];
  const completedLessonIds = [...base.courseLessonIds];

  trackCompletionMilestones({ storage, dataLayer, ...base, completedLessonIds });
  const emitted = trackCompletionMilestones({
    storage,
    dataLayer,
    ...base,
    courseVersion: '2.1',
    completedLessonIds,
  });

  assert.deepEqual(emitted, ['lesson_complete', 'module_complete', 'course_complete']);
  assert.equal(dataLayer.length, 6);
});

test('dati locali non validi e storage indisponibile non interrompono la pagina', () => {
  const storage = memoryStorage();
  storage.setItem('invalid', '{');
  assert.deepEqual(readStoredList(storage, 'invalid'), []);

  const blockedStorage = {
    getItem() { throw new Error('blocked'); },
    setItem() { throw new Error('blocked'); },
  };
  assert.deepEqual(readStoredList(blockedStorage, 'key'), []);
  assert.equal(writeStoredList(blockedStorage, 'key', ['one']), false);
});
