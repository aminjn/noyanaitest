"use client";

import { usePathname } from "@/Components/i18n/navigation";
import { API } from "../config";
import useUser from "../Hooks/useUser";
import useDoctor from "../Hooks/useDoctor";

// Whose inbox the chat UI shows (2026-10). In the doctor panel it is the
// doctor's (GET /doctor/chat), so a secretary answers the doctor's patients
// and the doctor's own patient-side chats stay out; elsewhere the logged-in
// user's (GET /chat). `selfId` decides which messages are "mine".
const useChatScope = () => {
  const inDoctorPanel = !!usePathname()?.startsWith("/doctorpanel");
  const { user } = useUser();
  const { doctor } = useDoctor();
  if (!inDoctorPanel) return { api: `${API}/chat`, selfId: user?._id, ready: !!user };
  const owner = (doctor as { user?: string | { _id?: string } } | null | undefined)?.user;
  const selfId = typeof owner === "string" ? owner : owner?._id;
  return { api: `${API}/doctor/chat`, selfId, ready: !!user && !!selfId };
};

export default useChatScope;
