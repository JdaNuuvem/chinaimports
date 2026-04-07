import Link from "next/link";
import { getAllPosts, getPost } from "@/lib/blog";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post não encontrado" };
  return {
    title: `${post.title} | Blog Imports China Brasil`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  return (
    <div className="container" style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <nav style={{ marginBottom: 20, fontSize: 13 }}>
        <Link href="/blog" style={{ color: "var(--link-color)", textDecoration: "none" }}>← Voltar ao blog</Link>
      </nav>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          style={{ width: "100%", height: 300, objectFit: "cover", borderRadius: 8, marginBottom: 24 }}
        />
      )}

      <h1 className="heading h1" style={{ marginBottom: 12 }}>{post.title}</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 30 }}>
        {post.author} · {new Date(post.date).toLocaleDateString("pt-BR")}
      </p>

      <div className="rte" style={{ lineHeight: 1.8, fontSize: 16 }} dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
