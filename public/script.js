const form   = document.getElementById('chat-form');
const input  = document.getElementById('user-input');
const chat   = document.getElementById('chat-box');
const chips  = document.getElementById('chips');
const themeT = document.getElementById('themeToggle');

// theme toggle (persist)
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.setAttribute('data-theme', saved);
themeT.addEventListener('click', () => {
  const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', now);
  localStorage.setItem('theme', now);
});

// chips → autofill
chips.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    input.value = e.target.textContent;
    input.focus();
  }
});

// autosize textarea
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 160) + 'px';
});

// enter to send, shift+enter newline
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); form.requestSubmit();
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendUser(text);
  input.value = ''; input.style.height = '44px'; input.focus();

  const thinkingRow = appendTyping();

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await resp.json();
    thinkingRow.remove();

    if (resp.ok && data?.result) appendBot(data.result);
    else appendBot(data?.error || 'Sorry, no response received.');
  } catch (err) {
    thinkingRow.remove();
    appendBot('Failed to get response from server.');
    console.error(err);
  }
});

function appendUser(text){ appendBubble('user','🧑',text); }
function appendBot(text){ appendBubble('bot','🤖',text); }

function appendBubble(who, emoji, text){
  const row = document.createElement('div'); row.className='row';
  const av  = document.createElement('div'); av.className='avatar'; av.textContent = emoji;
  const box = document.createElement('div');
  box.innerHTML = `<div class="msg ${who}">${escapeHTML(text)}</div>`;
  const meta = document.createElement('div'); meta.className='meta'; meta.textContent = timeNow();
  box.appendChild(meta);
  if (who==='user'){ row.appendChild(box); row.appendChild(av); row.style.justifyContent='flex-end'; }
  else { row.appendChild(av); row.appendChild(box); }
  chat.appendChild(row); chat.scrollTop = chat.scrollHeight;
  return row;
}

function appendTyping(){
  const row = document.createElement('div'); row.className='row';
  const av  = document.createElement('div'); av.className='avatar'; av.textContent='🤖';
  const msg = document.createElement('div'); msg.className='msg bot';
  msg.innerHTML = `<span class="typing"><span></span><span></span><span></span></span>`;
  const box = document.createElement('div'); box.appendChild(msg);
  row.appendChild(av); row.appendChild(box);
  chat.appendChild(row); chat.scrollTop = chat.scrollHeight;
  return row;
}

function timeNow(){
  const d = new Date(); return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}
function escapeHTML(s){ return s.replace(/[&<>"']/g,(c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
