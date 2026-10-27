import { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const MAX_CHECKS = 8; // 8 checks, 2 seconds apart
const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

export default function OrderSuccess({ orderId }) {
  const { user, loading, openAuth } = useAuth();
  const [order, setOrder] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [gaveUpFor, setGaveUpFor] = useState(null);
  const [round, setRound] = useState(0); // bump to start checking again

  const userId = user?.id;
  const checkKey = `${userId}:${orderId}:${round}`;
  const error = errorState?.key === checkKey ? errorState.message : "";
  const gaveUp = gaveUpFor === checkKey;

  // The webhook can arrive a moment after the redirect, so keep asking
  // the server while the order is still "pending".
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    let timer;

    async function check(attempt) {
      try {
        const data = await api(`/orders/${orderId}`);
        if (cancelled) return;
        setOrder(data);
        if (data.status === "pending") {
          if (attempt < MAX_CHECKS) timer = setTimeout(() => check(attempt + 1), 2000);
          else setGaveUpFor(checkKey);
        }
      } catch (err) {
        if (!cancelled) setErrorState({ key: checkKey, message: err.message });
      }
    }

    check(1);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userId, orderId, round, checkKey]);

  let content;
  if (loading) {
    content = <p className="text-muted">Loading...</p>;
  } else if (!user) {
    content = (
      <>
        <p className="mb-4">Sign in to view this order.</p>
        <button
          type="button"
          onClick={() => openAuth("Sign in to view your order.")}
          className="cursor-pointer rounded bg-accent px-4 py-2 font-bold text-white hover:bg-accent-dark"
        >
          Sign in
        </button>
      </>
    );
  } else if (error) {
    content = <p role="alert" className="text-red-700">{error}</p>;
  } else if (!order) {
    content = <p className="text-muted">Checking your order...</p>;
  } else if (order.status === "paid") {
    content = (
      <>
        <p role="status" className="mb-6 text-xl font-bold text-accent">
          &#10003; Payment confirmed. Thank you!
        </p>
        <p className="mb-2 text-muted">Order #{order.id}</p>
        <ul className="divide-y divide-line border-y border-line">
          {order.items.map((item) => (
            <li key={item.title} className="flex flex-wrap justify-between gap-x-4 py-2">
              <span>
                {item.title} &times; {item.quantity}
              </span>
              <span>{formatPrice(item.unit_price_cents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total_cents)}</span>
        </p>
      </>
    );
  } else if (order.status === "pending") {
    content = gaveUp ? (
      <>
        <p className="mb-4">
          We haven't received confirmation of your payment yet. This can take a moment.
        </p>
        <button
          type="button"
          onClick={() => setRound((r) => r + 1)}
          className="cursor-pointer rounded bg-accent px-4 py-2 font-bold text-white hover:bg-accent-dark"
        >
          Check again
        </button>
      </>
    ) : (
      <p role="status" className="text-muted">Confirming your payment...</p>
    );
  } else {
    content = <p>This order was not completed, and you have not been charged.</p>;
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <h1 className="mb-6 text-3xl font-bold">Order confirmation</h1>
        {content}
        <p className="mt-8">
          <a href="/" className="text-accent underline">Back to the gallery</a>
        </p>
      </div>
    </section>
  );
}