"use client";

import { useEffect, useRef, useState } from "react";
import { Form, Member } from "@prisma/client";
import { useClub } from "@/providers/clubprovider";
import { getFormsByClubId, createForm } from "@/lib/actions/forms";
import { getClubMembers } from "@/lib/actions/members";
import FormCard from "@/components/forms/FormCard";

export default function FormBuilderPage() {
  const { selectedClub } = useClub();
  const [forms, setForms] = useState<Form[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!selectedClub) return;
    getFormsByClubId(selectedClub.club.id).then((data) => {
      if (data) setForms(data);
    });
  }, [selectedClub]);

  useEffect(() => {
    if (!selectedClub) return;
    getClubMembers(selectedClub.club.id).then((data) => {
      if (data) setMembers(data);
    });
  }, [selectedClub]);

  const uniqueGroups = [...new Set(members.map((member) => member.group))].sort(
    (a, b) => {
      const aIsU = a.startsWith("U");
      const bIsU = b.startsWith("U");
      if (aIsU && bIsU) return parseInt(a.slice(1)) - parseInt(b.slice(1));
      if (aIsU) return -1;
      if (bIsU) return 1;
      return a.localeCompare(b);
    },
  );

  const handleCreateForm = async (formData: FormData) => {
    if (!selectedClub) return;
    await createForm(formData, selectedClub.club.id);
    formRef.current?.reset();
    const updated = await getFormsByClubId(selectedClub.club.id);
    if (updated) setForms(updated);
  };

  if (!selectedClub) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a club to continue.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Form Builder</h1>
            <p className="text-gray-500">Manage order forms for your groups</p>
          </div>

          {forms.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No forms yet. Create your first one below.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map((form) => (
                <FormCard
                  key={form.id}
                  form={form}
                  allGroups={uniqueGroups}
                  onFormUpdate={() =>
                    getFormsByClubId(selectedClub.club.id).then((data) => {
                      if (data) setForms(data);
                    })
                  }
                />
              ))}
            </div>
          )}

          <form
            ref={formRef}
            action={handleCreateForm}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3"
          >
            <h3 className="font-bold text-brand-navy">New Form</h3>
            <input
              type="text"
              name="name"
              placeholder="Form name (e.g. Eerste Ploeg)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-green"
            />
            <div>
              <p className="text-sm font-medium text-brand-navy mb-2">
                Target Groups
              </p>
              <div className="flex flex-wrap gap-2">
                {uniqueGroups.map((group) => (
                  <label
                    key={group}
                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name="targetGroups"
                      value={group}
                      className="accent-brand-green"
                    />
                    {group}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-brand-green transition-colors"
            >
              + Create Form
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
