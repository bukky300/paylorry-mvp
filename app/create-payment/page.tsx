"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function generateReference() {
  return `PLR${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function generateUniqueAmount(baseAmount: number) {
  const randomAddition = Math.floor(Math.random() * 90) + 10;
  return baseAmount + randomAddition;
}

export default function CreatePaymentPage() {
  const router = useRouter();
  const [baseAmount, setBaseAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setIsCheckingSession(false);
    };

    void checkSession();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const parsedBaseAmount = Number(baseAmount);

      if (!Number.isFinite(parsedBaseAmount) || parsedBaseAmount <= 0) {
        setError("Please enter a valid base amount.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const reference = generateReference();
      const uniqueAmount = generateUniqueAmount(parsedBaseAmount);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { data, error: insertError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: session.user.id,
          reference,
          base_amount: parsedBaseAmount,
          unique_amount: uniqueAmount,
          note: note.trim() || null,
          status: "pending",
          expires_at: expiresAt,
        })
        .select("reference, unique_amount")
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(`/pay/${data.reference}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Create Payment Page</h1>
        <p className="mt-2 text-sm text-gray-600">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Create Payment Page</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Base Amount</span>
          <input
            type="number"
            min="1"
            step="1"
            value={baseAmount}
            onChange={(event) => setBaseAmount(event.target.value)}
            required
            className="rounded border px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">Note</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="rounded border px-3 py-2"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {isLoading ? "Creating..." : "Create Payment"}
        </button>
      </form>
    </main>
  );
}
