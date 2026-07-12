"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<{ error?: string }, FormData>(
    loginAction,
    {},
  );

  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-2xl font-bold">دخول الإدارة</h1>
      <form action={formAction} className="font-sans-ar mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="mt-1 w-full border border-neutral-300 px-3 py-2 text-sm focus:border-ink focus:outline-none"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {pending ? "..." : "دخول"}
        </button>
      </form>
    </div>
  );
}
