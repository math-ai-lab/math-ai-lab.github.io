(() => {
  const svg=document.getElementById('course-cube');
  if (!svg) return;
  const button=document.getElementById('cube-motion');
  const vertices=Array.from({length:8},(_,i)=>[i&1,(i>>1)&1,(i>>2)&1]);
  function mark(name,attrs){
    const el=document.createElementNS('http://www.w3.org/2000/svg',name);
    for(const [key,value] of Object.entries(attrs)) el.setAttribute(key,value);
    svg.append(el);
    return el;
  }
  const edges=[];
  vertices.forEach((_,i)=>[1,2,4].forEach(bit=>{
    if(!(i&bit)) edges.push([i,i|bit,mark('line',{stroke:'#67cdd5','stroke-width':2})]);
  }));
  const diagonal=mark('line',{stroke:'#baa7ff','stroke-width':4});
  const arrow=mark('polygon',{fill:'#baa7ff'});
  const nodes=vertices.map(()=>mark('circle',{r:4,fill:'#d2efff'}));
  let angle=0.45,frame=0,last=0;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let moving=!preference.matches;
  function draw(){
    const pts=vertices.map(([a,b,c])=>{
      const x=a-.5,y=b-.5,z=c-.5;
      const u=x*Math.cos(angle)-z*Math.sin(angle),v=x*Math.sin(angle)+z*Math.cos(angle);
      return [105*u,105*(.48*v-.877*y)];
    });
    for(const [i,j,el] of [...edges,[0,7,diagonal]]){
      const [x,y]=pts[i],[u,v]=pts[j];
      for(const [k,n] of Object.entries({x1:x,y1:y,x2:u,y2:v})) el.setAttribute(k,n);
    }
    nodes.forEach((el,i)=>{el.setAttribute('cx',pts[i][0]);el.setAttribute('cy',pts[i][1]);});
    const [x,y]=pts[7],dx=x-pts[0][0],dy=y-pts[0][1],len=Math.hypot(dx,dy)||1;
    arrow.setAttribute('points',[[x,y],[x-13*dx/len+5*dy/len,y-13*dy/len-5*dx/len],[x-13*dx/len-5*dy/len,y-13*dy/len+5*dx/len]].map(p=>p.join(',')).join(' '));
  }
  function tick(t){if(last)angle+=Math.min(t-last,80)*.00022;last=t;draw();frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(frame);last=0;draw();button.hidden=false;button.textContent=moving?'Pause rotation':'Rotate cube';if(moving&&!document.hidden)frame=requestAnimationFrame(tick);}
  button.onclick=()=>{moving=!moving;sync();};preference.onchange=()=>{moving=!preference.matches;sync();};document.addEventListener('visibilitychange',sync);sync();
})();
