const ANALYTICS_KEY_PREFIX = 'tao-veda-formazione:analytics';

export function analyticsProgressKey(courseId, courseVersion) {
  return `${ANALYTICS_KEY_PREFIX}:${courseId}:${courseVersion}`;
}

export function readStoredList(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key) || '[]');
    return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
  } catch {
    return [];
  }
}

export function writeStoredList(storage, key, values) {
  try {
    storage.setItem(key, JSON.stringify([...new Set(values)]));
    return true;
  } catch {
    return false;
  }
}

function pushEvent(dataLayer, event, fields) {
  dataLayer.push({ event, ...fields });
}

export function trackLessonView({
  dataLayer,
  courseId,
  courseVersion,
  moduleId,
  lessonId,
  isPublic,
}) {
  pushEvent(dataLayer, 'lesson_view', {
    course_id: courseId,
    course_version: courseVersion,
    module_id: moduleId,
    lesson_id: lessonId,
    is_public: isPublic,
  });
}

export function trackCompletionMilestones({
  storage,
  dataLayer,
  courseId,
  courseVersion,
  moduleId,
  lessonId,
  lessonProgressId,
  isPublic,
  completedLessonIds,
  moduleLessonIds,
  courseLessonIds,
}) {
  const key = analyticsProgressKey(courseId, courseVersion);
  const emitted = new Set(readStoredList(storage, key));
  const emittedNow = [];

  const emitOnce = (marker, event, fields) => {
    if (emitted.has(marker)) return;
    pushEvent(dataLayer, event, fields);
    emitted.add(marker);
    emittedNow.push(event);
  };

  const base = {
    course_id: courseId,
    course_version: courseVersion,
  };

  if (completedLessonIds.includes(lessonProgressId)) {
    emitOnce(`lesson:${lessonProgressId}`, 'lesson_complete', {
      ...base,
      module_id: moduleId,
      lesson_id: lessonId,
      is_public: isPublic,
    });
  }

  if (moduleLessonIds.length > 0 && moduleLessonIds.every((id) => completedLessonIds.includes(id))) {
    emitOnce(`module:${moduleId}`, 'module_complete', {
      ...base,
      module_id: moduleId,
    });
  }

  if (courseLessonIds.length > 0 && courseLessonIds.every((id) => completedLessonIds.includes(id))) {
    emitOnce('course', 'course_complete', base);
  }

  writeStoredList(storage, key, [...emitted]);
  return emittedNow;
}
