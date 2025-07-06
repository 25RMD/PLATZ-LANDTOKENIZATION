import React from "react";

// AnimatedButton can act as a regular <button> or a link (<a>).
// To avoid TypeScript conflicts between the differing DOM attribute
// sets we expose a minimal API: all regular button props plus an
// optional `href`. When `href` is provided the component renders an
// anchor element instead of a button.

interface BaseProps {
  loading?: boolean;
  loadingText?: string;
  className?: string;
  children: React.ReactNode;
}

// Props when used as a button (default)
type ButtonVariant = {
  href?: undefined;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

// Props when used as an anchor/link
// Accept a subset of anchor attributes we actually need.
type AnchorVariant = {
  href: string;
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "type">; // omit conflicting

export type AnimatedButtonProps = BaseProps & (ButtonVariant | AnchorVariant);

const AnimatedButton: React.FC<AnimatedButtonProps> = (props) => {
  const { loading, loadingText, children, href, className, ...rest } = props as any;

  const content = loading ? loadingText || "Loading..." : children;

  if (href) {
    const anchorProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={className} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={className} {...buttonProps}>
      {content}
    </button>
  );
};

export default AnimatedButton;
