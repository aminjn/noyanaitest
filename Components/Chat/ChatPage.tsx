"use client";

import { usePathname } from "next/navigation";
import ChatLayout from "./ChatLayout";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "chat"];

// Shared by /dashboard/chat and /doctorpanel/chat: set this page's own
// breadcrumb (it used to keep whatever the previous page had set).
const ChatPage = () => {
  const getContent = useScopedLocale(NS);
  const base = usePathname()?.includes("/doctorpanel")
    ? "/doctorpanel"
    : "/dashboard";
  useBreadCrump([
    { title: getContent("dashboard"), target: base },
    { title: getContent("chats"), target: `${base}/chat` },
  ]);
  return <ChatLayout />;
};

export default ChatPage;
