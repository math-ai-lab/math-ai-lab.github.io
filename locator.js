/* Each consecutive pair is one undirected link in the simulated transit line. */
const panel = document.querySelector('.map');
if (panel) {
  const stations = ['A','B','C','D','E'];
  const places = ['West depot','River bridge','Control room','Market stop','East terminal'];
  const incidents = [0,3,4,1,2];
  const incident = panel.querySelector('#incident');
  const sensor = panel.querySelector('#sensor');
  const dispatch = panel.querySelector('#dispatch');
  const output = panel.querySelector('output');
  let connected = false;
  let dispatched = false;

  function render() {
    const source = incidents[incident.selectedIndex];
    const anchors = connected ? [2,4] : [2];
    const candidates = stations.map((_,i)=>i).filter(i=>
      anchors.every(a=>Math.abs(i-a)===Math.abs(source-a)));
    const resolved = candidates.length === 1;
    panel.querySelectorAll('[data-site]').forEach((node,i)=>{
      node.classList.toggle('candidate',candidates.includes(i));
      node.classList.toggle('target',resolved && i===source);
    });
    panel.querySelectorAll('[data-link]').forEach((segment,i)=>{
      segment.classList.toggle('route',dispatched && i>=Math.min(2,source) && i<Math.max(2,source));
    });
    panel.querySelector('#readings').textContent = anchors.map(a=>
      'Sensor '+stations[a]+' · '+Math.abs(source-a)+' stops').join('   /   ');
    const address = places[source]+' ('+stations[source]+')';
    const route = stations.slice(Math.min(2,source),Math.max(2,source)+1);
    if(source<2) route.reverse();
    const message = dispatched ? (source===2?'Crew is already at the control room. Inspection can begin.':'Crew dispatched to '+address+'. Inspection route: '+route.join(' → ')+'.') :
      resolved ? 'Fault located at '+address+'. Dispatch the inspection crew.' :
      'Two possible sites: '+candidates.map(i=>places[i]).join(' or ')+'. Connect sensor E to choose the inspection site.';
    output.textContent=message;
    panel.querySelector('svg title').textContent='Simulated transit line, A to E. '+message;
    sensor.textContent=connected?'Disconnect sensor E':'Connect sensor E';
    sensor.setAttribute('aria-pressed',String(connected));
    dispatch.disabled=!resolved || dispatched;
    dispatch.textContent=dispatched?'Inspection assigned':'Dispatch inspection crew';
  }
  sensor.addEventListener('click',()=>{connected=!connected;dispatched=false;render()});
  incident.addEventListener('change',()=>{connected=false;dispatched=false;render()});
  dispatch.addEventListener('click',()=>{dispatched=true;render()});
  render();
}
