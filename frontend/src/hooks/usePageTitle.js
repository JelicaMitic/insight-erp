import { useLocation } from "react-router-dom";
import { BarChart3, Package, Boxes, Receipt, Users } from "lucide-react";

const TITLE_MAP = [
  { match: /^\/analytics/i, title: "Analytics Dashboard" },
  { match: /^\/products/i, title: "Products Catalog" },
  { match: /^\/warehouse/i, title: "Warehouse Overview" },
  { match: /^\/orders/i, title: "Orders Management" },
  { match: /^\/users/i, title: "Users Administration" },
];

export default function usePageTitle(fallback = "Insight ERP") {
  const { pathname } = useLocation();
  const hit = TITLE_MAP.find((m) => m.match.test(pathname));
  return hit?.title ?? fallback;
}
