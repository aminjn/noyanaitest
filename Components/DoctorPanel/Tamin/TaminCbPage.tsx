"use client";

import Loading from "@/Components/Admin/UI/Loading";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import Act from "@/Components/UI/Act";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

const TaminCbPage = () => {
  const [code, setCode] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const push = useProgress();

  const searchParams = useSearchParams();

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
        path={!!code && isLoading ? `${API}/doctor/tamin` : null}
        method="POST"
        payload={{ code }}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return push("/");
          return push("/doctorpanel/drug");
        }}
      />
    </Fragment>
  );
};

export default TaminCbPage;
