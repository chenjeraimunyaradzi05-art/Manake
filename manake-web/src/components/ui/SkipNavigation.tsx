import React from "react";

/**
 * SkipNavigation provides a visually hidden link that becomes visible on focus.
 * Allows keyboard users to skip directly to main content.
 * WCAG 2.4.1 - Bypass Blocks
 */
export interface SkipNavigationProps {
  /** ID of the main content element to skip to */
  mainContentId?: string;
  /** Custom label text */
  label?: string;
}

export const SkipNavigation: React.FC<SkipNavigationProps> = ({
  mainContentId = "main-content",
  label = "Skip to main content",
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById(mainContentId);
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${mainContentId}`}
      onClick={handleClick}
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2
        focus:bg-primary-900 focus:text-gold-400
        focus:rounded-lg focus:shadow-lg
        focus:ring-2 focus:ring-gold-400 focus:ring-offset-2
        focus:outline-none
        font-semibold text-sm
        transition-all duration-200
      "
    >
      {label}
    </a>
  );
};

export default SkipNavigation;
