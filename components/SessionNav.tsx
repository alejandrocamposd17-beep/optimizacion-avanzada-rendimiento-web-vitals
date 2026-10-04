import Link from "next/link";
import { getSessionUserName } from "@/lib/session";
import { logoutAction } from "@/lib/actions";

/** Parte de la barra que depende de la cookie de sesión: se transmite por streaming. */
export async function SessionNav() {
  const userName = await getSessionUserName();

  if (!userName) {
    return (
      <Link href="/login" className="rounded-full px-3 py-2 text-sm hover:bg-white/10">
        Iniciar sesión
      </Link>
    );
  }

  return (
    <>
      <span className="hidden text-sm text-white/80 sm:inline">Hola, {userName.split(" ")[0]}</span>
      <form action={logoutAction}>
        <button className="rounded-full px-3 py-2 text-sm hover:bg-white/10">Cerrar sesión</button>
      </form>
    </>
  );
}

/** Reserva el mismo espacio mientras llega la sesión, para no mover la barra (CLS 0). */
export function SessionNavFallback() {
  return <span className="inline-block h-9 w-28" aria-hidden />;
}
