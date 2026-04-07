import Link from "next/link";
import { getThemeConfig } from "@/lib/theme-config";

export default function AnnouncementBar() {
  const config = getThemeConfig();
  const bar = config.announcementBar;

  if (!bar.enabled) return null;

  return (
    <section
      className="announcement-bar"
      style={{
        background: config.colors.announcementBarBg,
        color: config.colors.announcementBarText,
      }}
    >
      <div className="container">
        <div className="announcement-bar__inner">
          {bar.linkUrl ? (
            <Link href={bar.linkUrl} className="announcement-bar__content announcement-bar__content--center">
              {bar.text}
            </Link>
          ) : (
            <p className="announcement-bar__content announcement-bar__content--center">{bar.text}</p>
          )}
        </div>
      </div>
    </section>
  );
}
