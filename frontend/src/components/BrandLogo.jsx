import { Link } from "react-router-dom";

/**
 * Official UniBoard wordmark (full horizontal logo). Served from /public/uniboard-logo.png.
 */
export function BrandLogo({ to = "/", height = 40, className = "", imgClassName = "" }) {
  return (
    <Link
      to={to}
      className={`d-inline-flex align-items-center text-decoration-none ${className}`}
      aria-label="UniBoard home"
    >
      <img
        src="/uniboard-logo.png"
        alt="UniBoard"
        width={0}
        height={height}
        className={imgClassName}
        style={{ height: `${height}px`, width: "auto", objectFit: "contain" }}
        decoding="async"
      />
    </Link>
  );
}
