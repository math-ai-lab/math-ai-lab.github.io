for (const sample of document.querySelectorAll('.sample')) {
  const buttons = sample.querySelectorAll('button');
  for (const button of buttons) button.addEventListener('click', () => {
    for (const item of buttons) item.setAttribute('aria-pressed',String(item===button));
    sample.querySelector('output').textContent = button.textContent==='5'
      ? 'Correct. Five vertices each have degree 2, so the edge count is 5 × 2 ÷ 2 = 5.'
      : 'Trace the closed path once. Count each link, including the one returning to the start.';
  });
}
for (const scene of document.querySelectorAll('.rotation')) {
  const input=scene.querySelector('input');
  input.addEventListener('input',()=>{
    const angle=Number(input.value), radians=angle*Math.PI/180;
    scene.querySelector('.vector').setAttribute('transform','rotate('+(-angle)+')');
    scene.querySelector('output').textContent=angle+'° · ('+Math.cos(radians).toFixed(2)+', '+Math.sin(radians).toFixed(2)+')';
  });
}
