"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PaymentRequest = {
  user_id: string;
  reference: string;
  unique_amount: number;
  note: string | null;
  status: string;
  expires_at: string;
};

type BankConnection = {
  bank_name: string;
  account_name: string;
  account_number: string;
};

export default function PublicPaymentPage() {
  const params = useParams();
  const reference = useMemo(() => {
    const value = params.reference;
    return Array.isArray(value) ? value[0] : value;
  }, [params.reference]);

  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [bankConnection, setBankConnection] = useState<BankConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayment = async () => {
      if (!reference) {
        setError("Invalid payment reference.");
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("payment_requests")
        .select("user_id, reference, unique_amount, note, status, expires_at")
        .eq("reference", reference)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setError("Payment request not found.");
        setIsLoading(false);
        return;
      }

      const { data: bankConnections } = await supabase
        .from("bank_connections")
        .select("bank_name, account_name, account_number")
        .eq("user_id", data.user_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (bankConnections && bankConnections.length > 0) {
        setBankConnection(bankConnections[0]);
      } else {
        setBankConnection(null);
      }

      setPayment(data);
      setIsLoading(false);
    };

    void fetchPayment();
  }, [reference]);

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Public Payment Page</h1>
        <p className="mt-2 text-sm text-gray-600">Loading payment details...</p>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Public Payment Page</h1>
        <p className="mt-2 text-sm text-red-600">{error || "Unable to load payment."}</p>
      </main>
    );
  }

  const isExpired =
    payment.status === "expired" || new Date(payment.expires_at).getTime() <= Date.now();

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Public Payment Page</h1>

      {isExpired ? (
        <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">Payment expired</p>
      ) : (
        <p className="mt-4 rounded bg-gray-100 px-3 py-2 text-sm font-medium">
          Send exactly ₦{payment.unique_amount.toLocaleString("en-NG")} by bank transfer
        </p>
      )}

      <section className="mt-4 rounded border p-4 text-sm">
        <p>
          Reference: <strong>{payment.reference}</strong>
        </p>
        <p className="mt-2">
          Unique Amount: <strong>₦{payment.unique_amount.toLocaleString("en-NG")}</strong>
        </p>
        <p className="mt-2">
          Note: <strong>{payment.note || "No note"}</strong>
        </p>
        <p className="mt-2">
          Status: <strong>{isExpired ? "expired" : payment.status}</strong>
        </p>
        <p className="mt-2">
          Expires At: <strong>{new Date(payment.expires_at).toLocaleString()}</strong>
        </p>
      </section>

      <section className="mt-4 rounded border p-4 text-sm">
        <h2 className="text-base font-semibold">Bank Details</h2>
        {bankConnection ? (
          <>
            <p className="mt-2">
              Bank Name: <strong>{bankConnection.bank_name}</strong>
            </p>
            <p className="mt-2">
              Account Name: <strong>{bankConnection.account_name}</strong>
            </p>
            <p className="mt-2">
              Account Number: <strong>{bankConnection.account_number}</strong>
            </p>
          </>
        ) : (
          <p className="mt-2">Bank details are not available yet.</p>
        )}
      </section>
    </main>
  );
}
