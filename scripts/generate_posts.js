const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDir = path.join(__dirname, "../posts");
const output = path.join(postsDir, "posts.json");

const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".md"));

const posts = files.map(file => {

  const filePath = path.join(postsDir, file);
  const content = fs.readFileSync(filePath, "utf8");

  const { data } = matter(content);

  return {
    title: data.title || "",
    subtitle: data.subtitle || "",
    slug: data.slug || file.replace(".md", ""),
    thumbnail: data.thumbnail || "",
    category: data.category || "",
    date: data.date || "",
    excerpt: data.excerpt || ""
  };

});

posts.sort((a,b)=> new Date(b.date) - new Date(a.date));

fs.writeFileSync(output, JSON.stringify(posts,null,2));

console.log("posts.json updated");