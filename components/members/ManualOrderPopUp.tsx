"use client";

import { useState, useEffect } from "react";
import { getFormItemsForMember } from "@/lib/actions/forms";
import { getMemberFormItemsFromToken } from "@/lib/actions/members";
import ManualOrderModal from "./ManualOrderModal";

type FormWithItems = Awaited<ReturnType<typeof getMemberFormItemsFromToken>>;

export default function ManualOrderPopUp({
  memberId,
  clubId,
}: {
  memberId: string;
  clubId: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormWithItems | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && !form) {
      setLoading(true);
      getFormItemsForMember(memberId).then((data) => {
        setForm(data);
        setLoading(false);
      });
    }
  }, [open, memberId, form]);

  return (
    <>
      <button
        className="border border-gray-200 text-gray-600 px-3 py-1 rounded-lg text-xs hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(true)}
      >
        <h1>Manual Order</h1>
      </button>

      {open && (
        <ManualOrderModal
          loading={loading}
          form={form}
          memberId={memberId}
          clubId={clubId}
          setOpen={setOpen}
        />
      )}
    </>
  );
}
