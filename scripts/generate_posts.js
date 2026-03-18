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
    excerpt: data.excerpt || "",
    // tags: nếu frontmatter có dạng YAML list thì data.tags có thể là array,
    // nếu dùng CMS list thì sẽ là [{tag: "x"}, ...] — chuẩn hoá về mảng string
    tags: (function(){
      if(!data.tags) return [];
      // nếu tags là mảng string
      if(Array.isArray(data.tags) && typeof data.tags[0] === "string"){
        return data.tags;
      }
      // nếu tags là mảng of objects [{tag: "x"}]
      if(Array.isArray(data.tags) && typeof data.tags[0] === "object"){
        return data.tags.map(t => t.tag || "").filter(Boolean);
      }
      return [];
    })()
  };

});

posts.sort((a,b)=> new Date(b.date) - new Date(a.date));

fs.writeFileSync(output, JSON.stringify(posts,null,2));

console.log("posts.json updated");