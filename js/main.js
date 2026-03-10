// js/main.js
// expects posts/posts.json structure: array of {title,slug,thumbnail,category,date,excerpt}
// simple renderer for hero, trending, grid, sidebar

const ignColors = [
  "#e91916",
  "#ff6b00",
  "#ffb400",
  "#3aa757",
  "#0090ff",
  "#8e44ad",
  "#00bfa6"
]

function randomColor(){
  return ignColors[Math.floor(Math.random()*ignColors.length)]
}

async function fetchPosts(){
  const res = await fetch('/posts/posts.json');
  if(!res.ok) return [];
  return await res.json();
}

function createCard(post){

  const color = randomColor()

  return `
  <article class="card">
    <a href="/${post.slug}" style="text-decoration:none;color:inherit">

      <img src="${post.thumbnail}" alt="${post.title}">

      <div class="card-overlay"></div>

      <div class="card-color" style="background:${color}"></div>

      <div class="card-content">
        <div class="cat">${post.category || 'Lore'}</div>
        <h3>${post.title}</h3>
      </div>

    </a>
  </article>`
}

function uniq(arr){ return [...new Set(arr)]; }

document.addEventListener('DOMContentLoaded', async ()=>{
  const posts = await fetchPosts();
  if(!posts || posts.length===0) {
    document.getElementById('hero-section').innerHTML = '<div class="hero-card">No posts yet. Open /admin to create posts.</div>';
    return;
  }

  // HERO = first post big + 2 side small posts
  const hero = posts[0];
  const side = posts.slice(1,4);

  const heroHtml = `
    <div class="hero-card">
      <a href="/${hero.slug}" style="text-decoration:none;color:inherit">
        <img src="${hero.thumbnail}" alt="${hero.title}">
        <h1 style="margin:12px 0 0">${hero.title}</h1>
        <p style="color:#666;margin-top:8px">${hero.excerpt || ''}</p>
      </a>
    </div>
    <div class="hero-card small-list">
      ${side.map(s=>`
        <div class="card">
          <a href="/${s.slug}" style="display:flex;gap:12px;text-decoration:none;color:inherit;padding:8px 0">
            <img src="${s.thumbnail}" style="width:140px;height:84px;object-fit:cover;border-radius:6px">
            <div>
              <div class="cat">${s.category||'Lore'}</div>
              <h4 style="margin:6px 0 0">${s.title}</h4>
              <p style="color:#666;font-size:13px">${s.excerpt||''}</p>
            </div>
          </a>
        </div>`).join('')}
    </div>`;

  document.getElementById('hero-section').innerHTML = heroHtml;

  // GRID = next posts
  const gridPosts = posts.slice(0,12);
  document.getElementById('main-grid').innerHTML = gridPosts.map(createCard).join('');

  // SIDEBAR trending list (top 6 titles)
  const sideList = posts.slice(0,6).map(p=>`<li><a href="/${p.slug}">${p.title}</a></li>`).join('');
  document.getElementById('sidebar-trending').innerHTML = sideList;

  // MORE section: older posts
  if(posts.length>12){
    document.getElementById('more-section').innerHTML =
      `<h3>Older posts</h3><div class="grid">${posts.slice(12,20).map(createCard).join('')}</div>`;
  }
});