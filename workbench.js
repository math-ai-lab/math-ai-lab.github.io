(() => {
  const svg = document.querySelector('#field');
  const controls = document.querySelector('#adjust');
  const slider = controls.querySelector('input');
  const fit = document.querySelector('#fit');
  const points = [[12,11],[22,20],[29,12],[37,27],[46,18],[53,32],[62,22],[70,36],[80,28],[88,40]];
  const mean = axis => points.reduce((s,p)=>s+p[axis],0)/points.length;
  const mx=mean(0), my=mean(1);
  const slope=points.reduce((s,[x,y])=>s+(x-mx)*(y-my),0)/points.reduce((s,[x])=>s+(x-mx)**2,0);
  let mode='Classify', probe=[48,24];
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  function draw(){
    let marks='', message='';
    function line(a,b,color){marks+='<line x1="'+a[0]+'" y1="'+(50-a[1])+'" x2="'+b[0]+'" y2="'+(50-b[1])+'" stroke="'+color+'" stroke-width=".45"/>'}
    if(mode==='Classify'){
      const neighbours=points.map((p,i)=>({i,d:distance(p,probe)})).sort((a,b)=>a.d-b.d).slice(0,3);
      neighbours.forEach(n=>line(probe,points[n.i],'#ffffff'));
      const votes=neighbours.filter(n=>n.i<5).length;
      message='Prediction · '+(votes>=2?'teal circles':'violet diamonds')+' ('+Math.max(votes,3-votes)+' of 3 neighbours)';
    }else if(mode==='Connect'){
      const groups=points.map((_,i)=>i);
      points.forEach((p,i)=>points.slice(0,i).forEach((q,j)=>{
        if(distance(p,q)>Number(slider.value))return;
        line(p,q,'#73e6da');
        const from=groups[j],to=groups[i];
        groups.forEach((v,k)=>{if(v===from)groups[k]=to});
      }));
      message='Radius '+slider.value+' · Connected groups '+new Set(groups).size;
    }else{
      const predicted=x=>my+Number(slider.value)*(x-mx);
      let total=0;
      points.forEach(p=>{line(p,[p[0],predicted(p[0])],'#bf9dff');total+=(p[1]-predicted(p[0]))**2});
      line([0,predicted(0)],[100,predicted(100)],'#69e1d5');
      message='Slope '+Number(slider.value).toFixed(3)+' · Mean squared error '+(total/points.length).toFixed(2);
    }
    points.forEach(([x,y],i)=>{marks+=mode==='Classify'&&i>=5?'<rect x="'+(x-1.1)+'" y="'+(49-y)+'" width="2.2" height="2.2" fill="#c4a2ff" transform="rotate(45 '+x+' '+(50-y)+')"/>':'<circle cx="'+x+'" cy="'+(50-y)+'" r="1.35" fill="#66e6d5"/>'});
    if(mode==='Classify')marks+='<circle cx="'+probe[0]+'" cy="'+(50-probe[1])+'" r="2" fill="white" stroke="#16294a" stroke-width=".45"/>';
    svg.innerHTML=marks;
    document.querySelector('#result').textContent=message;
  }
  function select(next){
    mode=next;
    const classify=mode==='Classify',connect=mode==='Connect';
    document.querySelectorAll('.modes button').forEach(b=>b.setAttribute('aria-pressed',b.textContent===mode));
    document.querySelector('#question').textContent=classify?'Can you change the prediction?':connect?'When does one network emerge?':'Which line fits these points?';
    document.querySelector('#hint').textContent=classify?'Drag the white point or use the arrow keys.':connect?'Increase the radius to join nearby points.':'Tilt the line and compare the squared errors.';
    document.querySelector('#method').textContent=classify?'The three closest observations vote. Each observation has one vote, and distance is Euclidean.':connect?'Two points share an edge when their Euclidean distance is at most the chosen radius. A connected group contains points linked by paths.':'Each candidate line passes through the sample mean. The best-fit slope minimizes the average squared vertical residual.';
    controls.hidden=classify;fit.hidden=mode!=='Optimize';svg.tabIndex=classify?0:-1;
    svg.style.touchAction=classify?'none':'pan-y';
    controls.querySelector('span').textContent=connect?'Connection radius':'Line slope';
    slider.min=connect?0:-1;slider.max=connect?40:1;slider.step=connect?1:'any';slider.value=connect?13:0;
    draw();
  }
  document.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>select(b.textContent));
  slider.oninput=draw;fit.onclick=()=>{slider.value=slope;draw()};
  const clamp=(v,max)=>Math.max(1,Math.min(max-1,v));
  function move(e){const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());probe=[clamp(p.x,100),clamp(50-p.y,50)];draw()}
  svg.onpointerdown=e=>{if(mode==='Classify'){svg.setPointerCapture(e.pointerId);move(e)}};
  svg.onpointermove=e=>{if(svg.hasPointerCapture(e.pointerId))move(e)};
  svg.onkeydown=e=>{const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,2],ArrowDown:[0,-2]}[e.key];if(delta&&mode==='Classify'){e.preventDefault();probe=[clamp(probe[0]+delta[0],100),clamp(probe[1]+delta[1],50)];draw()}};
  select(mode);
})();
