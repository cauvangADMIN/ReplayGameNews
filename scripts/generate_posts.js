const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "../posts");
const output = path.join(postsDir, "posts.json");

const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

const posts = files.map(file => {

  const content = fs.readFileSync(path.join(postsDir, file), "utf8");

  const match = content.match(/---([\s\S]*?)---/);

  const meta = {};

  if (match) {
    match[1].split("\n").forEach(line => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        meta[key.trim()] = rest.join(":").trim();
      }
    });
  }

  return {
    title: meta.title || "",
    slug: meta.slug || file.replace(".md", ""),
    thumbnail: meta.thumbnail || "",
    category: meta.category || "",
    date: meta.date || "",
    excerpt: meta.excerpt || ""
  };

});

posts.sort((a,b)=> new Date(b.date) - new Date(a.date));

fs.writeFileSync(output, JSON.stringify(posts,null,2));

console.log("posts.json updated");