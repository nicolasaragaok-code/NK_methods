// Partículas leves e fundo neon — rodar apenas na tela inicial (sem hash)
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext ? canvas.getContext('2d') : null;
let particles = [], animId = null;

function resizeCanvas(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initParticles(){
  particles = [];
  const count = Math.round((canvas.width * canvas.height) / 90000);
  for(let i=0;i<count;i++){
    particles.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: 1 + Math.random()*3,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      alpha: 0.2 + Math.random()*0.7
    });
  }
}

function draw(){
  if(!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // soft nebula overlay
  const g = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  g.addColorStop(0,'rgba(10,30,15,0.08)');
  g.addColorStop(1,'rgba(5,12,6,0.16)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    p.alpha += (Math.random()-0.5)*0.02;
    if(p.alpha < 0.05) p.alpha = 0.05;
    if(p.alpha > 0.95) p.alpha = 0.95;
    if(p.x < -20) p.x = canvas.width + 20;
    if(p.x > canvas.width + 20) p.x = -20;
    if(p.y < -20) p.y = canvas.height + 20;
    if(p.y > canvas.height + 20) p.y = -20;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(120,255,150,' + p.alpha + ')';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  }

  animId = requestAnimationFrame(draw);
}

function startIfHome(){
  // only show on initial screen — no hash in URL
  if(location.hash) { stop(); return; }
  initParticles();
  if(!animId) draw();
}
function stop(){ if(animId) cancelAnimationFrame(animId); animId = null; if(ctx) ctx.clearRect(0,0,canvas.width,canvas.height); }
window.addEventListener('hashchange', ()=>{ if(location.hash) stop(); else startIfHome(); });
startIfHome();

// ---------- Formatting & copy functionality ----------
const nameInput = document.getElementById('input-name');
const msgInput = document.getElementById('input-message');
const formatBtn = document.getElementById('formatBtn');
const copyBtn = document.getElementById('copyBtn');
const previewBox = document.getElementById('previewBox');

function buildFormattedMessage(name, message){
  const userName = name && name.trim() ? name.trim() : 'Anônimo';
  const safeMessage = message ? message.trim() : '';
  const header = '⚡ Novo usuário do NK Methods!\\n';
  const nameLine = '👤 Nome/Nick: ' + userName + '\\n';
  const body = '💬 Mensagem:' + '\\n' + '```' + safeMessage + '```';
  return header + nameLine + body;
}

formatBtn.addEventListener('click', ()=>{
  const fm = buildFormattedMessage(nameInput.value, msgInput.value);
  previewBox.textContent = fm;
  previewBox.focus();
});

copyBtn.addEventListener('click', async ()=>{
  // copia o texto do preview para a área de transferência
  const text = previewBox.textContent || '';
  if(!text || text.includes('Nenhuma mensagem')) { alert('Formate a mensagem primeiro.'); return; }
  try{
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copiado ✅';
    setTimeout(()=> copyBtn.textContent = 'Copiar mensagem', 2000);
  }catch(e){
    // fallback
    const ok = prompt('Copiar manualmente (Ctrl+C):', text);
    if(ok !== null) { copyBtn.textContent = 'Copiado ✅'; setTimeout(()=> copyBtn.textContent = 'Copiar mensagem',2000); }
  }
});

// convenience: format on Ctrl+Enter in message
msgInput.addEventListener('keydown', (e)=>{ if((e.ctrlKey||e.metaKey) && e.key === 'Enter') formatBtn.click(); });
