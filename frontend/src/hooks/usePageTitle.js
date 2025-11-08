import { useLocation } from "react-router-dom";

const TITLE_MAP = [
  { match: /^\/analytics(\/|$)/i, title: "  📊 Analytics Dashboard" },
  { match: /^\/products(\/|$)/i, title: "  🛍️ Products " },
  { match: /^\/warehouse(\/|$)/i, title: "  🏭 Warehouse" },
  { match: /^\/orders(\/|$)/i, title: "  📦 Orders" },
  { match: /^\/users(\/|$)/i, title: "  👤 Users" },
  { match: /^\/dashboard(\/|$)/i, title: "  📊 Dashboard" },
];

export default function usePageTitle(fallback = "Insight ERP") {
  const { pathname } = useLocation();
  const hit = TITLE_MAP.find((m) => m.match.test(pathname));
  return hit?.title ?? fallback;
}
