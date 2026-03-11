// js/main.js
// expects posts/posts.json structure: array of {title,slug,thumbnail,category,date,excerpt}
const ignColors = [
  "#f56360",
  "#ff6b00",
  "#ecbb48",
  "#53f27d",
  "#96c5e9",
  "#c362ec",
  "#27f5da"
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
  const gridPosts = posts.slice(0,6);
  document.getElementById('main-grid').innerHTML = gridPosts.map(createCard).join('');

  // MORE section: older posts
  if(posts.length>12){
    document.getElementById('more-section').innerHTML =
      `<h3>Older posts</h3><div class="grid">${posts.slice(12,20).map(createCard).join('')}</div>`;
  }
});

// shared state
let allPosts = []
let filteredPosts = []

let currentCategory = "latest"

let index = 0
const batchSize = 9



function createListItem(post){

  return `
  <article class="latest-item">

    <a href="/${post.slug}">
      <img class="latest-thumb"
           src="${post.thumbnail}"
           alt="${post.title}">
    </a>

    <div class="latest-content">

      <a href="/${post.slug}" style="text-decoration:none;color:inherit">
        <h3>${post.title}</h3>
      </a>

      <div class="latest-meta">
        ${post.date || ""}
      </div>

      <div class="latest-excerpt">
        ${post.excerpt || ""}
      </div>

    </div>

  </article>`
}



function applyFilter(category){

  const title = document.getElementById("section-title")

  if(category === "latest"){

    title.innerText = "Latest News"

    filteredPosts = [...allPosts].sort(
      (a,b)=> new Date(b.date) - new Date(a.date)
    )

  } else {

    title.innerText = category

    filteredPosts = allPosts.filter(
      p => (p.category || "").toLowerCase() === category
    )

  }

  index = 0

  document.getElementById("posts-list").innerHTML = ""

  const oldBtn = document.getElementById("load-more-btn")
  if(oldBtn) oldBtn.remove()

  renderBatch()
}



function renderBatch(){

  const container = document.getElementById("posts-list")

  const slice = filteredPosts.slice(
    index,
    index + batchSize
  )

  let html = ""

  slice.forEach((post,i)=>{

    html += createListItem(post)

    const globalIndex = index + i + 1

    if(globalIndex % 5 === 0){

      html += `
      <div class="infeed-ad">
        <div class="ad-placeholder ad-728x90">
          AD 728 × 90
        </div>
      </div>
      `

    }

  })

  container.insertAdjacentHTML("beforeend", html)

  index += batchSize

  renderLoadMore()
}


function renderLoadMore(){

  const container = document.getElementById("posts-list")

  const existing = document.getElementById("load-more-btn")
  if(existing) existing.remove()

  if(index >= filteredPosts.length) return

  container.insertAdjacentHTML(
    "afterend",
    `
    <div class="load-more-wrap">
      <button id="load-more-btn" class="load-more-btn">
        LOAD MORE
      </button>
    </div>
    `
  )

  document
    .getElementById("load-more-btn")
    .addEventListener("click", renderBatch)
}

function initTabs(){

  document.querySelectorAll(".cat-tab")
    .forEach(btn=>{

      btn.addEventListener("click",()=>{

        document.querySelectorAll(".cat-tab")
          .forEach(b=>b.classList.remove("active"))

        btn.classList.add("active")

        const name =
          btn.innerText.toLowerCase()

        applyFilter(name)

      })

    })

}


document.addEventListener('DOMContentLoaded', async ()=>{

  const posts = await fetchPosts()

  if(!posts || posts.length===0){
    return
  }

  allPosts = posts

  /* HERO */
  const hero = posts[0]
  const side = posts.slice(1,4)

  const heroHtml = `
  <div class="hero-card">
    <a href="/${hero.slug}">
      <img src="${hero.thumbnail}">
      <h1>${hero.title}</h1>
      <p>${hero.excerpt || ""}</p>
    </a>
  </div>
  <div class="hero-card small-list">
    ${side.map(s=>`
      <div class="card">
        <a href="/${s.slug}" style="display:flex;gap:12px">
          <img src="${s.thumbnail}">
          <div>
            <div class="cat">${s.category}</div>
            <h4>${s.title}</h4>
          </div>
        </a>
      </div>`).join("")}
  </div>`

  document.getElementById("hero-section")
    .innerHTML = heroHtml


  /* GRID */

  const gridPosts = posts.slice(0,9)

  document.getElementById("main-grid")
    .innerHTML = gridPosts.map(createCard).join("")


  /* INIT */

  initTabs()


  applyFilter("latest")

})