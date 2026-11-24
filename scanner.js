const scanner = document.querySelector('.scanner');
const reveal = scanner.querySelector('input');
reveal.addEventListener('input', () => {
  scanner.querySelector('clipPath rect').setAttribute('width', reveal.value);
  scanner.querySelector('.seam').setAttribute('d', 'M'+reveal.value+' 0v100');
});
