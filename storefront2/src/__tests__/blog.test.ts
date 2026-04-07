import { describe, it, expect } from "vitest";
import { getAllPosts, getPost } from "@/lib/blog";

describe("blog", () => {
  it("should return all posts sorted by date descending", () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);

    // Verify sorted descending
    for (let i = 0; i < posts.length - 1; i++) {
      expect(new Date(posts[i].date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i + 1].date).getTime()
      );
    }
  });

  it("should return post by slug", () => {
    const post = getPost("bem-vindo");
    expect(post).not.toBeNull();
    expect(post!.title).toContain("Imports China Brasil");
    expect(post!.slug).toBe("bem-vindo");
    expect(post!.content).toBeTruthy();
  });

  it("should return null for unknown slug", () => {
    expect(getPost("nonexistent-slug")).toBeNull();
  });

  it("should have required fields on each post", () => {
    const posts = getAllPosts();
    for (const post of posts) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.author).toBeTruthy();
      expect(post.content).toBeTruthy();
    }
  });
});
