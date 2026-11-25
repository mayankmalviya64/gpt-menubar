// messages-look.js — makes the chatgpt.com page look like Apple Messages (iMessage).
//
// GPT Menubar injects this file into the ChatGPT page. It does NOT change how ChatGPT
// works: your messages still go to your own ChatGPT account. It only adds:
//   1) a stylesheet that recolours the page (blue bubbles for you, grey for ChatGPT,
//      a rounded "iMessage" composer, plain white / black background), and
//   2) a Messages-style chat list (your real ChatGPT history), opened from the ‹ button.
//
// The look is switched on/off by the "gm-on" class on <html>, so turning it off
// (right-click menu → Messages Look) instantly shows the normal ChatGPT page again.
//
// The selectors below use ChatGPT's own data-* attributes (not its random class names),
// so small ChatGPT redesigns are less likely to break them.

(() => {
  if (window.__gm) return;   // already injected into this page

  // ---------- 1) The stylesheet ----------
  const CSS = `
/* Colours copied from the Ask AI chat on the company overview pages (iPhone Messages). */
html.gm-on{--im-bg:#ffffff;--im-in:#e9e9eb;--im-ink:#000;--im-sub:#8a8a8e;--im-blue:#0b84ff;--im-line:#d1d1d6;--im-hover:#f2f2f7}
html.gm-on[data-theme=dark],html.gm-on.dark{--im-bg:#000000;--im-in:#26252a;--im-ink:#fff;--im-sub:#8d8d93;--im-line:#38383a;--im-hover:#1c1c1e}

/* Plain white (or black) page, Apple's system font. */
html.gm-on,html.gm-on body,html.gm-on main[data-app-shell-main-surface]{background:var(--im-bg)!important}
html.gm-on body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif!important}

/* ChatGPT's own top bar (sidebar button, model name, share…) is hidden: the app's
   Messages header replaces it. The ⚙︎ "ChatGPT controls" button in the header brings it back. */
html.gm-on:not(.gm-controls) header[data-app-shell-titlebar]{display:none!important}

/* ---- Your messages: blue bubbles on the right ---- */
html.gm-on [data-user-message-bubble]{background:var(--im-blue)!important;color:#fff!important;
  border-radius:19px!important;padding:7px 13px!important;position:relative;overflow:visible!important;max-width:78%!important}
html.gm-on [data-user-message-bubble] *{color:#fff!important}
html.gm-on [data-user-message-bubble] a{text-decoration:underline}

/* ---- ChatGPT's replies: grey bubbles on the left ----
   Each reply sits right after a hidden <h4 data-conversation-role="assistant"> heading. */
html.gm-on h4[data-conversation-role=assistant]+div{background:var(--im-in);color:var(--im-ink);
  border-radius:19px;padding:8px 14px;position:relative;width:fit-content;max-width:88%;min-width:40px;
  font-size:15px;line-height:1.4;margin-left:4px}
html.gm-on h4[data-conversation-role=assistant]+div p{margin-top:.35em;margin-bottom:.35em}
html.gm-on h4[data-conversation-role=assistant]+div:empty{display:none}
/* Code blocks and tables can be wide: let them scroll inside the bubble. */
html.gm-on h4[data-conversation-role=assistant]+div pre,
html.gm-on h4[data-conversation-role=assistant]+div table{max-width:100%;overflow-x:auto}

/* The little curled "tail" at the bottom corner of each bubble (same trick as on the overview pages):
   ::before is a bubble-coloured blob, ::after is a page-coloured blob that cuts it into a curl. */
html.gm-on [data-user-message-bubble]::before,html.gm-on [data-user-message-bubble]::after,
html.gm-on h4[data-conversation-role=assistant]+div::before,html.gm-on h4[data-conversation-role=assistant]+div::after{
  content:"";position:absolute;bottom:0;height:20px;pointer-events:none}
html.gm-on [data-user-message-bubble]::before{right:-7px;width:20px;background:var(--im-blue);border-bottom-left-radius:16px 14px}
html.gm-on [data-user-message-bubble]::after{right:-26px;width:26px;background:var(--im-bg);border-bottom-left-radius:10px}
html.gm-on h4[data-conversation-role=assistant]+div::before{left:-7px;width:20px;background:var(--im-in);border-bottom-right-radius:16px 14px}
html.gm-on h4[data-conversation-role=assistant]+div::after{left:-26px;width:26px;background:var(--im-bg);border-bottom-right-radius:10px}

/* Copy / thumbs / read-aloud icons under a reply: hidden until you hover that reply. */
html.gm-on .turn-action-controls{opacity:0;transition:opacity .15s}
html.gm-on [data-talvt-turn-state]:hover .turn-action-controls,html.gm-on .turn-action-controls:focus-within{opacity:1}

/* ---- The message box: a thin rounded "iMessage" bar ---- */
/* (An outline, not a border: ChatGPT forces its own border off with a rule we can't out-rank.) */
html.gm-on [data-composer-layout][role=presentation]{background:var(--im-bg)!important;outline:1px solid var(--im-line)!important;
  outline-offset:-1px;border-radius:20px!important;box-shadow:none!important}
/* Send / voice button: Messages-blue circle. */
html.gm-on [data-composer-layout] button[aria-label="Send"],
html.gm-on [data-composer-layout] button[aria-label="Send prompt"],
html.gm-on [data-composer-layout] button[aria-label="Start Voice"],
html.gm-on [data-composer-layout] button[data-testid="send-button"]{background:var(--im-blue)!important;color:#fff!important;border-radius:50%!important}
html.gm-on [data-composer-layout] button[aria-label="Add files and more"],
html.gm-on [data-composer-layout] button[aria-label="Dictate"]{color:var(--im-sub)!important}

/* ---- Messages-style chat list (opened with the ‹ button) ---- */
#gm-list{position:fixed;inset:0;z-index:2147483000;background:var(--im-bg,#fff);color:var(--im-ink,#000);display:flex;flex-direction:column;
  font:16px/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;animation:gmIn .18s ease-out}
#gm-list[hidden]{display:none}
@keyframes gmIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
#gm-list .top{display:flex;justify-content:flex-end;padding:6px 10px 0}
#gm-list .ic{width:36px;height:36px;border:0;background:none;color:var(--im-blue);display:grid;place-items:center;cursor:pointer;border-radius:10px}
#gm-list .ic svg{width:22px;height:22px}
#gm-list h1{font-size:30px;font-weight:700;margin:0 16px 8px;line-height:1.1}
#gm-list .search{margin:0 16px 8px;display:flex;align-items:center;gap:6px;background:var(--im-hover);border-radius:10px;padding:6px 10px;color:var(--im-sub)}
#gm-list .search input{flex:1;border:0;outline:0;background:none;color:var(--im-ink);font:inherit;font-size:16px}
#gm-list ul{list-style:none;margin:0;padding:0 0 10px;overflow-y:auto;flex:1}
#gm-list li button{width:100%;display:flex;gap:12px;align-items:center;text-align:left;background:none;border:0;color:inherit;font:inherit;padding:8px 10px 0 16px;cursor:pointer}
#gm-list li button:hover,#gm-list li button:focus-visible{background:var(--im-hover);outline:0}
#gm-list li.on button{background:var(--im-hover)}
#gm-list .av{width:44px;height:44px;border-radius:50%;flex:none;background:linear-gradient(180deg,#a5abb8,#858a96);color:#fff;display:grid;place-items:center;font-weight:600;font-size:17px;margin-bottom:8px}
#gm-list .mid{flex:1;min-width:0;border-bottom:.5px solid var(--im-line);padding-bottom:10px;align-self:stretch;display:flex;flex-direction:column;justify-content:center}
#gm-list .row1{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
#gm-list .row1 b{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gm-list .when{font-size:14px;color:var(--im-sub);flex:none}
#gm-list .when::after{content:" ›";font-size:16px}
#gm-list .sub{font-size:14px;color:var(--im-sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
#gm-list .msg{color:var(--im-sub);padding:24px 16px;text-align:center}
`;

  // The <style> tag. ChatGPT rebuilds parts of its page, so we re-add it if it ever disappears.
  const style = document.createElement('style');
  style.id = 'gm-style';
  style.textContent = CSS;
  function ensureStyle() {
    if (!style.isConnected) (document.head || document.documentElement).appendChild(style);
  }
  ensureStyle();
  new MutationObserver(ensureStyle).observe(document.documentElement, { childList: true });
  document.addEventListener('DOMContentLoaded', ensureStyle);

  // On/off switch. The app sets window.__gmStart before this file runs.
  let enabled = window.__gmStart !== false;
  function applyClass() {
    const html = document.documentElement;
    if (html.classList.contains('gm-on') !== enabled) html.classList.toggle('gm-on', enabled);
  }
  function setEnabled(on) {
    enabled = on;
    applyClass();
    if (!on) hideList();
  }
  applyClass();
  // ChatGPT sometimes rewrites the classes on <html> (e.g. when switching light/dark),
  // which would remove "gm-on" — put it back whenever that happens.
  new MutationObserver(applyClass).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // ---------- 2) The chat list ----------
  let list = null;          // the #gm-list element (built the first time it is opened)
  let items = [];           // chats loaded so far: [{id, title, update_time}]
  let offset = 0;           // how many chats we've asked ChatGPT for
  let total = Infinity;     // how many chats exist in total
  let loading = false;
  let token = null;         // your ChatGPT session key (stays inside this page)

  /** Tells the app (Swift) something, e.g. "start a new chat". */
  function tellApp(type) {
    try { window.webkit.messageHandlers.gm.postMessage({ type }); } catch (e) {}
  }

  /** "8:42 PM" today, "Yesterday", "Monday" this week, otherwise "12/11/26" — like Messages. */
  function when(iso) {
    const d = new Date(iso), now = new Date();
    const days = Math.floor((new Date(now.toDateString()) - new Date(d.toDateString())) / 864e5);
    if (days === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString([], { weekday: 'long' });
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  /** Loads the next 40 chats from your ChatGPT account (the same list as ChatGPT's sidebar). */
  async function loadMore() {
    if (loading || offset >= total) return;
    loading = true;
    try {
      if (!token) token = (await fetch('/api/auth/session').then(r => r.json())).accessToken;
      const r = await fetch(`/backend-api/conversations?offset=${offset}&limit=40&order=updated`,
                            { headers: { Authorization: 'Bearer ' + token } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      items = items.concat(j.items || []);
      offset += 40;
      total = j.total ?? items.length;
      render();
    } catch (e) {
      list.querySelector('ul').innerHTML =
        '<li class="msg">Couldn\'t load your chats. Please make sure you\'re logged in, then try again.</li>';
    }
    loading = false;
  }

  /** Draws the rows, filtered by the search box. */
  function render() {
    const q = list.querySelector('input').value.trim().toLowerCase();
    const ul = list.querySelector('ul');
    const here = location.pathname.split('/c/')[1] || '';
    const shown = items.filter(c => !q || (c.title || '').toLowerCase().includes(q));
    ul.innerHTML = '';
    if (!shown.length) {
      ul.innerHTML = `<li class="msg">${loading ? 'Loading…' : (q ? 'No chats match.' : 'No chats yet.')}</li>`;
      return;
    }
    for (const c of shown) {
      const li = document.createElement('li');
      if (c.id === here) li.className = 'on';
      const title = c.title || 'New chat';
      // Built with textContent (not innerHTML) so a chat title can never inject HTML.
      li.innerHTML = '<button type="button"><span class="av"></span><span class="mid"><span class="row1"><b></b><span class="when"></span></span><span class="sub"></span></span></button>';
      li.querySelector('.av').textContent = (title.match(/[A-Za-z0-9]/) || ['•'])[0].toUpperCase();
      li.querySelector('b').textContent = title;
      li.querySelector('.when').textContent = when(c.update_time || c.create_time);
      li.querySelector('.sub').textContent = c.pinned_time ? 'Pinned' : 'ChatGPT';
      li.querySelector('button').onclick = () => { hideList(); location.href = '/c/' + c.id; };
      ul.appendChild(li);
    }
  }

  function buildList() {
    list = document.createElement('div');
    list.id = 'gm-list';
    list.hidden = true;
    list.innerHTML = `
      <div class="top"><button class="ic" type="button" title="New chat" aria-label="New chat">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button></div>
      <h1>Messages</h1>
      <label class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input type="search" placeholder="Search" aria-label="Search chats"></label>
      <ul></ul>`;
    list.querySelector('.ic').onclick = () => { hideList(); tellApp('newChat'); };
    list.querySelector('input').oninput = render;
    // Load more chats when you scroll near the bottom.
    list.querySelector('ul').addEventListener('scroll', e => {
      const u = e.target;
      if (u.scrollTop + u.clientHeight > u.scrollHeight - 200) loadMore();
    });
    // Esc closes the list.
    list.addEventListener('keydown', e => { if (e.key === 'Escape') hideList(); });
    document.body.appendChild(list);
  }

  function showList() {
    if (!list || !list.isConnected) buildList();
    list.hidden = false;
    // Fresh list each time it opens (so new chats show up at the top).
    items = []; offset = 0; total = Infinity;
    render();
    loadMore();
    list.querySelector('input').value = '';
    list.querySelector('input').focus();
  }
  function hideList() { if (list) list.hidden = true; }
  function toggleList() { (list && !list.hidden) ? hideList() : showList(); }

  /** Shows / hides ChatGPT's own top bar (model picker, sidebar, share). */
  function toggleControls() { document.documentElement.classList.toggle('gm-controls'); }

  // The app calls these from Swift.
  window.__gm = { setEnabled, toggleList, hideList, toggleControls };
})();
