"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions";
import type { ActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

const initial: ActionState = {};

function Field({
  label, name, type = "text", autoComplete, errors,
}: { label: string; name: string; type?: string; autoComplete?: string; errors?: string[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(errors?.length)}
        className="rounded-lg border border-anil/25 bg-white px-4 py-3 aria-[invalid=true]:border-error"
      />
      {errors?.map((e) => <span key={e} className="text-sm text-error">{e}</span>)}
    </label>
  );
}

export function AuthForm({ mode, next, expired }: { mode: "login" | "registro"; next: string; expired?: boolean }) {
  const [state, formAction] = useActionState(mode === "login" ? loginAction : registerAction, initial);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      {expired && <p className="rounded-lg bg-maiz/25 p-3">Tu sesión venció. Inicia sesión de nuevo para continuar.</p>}
      {state.message && <p role="alert" className="rounded-lg bg-error/10 p-3 text-error">{state.message}</p>}

      {mode === "registro" && <Field label="Nombre completo" name="name" autoComplete="name" errors={fe.name} />}
      <Field label="Correo electrónico" name="email" type="email" autoComplete="email" errors={fe.email} />
      <Field
        label="Contraseña"
        name="password"
        type="password"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        errors={fe.password}
      />
      {mode === "registro" && (
        <Field label="Confirmar contraseña" name="password_confirmation" type="password" autoComplete="new-password" errors={fe.password_confirmation} />
      )}

      <SubmitButton pendingText={mode === "login" ? "Iniciando sesión..." : "Creando cuenta..."}>
        {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </SubmitButton>

      <p className="text-center text-gris">
        {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
        <Link
          href={`/${mode === "login" ? "registro" : "login"}?next=${encodeURIComponent(next)}`}
          className="font-semibold text-anil underline"
        >
          {mode === "login" ? "Regístrate" : "Inicia sesión"}
        </Link>
      </p>
    </form>
  );
}
