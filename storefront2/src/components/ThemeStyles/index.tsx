import { getThemeConfig } from "@/lib/theme-config";

export default function ThemeStyles() {
  const config = getThemeConfig();
  const c = config.colors;
  const t = config.typography;

  const css = `
    :root {
      --default-text-font-size: ${t.baseFontSize}px;
      --base-text-font-size: ${t.baseFontSize}px;
      --heading-font-family: ${t.headingFontFamily};
      --heading-font-weight: ${t.headingFontWeight};
      --heading-font-style: normal;
      --text-font-family: ${t.bodyFontFamily};
      --text-font-weight: ${t.bodyFontWeight};
      --text-font-style: normal;
      --text-font-bolder-weight: 600;
      --text-link-decoration: ${t.underlineLinks ? "underline" : "none"};
      --text-color: ${c.textColor};
      --text-color-strong: ${c.textStrongColor};
      --heading-color: ${c.headingColor};
      --border-color: ${c.borderColor};
      --form-border-color: ${c.borderColor};
      --accent-color: ${c.accentColor};
      --link-color: ${c.linkColor};
      --link-color-hover: ${c.accentColor};
      --background: ${c.backgroundColor};
      --secondary-background: ${c.secondaryBackground};
      --error-color: ${c.errorColor};
      --success-color: ${c.successColor};
      --primary-button-background: ${c.primaryButtonBg};
      --primary-button-text-color: ${c.primaryButtonText};
      --secondary-button-background: ${c.secondaryButtonBg};
      --secondary-button-text-color: ${c.secondaryButtonText};
      --header-background: ${c.headerBg};
      --header-text-color: ${c.headerText};
      --header-light-text-color: ${c.headerLightText};
      --header-accent-color: ${c.headerAccent};
      --footer-background-color: ${c.footerBg};
      --footer-heading-text-color: ${c.footerHeadingText};
      --footer-body-text-color: ${c.footerBodyText};
      --footer-accent-color: ${c.footerAccent};
      --product-on-sale-accent: ${c.onSaleAccent};
      --product-in-stock-color: ${c.inStockColor};
      --product-low-stock-color: ${c.lowStockColor};
      --product-sold-out-color: ${c.soldOutColor};
      --product-custom-label-1-background: ${c.customLabel1Bg};
      --product-custom-label-2-background: ${c.customLabel2Bg};
      --product-star-color: ${c.starColor};
      --cormenu: ${c.menuBarBg};
      --fundomenu: ${c.menuBarText};
      --mobile-container-gutter: 20px;
      --desktop-container-gutter: 40px;
      --announcement-bar-height: 40px;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
