"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type BankConnection = {
  bank_name: string;
  account_name: string;
  account_number: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bankConnection, setBankConnection] = useState<BankConnection | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserEmail(session.user.email ?? null);

      const { data: connections } = await supabase
        .from("bank_connections")
        .select("bank_name, account_name, account_number")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (connections && connections.length > 0) {
        setBankConnection(connections[0]);
      }

      setIsCheckingSession(false);
    };

    void checkSession();
  }, [router]);

  if (isCheckingSession) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Dashboard Page</h1>
        <p className="mt-2 text-sm text-gray-600">Checking session...</p>
      </main>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold">Dashboard Page</h1>
      {userEmail ? <p className="mt-2 text-sm">Signed in as {userEmail}</p> : null}

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Bank Account</h2>
        <div className="mt-3 rounded border p-4">
          <p className="text-sm">
            Bank Name: <strong>{bankConnection?.bank_name ?? "Not connected"}</strong>
          </p>
          <p className="mt-2 text-sm">
            Account Name: <strong>{bankConnection?.account_name ?? "—"}</strong>
          </p>
          <p className="mt-2 text-sm">
            Account Number: <strong>{bankConnection?.account_number ?? "—"}</strong>
          </p>

          <button type="button" className="mt-4 rounded border px-4 py-2">
            Connect Bank
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 rounded border px-4 py-2"
      >
        Sign Out
      </button>
    </main>
  );
}
