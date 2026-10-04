import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "/";
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl bg-white p-6 sm:p-8">
      <h1 className="mb-1 text-3xl font-extrabold tracking-tight">Inicia sesión</h1>
      <p className="mb-6 text-gris">Necesitas una cuenta para pagar y ver tus compras.</p>
      <AuthForm mode="login" next={next} expired={sp.expired === "1"} />
    </div>
  );
}
