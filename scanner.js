const scanner = document.querySelector('.scanner');
const reveal = scanner.querySelector('input');
reveal.addEventListener('input', () => {
  scanner.querySelector('clipPath rect').setAttribute('width', reveal.value);
  scanner.querySelector('.seam').setAttribute('d', 'M'+reveal.value+' 0v100');
});

// Demonstrate the reveal once when the example comes into view.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let touched = false;
  for (const type of ['pointerdown','keydown','input']) {
    reveal.addEventListener(type, event => { if (event.isTrusted) touched = true; });
  }
  const visible = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    visible.disconnect();
    const start = performance.now();
    function sweep(now) {
      if (touched) return;
      const fraction = Math.min(1, (now-start)/1900);
      reveal.value = Math.round(120 + 103*Math.sin(Math.PI*2*fraction)*Math.sin(Math.PI*fraction));
      reveal.dispatchEvent(new Event('input'));
      if (fraction < 1) requestAnimationFrame(sweep);
    }
    requestAnimationFrame(sweep);
  }, {threshold: .5});
  visible.observe(scanner);
}
