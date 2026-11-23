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
  const faces=[
    [[0,1,3,2],'#316dc0'], [[4,5,7,6],'#2583ac'],
    [[0,4,6,2],'#285d97'], [[1,5,7,3],'#286e9e'],
    [[0,1,5,4],'#274d86'], [[2,3,7,6],'#41aaa9']
  ].map(([indices,fill])=>({indices,shape:mark('polygon',{fill,stroke:'#8de1e5','stroke-width':1.6})}));
  const diagonal=mark('line',{stroke:'#baa7ff','stroke-width':4});
  const arrow=mark('polygon',{fill:'#baa7ff'});
  diagonal.setAttribute('stroke-dasharray','5 4');
  let angle=0.45,frame=0,last=0;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let moving=!preference.matches;
  function draw(){
    const pts=vertices.map(([a,b,c])=>{
      const x=a-.5,y=b-.5,z=c-.5;
      const u=x*Math.cos(angle)-z*Math.sin(angle),v=x*Math.sin(angle)+z*Math.cos(angle);
      return [105*u,105*(.48*v-.877*y),.877*v+.48*y];
    });
    const depth=face=>face.indices.reduce((sum,i)=>sum+pts[i][2],0);
    for(const face of faces.sort((a,b)=>depth(a)-depth(b))){
      face.shape.setAttribute('points',face.indices.map(i=>pts[i].slice(0,2).join(',')).join(' '));
      svg.insertBefore(face.shape,diagonal);
    }
    for(const [key,value] of Object.entries({x1:pts[0][0],y1:pts[0][1],x2:pts[7][0],y2:pts[7][1]}))
      diagonal.setAttribute(key,value);
    const [x,y]=pts[7],dx=x-pts[0][0],dy=y-pts[0][1],len=Math.hypot(dx,dy)||1;
    arrow.setAttribute('points',[[x,y],[x-13*dx/len+5*dy/len,y-13*dy/len-5*dx/len],[x-13*dx/len-5*dy/len,y-13*dy/len+5*dx/len]].map(p=>p.join(',')).join(' '));
  }
  function tick(t){if(last)angle+=Math.min(t-last,80)*.00022;last=t;draw();frame=requestAnimationFrame(tick);}
  function sync(){cancelAnimationFrame(frame);last=0;draw();button.hidden=false;button.textContent=moving?'Pause rotation':'Rotate cube';if(moving&&!document.hidden)frame=requestAnimationFrame(tick);}
  button.onclick=()=>{moving=!moving;sync();};preference.onchange=()=>{moving=!preference.matches;sync();};document.addEventListener('visibilitychange',sync);sync();
})();
