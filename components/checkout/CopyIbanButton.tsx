"use client";

import { useState } from "react";

export default function CopyIbanButton({
  iban,
  amount,
  reference,
  clubName,
}: {
  iban: string;
  amount: string;
  reference: string;
  clubName: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `IBAN: ${iban}\nAmount: EUR ${amount}\nTo: ${clubName}\nReference: ${reference}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-brand-navy/90 transition-all shadow-md"
    >
      {copied ? "✅ Payment details copied!" : "📋 Copy payment details"}
    </button>
  );
}
