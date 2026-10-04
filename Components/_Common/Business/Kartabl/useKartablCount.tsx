"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

// what waits for the viewer's decision in the panel's «کارتابل» (the menu
// badge); 0 when the plan has neither accounting nor CRM
const useKartablCount = (node: NodeWithAcl, enabled = true) => {
  const { data } = useSWR<number>(
    enabled ? `${API}/${node}/kartabl/count` : null,
    (url: string) =>
      fetcher({ url })
        .then((res) => Number((res.data as { pending?: number } | undefined)?.pending) || 0)
        .catch(() => 0),
    { refreshInterval: 60_000 },
  );
  return data || 0;
};

export default useKartablCount;
