(() => {
  const canvas=document.querySelector('#film');
  if(!canvas)return;
  const ctx=canvas.getContext('2d'), motion=matchMedia('(prefers-reduced-motion: reduce)');
  const titles=['Image → RGB matrices','City → street graph','Observations → nearest-class regions'];
  let w,h,span,card,offset=0,frame=0,last=0,drag=null,visible=true,playing=!motion.matches;
  const mod=(x,n)=>(x%n+n)%n;
  function poly(points,color){
    ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();
  }
  function line(x,y,u,v,color,width=1){
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(u,v);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function label(t,x,y,size,color){ctx.fillStyle=color;ctx.font=size+'px monospace';ctx.fillText(t,x,y)}
  function iso(x,y,z=0){return [275+(x-y)*20,37+(x+y)*9-z]}
  function block(x,y,z,top){
    const a=iso(x,y,z),b=iso(x+1,y,z),c=iso(x+1,y+1,z),d=iso(x,y+1,z);
    poly([b,c,iso(x+1,y+1),iso(x+1,y)],'#284775');poly([c,d,iso(x,y+1),iso(x+1,y+1)],'#253456');poly([a,b,c,d],top);
  }
  function rgb(x,y){
    const k=(1+Math.sin(x*.74+y*.47+Math.cos(y*.8)*1.5))/2;
    return [Math.round(50+131*k),Math.round(216-99*k),Math.round(175+66*k)];
  }
  const samples=[[2,2,0],[4,4,0],[2,7,0],[7,2,1],[8,6,1],[6,8,1]];
  function scene(i,model){
    if(i===0&&model){
      ['R','G','B'].forEach((ch,c)=>{const ox=10+c*176;label(ch,ox,47,15,['#ffaaa6','#85ebcc','#abc1ff'][c]);
      for(let y=0;y<8;y++)for(let x=0;x<8;x++)label(rgb(x,y)[c],ox+x*21,67+y*18,10,'#d9e3fc')});
    }else if(i===0){
      for(let y=0;y<8;y++)for(let x=0;x<8;x++){const col=rgb(x,y);block(x+1,y+1,(col[0]-48)*.32,'rgb('+col.join(',')+')')}
    }else if(i===1){
      for(let y=0;y<=9;y++)for(let x=0;x<=9;x++){
        const a=iso(x,y);if(x<9)line(...a,...iso(x+1,y),model?'#83dfdd':'#566382',model?1.3:3);
        if(y<9)line(...a,...iso(x,y+1),model?'#83dfdd':'#566382',model?1.3:3);
        if(model){ctx.fillStyle='#d4c4ff';ctx.beginPath();ctx.arc(...a,2,0,7);ctx.fill()}
      }
      if(!model)for(let y=0;y<9;y+=2)for(let x=0;x<9;x+=2)block(x+.4,y+.35,10+mod(x*17+y*11,50),'#8c95d8');
    }else{
      for(let y=0;y<10;y+=.5)for(let x=0;x<10;x+=.5){
        let nearest=samples.reduce((a,b)=>Math.hypot(a[0]-x-.25,a[1]-y-.25)<Math.hypot(b[0]-x-.25,b[1]-y-.25)?a:b);
        poly([iso(x,y),iso(x+.5,y),iso(x+.5,y+.5),iso(x,y+.5)],model?(nearest[2]?'#65559e':'#296d78'):'#273756');
      }
      samples.forEach(([x,y,c])=>block(x,y,model?4:20,c?'#c8a5ff':'#72f4d8'));
    }
  }
  // Render each pair once. The moving window exposes the registered counterpart.
  const plates=titles.map((_,i)=>[false,true].map(model=>{
    const out=document.createElement('canvas');out.width=1080;out.height=520;
    return out;
  }));
  function renderPlate(i,model){
    ctx.fillStyle=model?'#17233a':'#192944';ctx.fillRect(0,0,540,260);
    for(let x=-320;x<850;x+=24)line(x,245,x+420,55,'#647da523');
    for(let x=-320;x<850;x+=24)line(x,55,x+420,245,'#647da523');
    ctx.save();ctx.translate(0,20);scene(i,model);ctx.restore();
    label((model?['RGB CHANNEL VALUES','VERTICES + EDGES','1-NEAREST-NEIGHBOUR']:['COLOUR RELIEF','STREET GEOMETRY','LABELLED SAMPLES'])[i],16,244,11,'#cce2f3');
  }
  function paint(){
    ctx.clearRect(0,0,w,h);const cut=w/2,scale=card/540;
    for(let k=-3;k<=3;k++){
      const index=Math.floor(offset)+k,i=mod(index,3),x=cut-card/2+(index-offset)*span;
      if(x>w||x+card<0)continue;
      ctx.save();ctx.translate(x,(h-260*scale)/2);ctx.scale(scale,scale);ctx.beginPath();ctx.roundRect(0,0,540,260,13);ctx.clip();
      ctx.drawImage(plates[i][0],0,0,540,260);ctx.beginPath();ctx.rect(0,0,Math.max(0,(cut-x)/scale),260);ctx.clip();ctx.drawImage(plates[i][1],0,0,540,260);ctx.restore();
    }
    ctx.save();ctx.shadowBlur=15;ctx.shadowColor='#53efdb';line(cut,2,cut,h-2,'#94ffeb',2);ctx.restore();
    document.querySelector('#film-label').textContent=titles[mod(Math.round(offset),3)];
  }
  function resize(){
    // Capture static plates using the same projection used for both representations.
    canvas.width=1080;canvas.height=520;ctx.setTransform(2,0,0,2,0,0);
    plates.forEach((pair,i)=>pair.forEach((plate,m)=>{renderPlate(i,Boolean(m));plate.getContext('2d').drawImage(canvas,0,0)}));
    w=canvas.clientWidth;h=canvas.clientHeight;const d=Math.min(devicePixelRatio,2);
    canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);
    card=Math.min(650,w*.87,h*540/260*.95);span=card+Math.min(48,w*.05);paint();
  }
  function tick(now){if(last)offset+=Math.min(50,now-last)/10500;last=now;paint();frame=requestAnimationFrame(tick)}
  function sync(){cancelAnimationFrame(frame);last=0;document.querySelector('#play').textContent=playing?'Pause':'Play';if(playing&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
  function step(d){playing=false;sync();offset=Math.round(offset)+d;paint()}
  document.querySelector('#back').onclick=()=>step(-1);document.querySelector('#next').onclick=()=>step(1);
  document.querySelector('#play').onclick=()=>{playing=!playing;sync()};
  canvas.onpointerdown=e=>{playing=false;sync();drag=e.clientX;canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(drag===null)return;offset+=(drag-e.clientX)/span;drag=e.clientX;paint()};
  canvas.onlostpointercapture=()=>{drag=null};
  canvas.onkeydown=e=>{if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();step(e.key==='ArrowRight'?1:-1)}};
  motion.onchange=()=>{playing=!motion.matches;sync()};document.addEventListener('visibilitychange',sync);
  new ResizeObserver(resize).observe(canvas);new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync()}).observe(canvas);resize();sync();
})();
