"use client";

import { useState } from "react";

export default function ClipboardCopyButton({ 
  textToCopy, 
  label, 
  successLabel 
}: { 
  textToCopy: string;
  label: string;
  successLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 bg-brand-navy text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-brand-navy/90 transition-all shadow-md w-full justify-center md:w-auto mt-2"
    >
      {copied ? successLabel : label}
    </button>
  );
}
