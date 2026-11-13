import React from "react";
import { Metadata } from "next";
import { guardAdmin } from "@/lib/auth/guards";
import { getAllStoreSettings } from "@/lib/settings/settings-service";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store Settings | Admin Portal - Laira Charms",
  description: "Configure studio shipping fees, free delivery thresholds, and announcement banner.",
};

export default async function AdminSettingsPage() {
  await guardAdmin("/admin/settings");
  const settings = await getAllStoreSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}

