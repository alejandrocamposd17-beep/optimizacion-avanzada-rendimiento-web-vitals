import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 sm:p-8">
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Crea tu cuenta</h1>
      <p className="mb-6 text-gris">Tus datos se envían directo a la API; la sesión se guarda en una cookie segura.</p>
      <AuthForm mode="registro" next={next} />
    </div>
  );
}
