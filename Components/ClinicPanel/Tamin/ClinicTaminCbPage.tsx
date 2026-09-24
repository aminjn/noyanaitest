"use client";

import Loading from "@/Components/Admin/UI/Loading";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import Act from "@/Components/UI/Act";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelTamin"];

const ClinicTaminCbPage = () => {
  const [code, setCode] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const push = useProgress();

  const searchParams = useSearchParams();

  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/clinicpanel" },
    { title: getContent("tamin"), target: "/clinicpanel/tamin" },
  ]);

  useEffect(() => {
    if (!code) {
      const incoming = searchParams.get("code");
      if (!incoming) return push("/");
      setCode(incoming);
      setIsLoading(true);
    }
  }, [code, push, searchParams]);

  return (
    <Fragment>
      <Loading />
      <Act
        path={!!code && isLoading ? `${API}/clinic/tamin` : null}
        method="POST"
        payload={{ code }}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return push("/");
          return push("/clinicpanel/prescription");
        }}
      />
    </Fragment>
  );
};

export default ClinicTaminCbPage;
