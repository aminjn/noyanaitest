"use client";

import { ReactNode } from "react";
import { AdminDictionary, setAdminDictionary } from "./adminText";

// Sets the admin panel's dictionary (the site default language's) before any
// child renders - on the server and again in the browser - see adminText.ts.
const AdminTextProvider = ({
  dict,
  children,
}: {
  dict: AdminDictionary | null;
  children: ReactNode;
}) => {
  setAdminDictionary(dict);
  return <>{children}</>;
};

export default AdminTextProvider;
