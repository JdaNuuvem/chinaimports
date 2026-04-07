"use client";
import { useState } from "react";
import Link from "next/link";
import type { NavLink } from "@/lib/theme-config";

interface MegaMenuProps {
  links: NavLink[];
}

export default function MegaMenu({ links }: MegaMenuProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const linksWithChildren = links.filter((l) => l.children && l.children.length > 0);
  if (linksWithChildren.length === 0) return null;

  return (
    <nav className="header__desktop-nav hidden-pocket" role="navigation">
      <ul className="header__linklist list--unstyled" role="list">
        {links.map((link, i) => (
          <li
            key={link.href}
            className="header__linklist-item"
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            style={{ position: "relative" }}
          >
            <Link href={link.href} className="header__linklist-link link">
              {link.title}
            </Link>

            {link.children && link.children.length > 0 && activeIndex === i && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "var(--background, #fff)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 4,
                  padding: "12px 0",
                  minWidth: 200,
                  zIndex: 200,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  animation: "fadeIn 0.15s ease",
                }}
              >
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    style={{
                      display: "block",
                      padding: "8px 20px",
                      color: "var(--text-color)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary-background, #f5f5f5)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
