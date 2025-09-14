(function () {
  const steps = Array.from(document.querySelectorAll('.step'));
  const nextBtn = document.getElementById('nextBtn');
  const backBtn = document.getElementById('backBtn');
  const yearEl = document.getElementById('year');
  const ariaStatus = document.getElementById('aria-status');
  const stepLabel = document.getElementById('stepLabel');

  let current = 0;

  function updateYear() {
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function clamp(index) {
    if (index < 0) return 0;
    if (index > steps.length - 1) return steps.length - 1;
    return index;
  }

  function setStep(index) {
    current = clamp(index);
    steps.forEach((s, i) => {
      const isActive = i === current;
      s.classList.toggle('active', isActive);
      s.setAttribute('aria-hidden', String(!isActive));
      if (isActive) setTimeout(() => s.focus(), 0);
    });

    backBtn.disabled = current === 0;
    nextBtn.textContent = current === steps.length - 1 ? 'Done' : 'Next';
    stepLabel.textContent = `Step ${current + 1} of ${steps.length}`;
    if (ariaStatus) ariaStatus.textContent = stepLabel.textContent;
  }

  function handleNext() {
    if (current === steps.length - 1) {
      // Provide a gentle completion message and loop back to start.
      alert('You have reached the end. Mantra: Fewer steps, more clarity.');
      setStep(0);
      return;
    }
    setStep(current + 1);
  }

  function handleBack() { setStep(current - 1); }

  function handleKeydown(e) {
    const key = e.key;
    if (key === 'ArrowRight') { e.preventDefault(); handleNext(); }
    if (key === 'ArrowLeft') { e.preventDefault(); handleBack(); }
    if (key === 'Enter') { e.preventDefault(); handleNext(); }
  }

  function init() {
    updateYear();
    setStep(0);
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
    document.addEventListener('keydown', handleKeydown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

