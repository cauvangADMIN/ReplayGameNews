// js/main.js
// expects posts/posts.json structure: {title,slug,thumbnail,category,date,excerpt}

const ignColors = [
  "#ffe7e7",
  "#e6bc9e",
  "#ecbb48",
  "#53f27d",
  "#96c5e9",
  "#c362ec",
  "#27f5da"
]

function randomColor(){
  return ignColors[Math.floor(Math.random()*ignColors.length)]
}

function shuffle(arr){
  return arr
    .map(v => ({v, r: Math.random()}))
    .sort((a,b)=>a.r-b.r)
    .map(({v})=>v)
}

function initMobileCarousel(posts){

  if(window.innerWidth > 640) return

  const container = document.getElementById("main-grid")

  const cards = container.querySelectorAll(".card")

  container.addEventListener("scroll",()=>{
    const cardWidth = cards[0].offsetWidth + 16
    const index = Math.round(container.scrollLeft / cardWidth)
  })

  /* loop effect */

  let autoScroll = setInterval(()=>{

    const cardWidth = cards[0].offsetWidth + 16

    if(container.scrollLeft + container.clientWidth >= container.scrollWidth - 5){

      container.scrollTo({
        left:0,
        behavior:"smooth"
      })

    }else{

      container.scrollBy({
        left:cardWidth,
        behavior:"smooth"
      })

    }

  },5000)

}

async function fetchPosts(){
  const res = await fetch('/posts/posts.json')
  if(!res.ok) return []
  return await res.json()
}

/* ===============================
   HERO
================================ */

function renderHero(posts){

  const hero = posts[0]

  // random 4 posts excluding hero
  const side = shuffle(
    posts.filter(p => p.slug !== hero.slug)
  ).slice(0,4)

  const heroHtml = `
  <div class="hero-card">

    <a href="/${hero.slug}">

      <img src="${hero.thumbnail}" alt="${hero.title}">

      <h1 style="margin:12px 0 0">${hero.title}</h1>

      <p style="color:#666;margin-top:8px">
        ${hero.excerpt || ""}
      </p>

    </a>

  </div>

  <div class="hero-card small-list">

  ${side.map(s=>{

    const excerpt = s.excerpt || ""

    const short =
      excerpt.length > 80
      ? excerpt.slice(0,80) + '... <span class="read-more">Read more</span>'
      : excerpt

    return `

    <div class="small-post">

      <a href="/${s.slug}" class="small-post-link">

        <img src="${s.thumbnail}" class="small-thumb">

        <div class="small-content">

          <div class="cat">${s.category || 'News'}</div>

          <h4 class="small-title">${s.title}</h4>

          <p class="small-excerpt">${short}</p>

        </div>

      </a>

    </div>

    `

  }).join("")}

  </div>
  `

  document.getElementById("hero-section").innerHTML = heroHtml
}

/* ===============================
   GRID CARDS
================================ */

function createCard(post){

  const color = randomColor()

  return `
  <article class="card">

    <a href="/${post.slug}">

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

/* ===============================
   LATEST LIST
================================ */

let allPosts = []
let filteredPosts = []

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

      <a href="/${post.slug}">
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

    // in-feed ad
    if(globalIndex % 5 === 0){

      html += `
      <div class="infeed-ad">
        <div class="ad-placeholder ad-728x90">
          AD 728 × 90
        </div>
      </div>`
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

/* ===============================
   TABS
================================ */

function initTabs(){

  document.querySelectorAll(".cat-tab")
    .forEach(btn=>{

      btn.addEventListener("click",()=>{

        document.querySelectorAll(".cat-tab")
          .forEach(b=>b.classList.remove("active"))

        btn.classList.add("active")

        const name = btn.innerText.toLowerCase()

        applyFilter(name)

      })

    })

}

/* ===============================
   INIT
================================ */

document.addEventListener("DOMContentLoaded", async ()=>{

  const posts = await fetchPosts()

  if(!posts || posts.length===0) return

  allPosts = posts

  /* HERO */
  renderHero(posts)

  /* GRID */
  const gridPosts = posts.slice(0,9)

  const gridContainer = document.getElementById("main-grid")

  gridContainer.innerHTML = gridPosts.map(createCard).join("")

  initMobileCarousel(gridPosts)

  /* INIT UI */

  initTabs()

  applyFilter("latest")

})