import React from "react";
import { Metadata } from "next";
import { listAddresses, SAMPLE_CUSTOMER_USER_ID } from "@/lib/account/address-service";
import { AddressBook } from "@/components/account/AddressBook";

export const metadata: Metadata = {
  title: "Saved Delivery Addresses | My Account - Laira Charms",
  description: "Manage your verified Pakistani shipping addresses for fast keepsake delivery.",
};

export default async function CustomerAddressesPage() {
  const userId = SAMPLE_CUSTOMER_USER_ID;
  const addresses = await listAddresses(userId);

  return (
    <div className="py-2">
      <AddressBook initialAddresses={addresses} />
    </div>
  );
}

