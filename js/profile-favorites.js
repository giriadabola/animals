import { auth, db } from './firebase-config.js?v=5';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove,
  collection, getDocs, addDoc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js';

const CACHE_TTL = 5 * 60 * 1000;
const cacheKey = uid => `animals-profile:${uid}`;

function readCache(uid) {
  try {
    const data = JSON.parse(sessionStorage.getItem(cacheKey(uid)) || 'null');
    return data && Date.now() - data.savedAt < CACHE_TTL ? data : null;
  } catch { return null; }
}
function writeCache(uid, data) {
  try { sessionStorage.setItem(cacheKey(uid), JSON.stringify({ ...data, savedAt: Date.now() })); } catch {}
}
async function getUserProfile(uid) {
  const cached = readCache(uid);
  if (cached) return cached;
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.exists() ? snap.data() : {};
  const profile = { favorites: Array.isArray(data.favorites) ? data.favorites : [], nome: data.nome || '', colaborador: data.colaborador || '', rule: data.rule || '', status: data.status || '' };
  writeCache(uid, profile);
  return profile;
}
function injectStyles() {
  if (document.getElementById('profile-actions-styles')) return;
  const style = document.createElement('style');
  style.id = 'profile-actions-styles';
  style.textContent = `
    #animal-profile-actions{display:none!important}
    .animal-media-action.profile-media-action{padding:0;min-width:46px;width:46px;height:46px}
    .animal-media-action.profile-media-action:hover{transform:translateY(-2px);border-color:rgba(139,92,246,.65);background:rgba(34,37,66,.96)}
    .animal-media-action.profile-media-action.is-active{color:#ff82bc;border-color:rgba(236,72,153,.62);background:rgba(236,72,153,.13)}
    .animal-media-action.profile-media-action svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2.2}
    .favorite-burst{position:fixed;z-index:99999;pointer-events:none;font-size:26px;animation:favoriteBurst .85s ease-out forwards}
    @keyframes favoriteBurst{0%{opacity:0;transform:translate(-50%,-20%) scale(.4)}35%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-90px + var(--dy))) scale(1.25) rotate(var(--rot))}}
    .lists-modal-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(3,5,16,.78);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px}
    .lists-modal{box-sizing:border-box;width:min(540px,100%);max-height:min(700px,90vh);overflow:auto;border:1px solid rgba(255,255,255,.13);border-radius:26px;background:linear-gradient(180deg,#15182d 0%,#111426 100%);color:#eef1fa;box-shadow:0 32px 90px rgba(0,0,0,.62);padding:26px}
    .lists-modal-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}.lists-modal-head h2{margin:0;font-size:1.38rem;line-height:1.2}.lists-close{display:grid;place-items:center;flex:0 0 40px;border:1px solid transparent;border-radius:13px;width:40px;height:40px;background:rgba(255,255,255,.08);color:#fff;font-size:23px;line-height:1;cursor:pointer;transition:.2s ease}.lists-close:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.12);transform:scale(1.04)}
    .lists-options{display:grid;gap:10px}.list-option{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border-radius:14px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08)}.list-option button{border:0;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer;background:#8b5cf6;color:#fff}.list-option button.is-added{background:#205c48;color:#a7f3d0}
    .lists-empty{color:#aeb6cb;padding:10px 0 18px;font-size:.98rem}
    .create-list-row{display:grid;grid-template-columns:1fr auto;gap:12px;margin-top:4px;padding-top:20px;border-top:1px solid rgba(255,255,255,.1)}
    .create-list-label{grid-column:1/-1;margin:0 0 -2px;color:#dce2f2;font-size:.86rem;font-weight:800;letter-spacing:.02em}
    .create-list-row input{box-sizing:border-box;display:block;width:100%;min-width:0;height:48px;margin:0;border:1px solid rgba(255,255,255,.2)!important;border-radius:13px;background:#080b18!important;color:#fff!important;padding:0 15px!important;font:inherit;line-height:48px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.025);outline:none;transition:border-color .2s ease,box-shadow .2s ease,background .2s ease}
    .create-list-row input::placeholder{color:#7f89a2;opacity:1}.create-list-row input:hover{border-color:rgba(255,255,255,.32)!important}.create-list-row input:focus{border-color:#ec4899!important;background:#0b0e1c!important;box-shadow:0 0 0 4px rgba(236,72,153,.16)}
    .create-list-row button{min-width:112px;height:48px;border:0;border-radius:13px;padding:0 20px;background:linear-gradient(135deg,#f04aa0,#dd3b91);color:#fff;font:inherit;font-weight:900;cursor:pointer;box-shadow:0 10px 22px rgba(236,72,153,.22);transition:transform .2s ease,filter .2s ease}.create-list-row button:hover{transform:translateY(-1px);filter:brightness(1.06)}.create-list-row button:disabled{opacity:.6;cursor:wait;transform:none}
    @media(max-width:560px){.lists-modal-backdrop{padding:12px}.lists-modal{padding:20px;border-radius:22px}.create-list-row{grid-template-columns:1fr}.create-list-row button{width:100%}}
    .profile-action-message{position:fixed;left:50%;bottom:28px;z-index:100001;transform:translateX(-50%);background:#20243d;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:11px 18px;font-weight:800;box-shadow:0 14px 35px rgba(0,0,0,.4)}
    .animal-showcase-like.is-active{color:#ff82bc!important;background:rgba(236,72,153,.22)!important;border-color:rgba(236,72,153,.62)!important}
    .animal-showcase-like.is-active svg{fill:currentColor}
    .bookmark-modal-backdrop{position:fixed;inset:0;z-index:100000;background:rgba(3,5,16,.78);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeInBookmark 0.2s ease-out}
    .bookmark-modal{position:relative;box-sizing:border-box;width:min(340px,100%);border:1px solid rgba(255,255,255,.13);border-radius:26px;background:linear-gradient(180deg,#15182d 0%,#111426 100%);color:#eef1fa;box-shadow:0 32px 90px rgba(0,0,0,.62);padding:32px 24px 28px;text-align:center;animation:scaleInBookmark 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards}
    @keyframes fadeInBookmark{from{opacity:0}to{opacity:1}}
    @keyframes scaleInBookmark{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}
    .bookmark-modal h3{margin:0 0 20px;font-size:1.25rem;font-weight:700;color:#fff;letter-spacing:-0.01em}
    .bookmark-modal-close{position:absolute;top:16px;right:16px;display:grid;place-items:center;border:none;border-radius:50%;width:32px;height:32px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;transition:all 0.2s ease}
    .bookmark-modal-close:hover{background:rgba(255,255,255,.15);color:#fff;transform:rotate(90deg)}
    .bookmark-modal-buttons{display:flex;gap:20px;justify-content:center;width:100%}
    .bookmark-modal-btn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;width:100px;height:100px;border-radius:20px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#fff;cursor:pointer;transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1)}
    .bookmark-modal-btn svg{width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:2.2}
    .bookmark-modal-btn span{font-size:0.8rem;font-weight:600;opacity:0.8}
    .bookmark-modal-btn:hover{background:rgba(139,92,246,.15);border-color:rgba(139,92,246,.4);transform:translateY(-4px);box-shadow:0 10px 20px rgba(139,92,246,.15)}
    .bookmark-modal-btn.fav-btn.is-active{color:#ff82bc;border-color:rgba(236,72,153,.62);background:rgba(236,72,153,.13);box-shadow:0 10px 25px rgba(236,72,153,0.25)}
    .bookmark-modal-btn.fav-btn.is-active svg{fill:currentColor}
    .bookmark-modal-btn.lists-btn:hover{background:rgba(16,185,129,.15);border-color:rgba(16,185,129,.4);box-shadow:0 10px 20px rgba(16,185,129,.15)}
    .bookmark-btn.is-active{color:#ff82bc!important}
  `;
  document.head.appendChild(style);
}
function icon(type) {
  if (type === 'heart') return `<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>`;
  if (type === 'edit') return `<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>`;
  return `<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`;
}
function toast(text) {
  document.querySelector('.profile-action-message')?.remove();
  const el = document.createElement('div'); el.className = 'profile-action-message'; el.textContent = text;
  document.body.appendChild(el); setTimeout(() => el.remove(), 2300);
}
function burst(button) {
  const r = button.getBoundingClientRect();
  ['♥','✦','♥','✦','♥'].forEach((char, i) => {
    const el = document.createElement('span'); el.className = 'favorite-burst'; el.textContent = char;
    el.style.left = `${r.left + r.width / 2}px`; el.style.top = `${r.top + r.height / 2}px`;
    el.style.setProperty('--dx', `${(i - 2) * 28}px`); el.style.setProperty('--dy', `${Math.abs(i - 2) * 10}px`); el.style.setProperty('--rot', `${(i - 2) * 18}deg`);
    el.style.color = i % 2 ? '#a78bfa' : '#fb71ad'; document.body.appendChild(el); setTimeout(() => el.remove(), 900);
  });
}
async function ensureUserDoc(user) {
  await setDoc(doc(db, 'users', user.uid), { email: user.email || '', nome: user.displayName || user.email?.split('@')[0] || 'Utilizador' }, { merge: true });
}
async function openListsModal(user, animalId) {
  const backdrop = document.createElement('div'); backdrop.className = 'lists-modal-backdrop';
  backdrop.innerHTML = `<section class="lists-modal" role="dialog" aria-modal="true" aria-labelledby="lists-modal-title"><div class="lists-modal-head"><h2 id="lists-modal-title">Adicionar a uma lista</h2><button type="button" class="lists-close" aria-label="Fechar">×</button></div><div class="lists-options"><div class="lists-empty">A carregar listas…</div></div><form class="create-list-row"><label class="create-list-label" for="new-list-name">Criar uma nova lista</label><input id="new-list-name" name="listName" type="text" maxlength="70" autocomplete="off" placeholder="Escreve o nome da lista" aria-label="Nome da nova lista" required><button type="submit">Criar</button></form></section>`;
  document.body.appendChild(backdrop);
  const options = backdrop.querySelector('.lists-options');
  const close = () => backdrop.remove(); backdrop.querySelector('.lists-close').onclick = close; backdrop.onclick = e => { if (e.target === backdrop) close(); };
  async function loadLists() {
    const snap = await getDocs(collection(db, 'users', user.uid, 'lists'));
    const lists = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (!lists.length) { options.innerHTML = `<div class="lists-empty">Ainda não criaste nenhuma lista.</div>`; return; }
    options.innerHTML = lists.map(list => {
      const ids = Array.isArray(list.animalIds) ? list.animalIds : []; const added = ids.includes(animalId);
      return `<div class="list-option"><span>${escapeHtml(list.name || 'Lista sem nome')}</span><button data-list-id="${list.id}" class="${added ? 'is-added' : ''}">${added ? 'Adicionado' : 'Adicionar'}</button></div>`;
    }).join('');
    options.querySelectorAll('button[data-list-id]').forEach(btn => btn.onclick = async () => {
      btn.disabled = true;
      const ref = doc(db, 'users', user.uid, 'lists', btn.dataset.listId);
      const added = btn.classList.contains('is-added');
      await updateDoc(ref, { animalIds: added ? arrayRemove(animalId) : arrayUnion(animalId), updatedAt: serverTimestamp() });
      btn.classList.toggle('is-added', !added); btn.textContent = added ? 'Adicionar' : 'Adicionado'; btn.disabled = false;
    });
  }
  backdrop.querySelector('form').onsubmit = async e => {
    e.preventDefault(); const input = e.currentTarget.querySelector('input'); const name = input.value.trim(); if (!name) return;
    const button = e.currentTarget.querySelector('button'); button.disabled = true;
    await addDoc(collection(db, 'users', user.uid, 'lists'), { name, animalIds: [animalId], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    input.value = ''; button.disabled = false; await loadLists(); toast('Lista criada e animal adicionado.');
  };
  try { await loadLists(); } catch (error) { console.error(error); options.innerHTML = `<div class="lists-empty">Não foi possível carregar as listas.</div>`; }
}
function escapeHtml(value='') { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

async function openBookmarkActionsModal(user, animalId, profile, updateBookmarkUI) {
  const backdrop = document.createElement('div');
  backdrop.className = 'bookmark-modal-backdrop';
  
  let active = profile.favorites.includes(animalId);
  
  backdrop.innerHTML = `
    <div class="bookmark-modal" role="dialog" aria-modal="true">
      <button type="button" class="bookmark-modal-close" aria-label="Fechar">×</button>
      <h3>Ações do Animal</h3>
      <div class="bookmark-modal-buttons">
        <button type="button" class="bookmark-modal-btn fav-btn ${active ? 'is-active' : ''}" title="Favoritar">
          ${icon('heart')}
          <span>Favorito</span>
        </button>
        <button type="button" class="bookmark-modal-btn lists-btn" title="Adicionar a listas">
          ${icon('list')}
          <span>Listas</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  
  const close = () => backdrop.remove();
  backdrop.querySelector('.bookmark-modal-close').onclick = close;
  backdrop.onclick = e => { if (e.target === backdrop) close(); };
  
  const favBtn = backdrop.querySelector('.fav-btn');
  const listsBtn = backdrop.querySelector('.lists-btn');
  
  favBtn.onclick = async () => {
    favBtn.disabled = true;
    try {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, { favorites: active ? arrayRemove(animalId) : arrayUnion(animalId) });
      active = !active;
      profile.favorites = active 
        ? [...new Set([...profile.favorites, animalId])] 
        : profile.favorites.filter(id => id !== animalId);
      writeCache(user.uid, profile);
      
      favBtn.classList.toggle('is-active', active);
      
      document.querySelectorAll('.favorite-action').forEach(f => {
        f.classList.toggle('is-active', active);
        f.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Favoritar');
        f.title = active ? 'Remover dos favoritos' : 'Favoritar';
      });
      
      updateBookmarkUI(active);
      
      if (active) burst(favBtn);
      toast(active ? 'Animal adicionado aos favoritos.' : 'Animal removido dos favoritos.');
    } catch (e) {
      console.error(e);
      toast('Não foi possível atualizar os favoritos.');
    }
    favBtn.disabled = false;
  };
  
  listsBtn.onclick = () => {
    close();
    openListsModal(user, animalId);
  };
}

export function initAnimalProfileActions({ animalId }) {
  injectStyles();
  document.querySelectorAll('#animal-profile-actions').forEach(mount => {
    mount.hidden = true;
  });
  
  const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
  const allMediaActions = document.querySelectorAll('.animal-media-actions');

  // Wire up Share buttons in top card or elsewhere
  document.querySelectorAll('.left-column-actions .left-action-btn[aria-label="Partilhar"]').forEach(btn => {
    btn.onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast('Link copiado para a área de transferência!');
      }
    };
  });

  if (!animalId) return;

  onAuthStateChanged(auth, async user => {
    if (!user) {
      const handleLoginRedirect = () => {
        location.href = `login.html?redirect=${encodeURIComponent(location.href)}`;
      };
      
      bookmarkBtns.forEach(btn => btn.onclick = handleLoginRedirect);
      
      allMediaActions.forEach(mediaActions => {
        mediaActions.querySelectorAll('.profile-media-action').forEach(button => button.remove());
        mediaActions.insertAdjacentHTML('beforeend', `
          <button type="button" class="animal-media-action profile-media-action favorite-action" aria-label="Favoritar" title="Favoritar">${icon('heart')}</button>
          <button type="button" class="animal-media-action profile-media-action lists-action" aria-label="Adicionar a listas" title="Adicionar a listas">${icon('list')}</button>
        `);
        const fav = mediaActions.querySelector('.favorite-action');
        const lists = mediaActions.querySelector('.lists-action');
        fav.onclick = lists.onclick = handleLoginRedirect;
      });
      return;
    }

    await ensureUserDoc(user);
    let profile = await getUserProfile(user.uid);
    let active = profile.favorites.includes(animalId);

    const updateBookmarkUI = (isActive) => {
      bookmarkBtns.forEach(btn => {
        btn.classList.toggle('is-active', isActive);
        const iEl = btn.querySelector('i');
        if (iEl) iEl.className = isActive ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
      });
    };

    updateBookmarkUI(active);

    bookmarkBtns.forEach(bookmarkBtn => {
      bookmarkBtn.onclick = () => {
        openBookmarkActionsModal(user, animalId, profile, updateBookmarkUI);
      };
    });

    allMediaActions.forEach(mediaActions => {
      mediaActions.querySelectorAll('.profile-media-action').forEach(button => button.remove());
      mediaActions.insertAdjacentHTML('beforeend', `
        <button type="button" class="animal-media-action profile-media-action favorite-action" aria-label="Favoritar" title="Favoritar">${icon('heart')}</button>
        <button type="button" class="animal-media-action profile-media-action lists-action" aria-label="Adicionar a listas" title="Adicionar a listas">${icon('list')}</button>
        <button type="button" class="animal-media-action profile-media-action edit-suggestion-action" aria-label="Sugerir edição" title="Sugerir edição">${icon('edit')}</button>
      `);

      const fav = mediaActions.querySelector('.favorite-action');
      const lists = mediaActions.querySelector('.lists-action');
      const edit = mediaActions.querySelector('.edit-suggestion-action');

      edit.onclick = () => {
        const role = String(profile.rule || '').toLowerCase();
        const status = String(profile.status || '').toLowerCase();
        const approved = status === 'on' && (role === 'colaborador' || String(profile.colaborador || '').toLowerCase() === 'on');
        if (approved) {
          window.open(`form/form.html?edit=${encodeURIComponent(animalId)}&mode=suggestion`, '_blank', 'noopener,noreferrer');
        } else {
          location.href = `myperfil.html?tab=contribute`;
        }
      };

      const paintFav = () => {
        fav.classList.toggle('is-active', active);
        fav.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Favoritar');
        fav.title = active ? 'Remover dos favoritos' : 'Favoritar';
      };
      paintFav();

      fav.onclick = async () => {
        fav.disabled = true;
        try {
          const ref = doc(db, 'users', user.uid);
          await updateDoc(ref, { favorites: active ? arrayRemove(animalId) : arrayUnion(animalId) });
          active = !active;
          profile.favorites = active ? [...new Set([...profile.favorites, animalId])] : profile.favorites.filter(id => id !== animalId);
          writeCache(user.uid, profile);
          
          document.querySelectorAll('.favorite-action').forEach(f => {
            f.classList.toggle('is-active', active);
            f.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Favoritar');
            f.title = active ? 'Remover dos favoritos' : 'Favoritar';
          });
          
          updateBookmarkUI(active);
          
          if (active) burst(fav);
          toast(active ? 'Animal adicionado aos favoritos.' : 'Animal removido dos favoritos.');
        } catch (e) {
          console.error(e);
          toast('Não foi possível atualizar os favoritos.');
        }
        fav.disabled = false;
      };

      lists.onclick = () => openListsModal(user, animalId);
    });
  });
}

export function initShowcaseLike({ button, animalId }) {
  if (!button || !animalId) return;
  injectStyles();
  onAuthStateChanged(auth, async user => {
    if (!user) {
      button.onclick = e => {
        e.preventDefault();
        e.stopPropagation();
        location.href = `login.html?redirect=${encodeURIComponent(location.href)}`;
      };
      return;
    }
    await ensureUserDoc(user);
    let profile = await getUserProfile(user.uid);
    let active = profile.favorites.includes(animalId);
    const paint = () => {
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Favoritar');
      button.title = active ? 'Remover dos favoritos' : 'Favoritar';
    };
    paint();
    button.onclick = async e => {
      e.preventDefault();
      e.stopPropagation();
      button.style.pointerEvents = 'none';
      try {
        const ref = doc(db, 'users', user.uid);
        await updateDoc(ref, { favorites: active ? arrayRemove(animalId) : arrayUnion(animalId) });
        active = !active;
        profile.favorites = active ? [...new Set([...profile.favorites, animalId])] : profile.favorites.filter(id => id !== animalId);
        writeCache(user.uid, profile);
        paint();
        if (active) burst(button);
        toast(active ? 'Animal adicionado aos favoritos.' : 'Animal removido dos favoritos.');
      } catch (err) {
        console.error(err);
        toast('Não foi possível atualizar os favoritos.');
      }
      button.style.pointerEvents = 'auto';
    };
  });
}
