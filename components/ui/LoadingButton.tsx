"use client";

import { useFormStatus } from "react-dom";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  children: React.ReactNode;
}

export default function LoadingButton({ 
  loadingText, 
  children, 
  className = "", 
  disabled,
  ...props 
}: LoadingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || disabled}
      className={`${className} transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <>
          <div className="spinner" />
          <span>{loadingText || "Loading..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
