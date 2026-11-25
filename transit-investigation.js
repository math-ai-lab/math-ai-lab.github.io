// Distances are edge counts on the five-station path A–B–C–D–E.
const investigation = document.querySelector('.investigation');
const find = selector => investigation.querySelector(selector);
const scene = find('.transit-scene');
const nodes = [...scene.querySelectorAll('[data-site]')];
const links = [...scene.querySelectorAll('[data-link]')];
const incident = find('#case-choice');
const sensor = find('#station-choice');
const dispatch = find('#send-crew');
const view = find('#view-mode');
const crew = find('#crew');
const station = index => 'ABCDE'[index];
const transit = [[45,121],[118,121],[190,65],[265,65],[335,110]];
const graph = transit.map(([x]) => [x,90]);
let assigned = false;
let frame;

function positionCrew([x,y]) {
  crew.setAttribute('cx', x);
  crew.setAttribute('cy', y);
}

function render(travel = false) {
  cancelAnimationFrame(frame);
  const fault = Number(incident.value);
  const sensors = [...new Set(sensor.value === '' ? [2] : [2, Number(sensor.value)])];
  const distance = (a,b) => Math.abs(a-b);
  const matches = nodes.map((_,i) => i).filter(i =>
    sensors.every(s => distance(s,i) === distance(s,fault)));
  const coords = scene.classList.contains('graph') ? graph : transit;
  nodes.forEach((node,i) => {
    node.setAttribute('transform', 'translate(' + coords[i].join(' ') + ')');
    node.classList.toggle('candidate', matches.includes(i));
    node.classList.toggle('target', matches.length === 1 && i === fault);
  });
  links.forEach((link,i) => {
    link.setAttribute('d', 'M' + coords[i].join(' ') + ' L' + coords[i+1].join(' '));
    link.classList.toggle('route', assigned && i >= Math.min(2,fault) && i < Math.max(2,fault));
  });
  find('#distances').textContent = sensors.map(s => 'Sensor ' + station(s) + ': ' + distance(s,fault) + ' stops').join(' · ');
  const route = Array.from({length:distance(2,fault)+1}, (_,i) => 2 + i*Math.sign(fault-2));
  const result = assigned
    ? (fault === 2 ? 'The crew is already at C.' : 'Inspection route: ' + route.map(station).join(' → '))
    : matches.length === 1 ? 'Fault located at station ' + station(fault) + '.'
    : 'Stations ' + matches.map(station).join(' and ') + ' both match. Try a sensor away from C.';
  find('#fault-result').textContent = result;
  scene.querySelector('title').textContent = 'Five-station path from A to E. ' + result;
  dispatch.disabled = assigned || matches.length !== 1;
  positionCrew(coords[assigned ? fault : 2]);
  if (!travel || route.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const start = performance.now();
  function move(now) {
    const step = Math.min((now-start)/450, route.length-1);
    const i = Math.floor(step);
    const a = coords[route[i]], b = coords[route[Math.min(i+1,route.length-1)]];
    positionCrew(a.map((v,k) => v + (b[k]-v)*(step-i)));
    if (step < route.length-1) frame = requestAnimationFrame(move);
  }
  frame = requestAnimationFrame(move);
}
incident.onchange = () => { sensor.value = ''; assigned = false; render(); };
sensor.onchange = () => { assigned = false; render(); };
dispatch.onclick = () => { assigned = true; render(true); };
view.onclick = () => {
  view.setAttribute('aria-pressed', scene.classList.toggle('graph'));
  render();
};
render();
