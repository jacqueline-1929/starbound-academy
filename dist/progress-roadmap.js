/* Annual roadmap meters. A checkpoint is dated evidence, not a mastery claim. */
const ROADMAP_CHECKPOINTS = 36;
const ROADMAP_ARCS = ['Launch', 'Build', 'Explore', 'Exhibit'];

function roadmapCount(learner, subject) {
  const ids = new Set(
    (state.progress || [])
      .filter(record => record.learner === learner && record.subject === subject)
      .map(record => record.lessonId || record.id)
  );
  return Math.min(ROADMAP_CHECKPOINTS, ids.size);
}

function roadmapLabel(learner) {
  return learner === 'Robby' ? 'Grade 1 foundations' : 'Grade 2 journey';
}

function roadmapTrack(subject, learner, compact = false) {
  const completed = roadmapCount(learner, subject);
  const percent = Math.round((completed / ROADMAP_CHECKPOINTS) * 100);
  const meta = SUBJECTS[subject];
  const progressGlyph = subject === 'spanish' ? '¡H!' : meta.glyph;
  return `<div class="roadmap-track ${compact ? 'compact' : ''}" style="--roadmap-color:${meta.color}">
    <div class="roadmap-name"><span aria-hidden="true">${progressGlyph}</span><b>${meta.kicker}</b><small>${completed} of ${ROADMAP_CHECKPOINTS}</small></div>
    <div class="roadmap-bar" role="progressbar" aria-label="${meta.kicker}: ${completed} of ${ROADMAP_CHECKPOINTS} grade checkpoints" aria-valuemin="0" aria-valuemax="${ROADMAP_CHECKPOINTS}" aria-valuenow="${completed}">
      <span style="--roadmap-fill:${percent}%"></span><i></i><i></i><i></i>
    </div>
    <small class="roadmap-percent">${percent}%</small>
  </div>`;
}

function renderRoadmaps() {
  const panel = $('#roadmapProgress');
  if (!panel) return;
  panel.innerHTML = `<header><div><p>${roadmapLabel(state.current)}</p><h2>${state.current}'s year journey</h2></div><div class="arc-key" aria-label="Four annual arcs">${ROADMAP_ARCS.map((arc, index) => `<span><i>${index + 1}</i>${arc}</span>`).join('')}</div></header>
    <div class="roadmap-grid">${Object.keys(SUBJECTS).map(subject => roadmapTrack(subject, state.current)).join('')}</div>
    <footer>Each step is a completed, dated evidence checkpoint. Mastery is reviewed separately.</footer>`;
  renderSubjectRoadmap();
}

function renderSubjectRoadmap() {
  const panel = $('#subjectProgress');
  if (!panel || !currentSubject || !SUBJECTS[currentSubject]) return;
  panel.innerHTML = roadmapTrack(currentSubject, state.current, true);
}

$$('[data-profile]').forEach(button => button.addEventListener('click', () => setTimeout(renderRoadmaps)));
$$('[data-subject]').forEach(button => button.addEventListener('click', () => setTimeout(renderSubjectRoadmap)));
$$('[data-view]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.view === 'world') setTimeout(renderRoadmaps);
}));
$('#importInput')?.addEventListener('change', () => setTimeout(renderRoadmaps, 100));
window.addEventListener('starbound:progress', renderRoadmaps);
renderRoadmaps();
