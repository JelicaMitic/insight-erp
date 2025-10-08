import { Link } from "react-router-dom";
export default function Orders() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Porudžbine</h1>
      <Link to="/orders/123" className="underline">
        Primer detalja porudžbine
      </Link>
    </div>
  );
}
