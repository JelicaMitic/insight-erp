import { ROLES } from "../utils/roles";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Boxes,
  ShoppingCart,
  FileText,
  Users,
  Settings,
} from "lucide-react";

export default function useNavLinks(role) {
  const all = [
    {
      section: "General",
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [ROLES.ADMIN, ROLES.REFERENT, ROLES.MENADZER],
    },
    {
      section: "Operations",
      to: "/products",
      label: "Artikli",
      icon: Package,
      roles: [ROLES.ADMIN, ROLES.REFERENT, ROLES.MENADZER],
    },
    {
      section: "Operations",
      to: "/inventory",
      label: "Skladišta & Zalihe",
      icon: Boxes,
      roles: [ROLES.ADMIN, ROLES.REFERENT, ROLES.MENADZER],
    },
    {
      section: "Operations",
      to: "/orders",
      label: "Porudžbine",
      icon: ShoppingCart,
      roles: [ROLES.ADMIN, ROLES.REFERENT, ROLES.MENADZER],
    },
    {
      section: "Operations",
      to: "/invoices",
      label: "Fakture",
      icon: FileText,
      roles: [ROLES.ADMIN, ROLES.REFERENT, ROLES.MENADZER],
    },
    {
      section: "Analytics",
      to: "/analytics",
      label: "Analitika",
      icon: BarChart3,
      roles: [ROLES.ADMIN, ROLES.MENADZER],
    },
    {
      section: "Admin",
      to: "/users",
      label: "Korisnici",
      icon: Users,
      roles: [ROLES.ADMIN],
    },
    {
      section: "Admin",
      to: "/settings",
      label: "Podešavanja",
      icon: Settings,
      roles: [ROLES.ADMIN],
    },
  ];
  return all.filter((l) => l.roles.includes(role));
}
