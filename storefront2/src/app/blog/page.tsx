import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Imports China Brasil",
  description: "Dicas de treino, novidades e artigos sobre performance esportiva.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="container" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <h1 className="heading h1" style={{ marginBottom: 30 }}>Blog</h1>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-color)" }}>Nenhum post publicado ainda.</p>
      ) : (
        <div style={{ display: "grid", gap: 30 }}>
          {posts.map((post) => (
            <article key={post.slug} style={{ display: "flex", gap: 20, borderBottom: "1px solid var(--border-color)", paddingBottom: 30 }}>
              {post.image && (
                <div style={{ flexShrink: 0 }}>
                  <Link href={`/blog/${post.slug}`}>
                    <img
                      src={post.image}
                      alt={post.title}
                      style={{ width: 200, height: 140, objectFit: "cover", borderRadius: 8 }}
                    />
                  </Link>
                  <div style={{ textAlign: "center", fontSize: 10, color: "#b0b0b0", fontStyle: "italic", marginTop: 2 }}>
                    Recomendado: 400 x 280px
                  </div>
                </div>
              )}
              <div>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "var(--heading-color)" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{post.title}</h2>
                </Link>
                <p style={{ color: "var(--text-color)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
                  {post.excerpt}
                </p>
                <p style={{ fontSize: 12, color: "#888" }}>
                  {post.author} · {new Date(post.date).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
