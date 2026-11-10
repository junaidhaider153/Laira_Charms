import React from "react";
import { Metadata } from "next";
import { listAddresses } from "@/lib/account/address-service";
import { AddressBook } from "@/components/account/AddressBook";
import { guardCustomer } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Delivery Addresses | My Account - Laira Charms",
  description: "Manage your verified Pakistani shipping addresses for fast keepsake delivery.",
};

export default async function CustomerAddressesPage() {
  const userId = await guardCustomer("/account/addresses");
  const addresses = await listAddresses(userId);

  return (
    <div className="py-2">
      <AddressBook initialAddresses={addresses} />
    </div>
  );
}

