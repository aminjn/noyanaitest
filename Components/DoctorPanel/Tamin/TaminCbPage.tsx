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

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelTamin"];

const TaminCbPage = () => {
  const [code, setCode] = useState<string | null>(null);
  // PKCE `state` the backend checks against the login it started
  const [state, setState] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const push = useProgress();

  const searchParams = useSearchParams();

  const getContent = useScopedLocale(LOCALE_NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("tamin"), target: "/doctorpanel/tamin" },
  ]);

  useEffect(() => {
    if (!code) {
      const incoming = searchParams.get("code");
      if (!incoming) return push("/");
      setCode(incoming);
      setState(searchParams.get("state"));
      setIsLoading(true);
    }
  }, [code, push, searchParams]);

  return (
    <Fragment>
      <Loading />
      <Act
        path={!!code && isLoading ? `${API}/doctor/tamin` : null}
        method="POST"
        payload={{ code, state: state || undefined }}
        onDone={() => {
          setIsLoading(false);
          // the prescriptions page shows the connection state either way
          return push("/doctorpanel/drug");
        }}
      />
    </Fragment>
  );
};

export default TaminCbPage;
