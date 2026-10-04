import { CheckoutForm } from "@/components/CheckoutForm";
import { getMe } from "@/lib/api";
import { getToken } from "@/lib/session";

export const metadata = { title: "Pagar" };

export default async function CheckoutPage() {
  const token = await getToken();
  // GET /auth/me: nombre y dirección guardada del usuario para precargar el envío
  const user = token ? await getMe(token).catch(() => null) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Pagar</h1>
        {user?.name && <p className="text-gris">Comprando como {user.name}</p>}
      </div>
      <CheckoutForm defaultAddress={user?.address ?? undefined} />
    </div>
  );
}
