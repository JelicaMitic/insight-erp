import { Link, useLocation } from "react-router-dom";

const pretty = (slug) =>
  slug.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = parts.map((part, idx) => ({
    label: pretty(part),
    to: "/" + parts.slice(0, idx + 1).join("/"),
  }));

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="breadcrumbs"
      className="flex items-center gap-2 text-sm opacity-80"
    >
      <Link to="/dashboard" className="hover:underline">
        Home
      </Link>
      {crumbs.map((c, i) => (
        <span key={c.to} className="flex items-center gap-2">
          <span>/</span>
          {i === crumbs.length - 1 ? (
            <span aria-current="page" className="font-medium">
              {c.label}
            </span>
          ) : (
            <Link to={c.to} className="hover:underline">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
