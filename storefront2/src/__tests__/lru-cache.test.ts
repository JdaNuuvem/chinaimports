import { describe, it, expect, beforeEach } from "vitest";
import { LRUCache } from "@/lib/cache/lru-cache";

describe("LRUCache", () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3, 60);
  });

  it("should store and retrieve values", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
  });

  it("should return null for missing keys", () => {
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("should evict oldest entry when at capacity", () => {
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");
    cache.set("d", "4"); // should evict "a"
    expect(cache.get("a")).toBeNull();
    expect(cache.get("b")).toBe("2");
    expect(cache.get("d")).toBe("4");
  });

  it("should update LRU order on get", () => {
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");
    cache.get("a"); // "a" is now most recently used
    cache.set("d", "4"); // should evict "b", not "a"
    expect(cache.get("a")).toBe("1");
    expect(cache.get("b")).toBeNull();
  });

  it("should return expired entries via getStale", async () => {
    cache.set("key", "value", 1); // TTL = 1 second
    expect(cache.get("key")).toBe("value"); // still fresh
    await new Promise((r) => setTimeout(r, 1100)); // wait for expiry
    // getStale returns even expired entries
    expect(cache.getStale("key")).toBe("value");
  });

  it("should return null via get for expired entries", async () => {
    cache.set("key2", "value2", 1);
    await new Promise((r) => setTimeout(r, 1100));
    expect(cache.get("key2")).toBeNull(); // expired and removed
  });

  it("should report correct size", () => {
    expect(cache.size).toBe(0);
    cache.set("a", "1");
    cache.set("b", "2");
    expect(cache.size).toBe(2);
  });

  it("should clear all entries", () => {
    cache.set("a", "1");
    cache.set("b", "2");
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get("a")).toBeNull();
  });

  it("should delete specific entry", () => {
    cache.set("a", "1");
    cache.delete("a");
    expect(cache.get("a")).toBeNull();
  });

  it("should overwrite existing key without increasing size", () => {
    cache.set("a", "1");
    cache.set("a", "2");
    expect(cache.get("a")).toBe("2");
    expect(cache.size).toBe(1);
  });

  it("should report stats", () => {
    cache.set("a", "1");
    const stats = cache.stats();
    expect(stats.entries).toBe(1);
    expect(stats.maxEntries).toBe(3);
  });
});
