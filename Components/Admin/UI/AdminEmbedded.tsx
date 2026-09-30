"use client";

import { createContext, useContext } from "react";

// Set by AdminSectionHub around each tab: a page shown inside a hub drops
// its own back button and big heading (the hub already has both), keeping
// only its actions ("جدید", ...).
const AdminEmbeddedContext = createContext(false);

export const AdminEmbeddedProvider = AdminEmbeddedContext.Provider;
export const useAdminEmbedded = () => useContext(AdminEmbeddedContext);
