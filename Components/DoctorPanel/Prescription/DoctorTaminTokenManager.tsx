import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import { Fragment, useState } from "react";
import useSWR from "swr";

// Minimal Tamin login button, still used by the (locked) pharmacy panel.
// The doctor panel uses DoctorTaminConnectionCard instead.
const DoctorTaminTokenManager = () => {
  const intlTag = useIntlLocale();
  const { data, error } = useSWR<Date>(
    `${API}/doctor/tamin/token`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const [isGettingToken, setIsGettingToken] = useState<boolean>(false);

  return (
    <Fragment>
      <Button
        isLoading={isGettingToken}
        onClick={() => setIsGettingToken(true)}
      >
        {data
          ? new Date(data).toLocaleString(intlTag, {
              timeZone: TEHRAN_TZ,
              month: "long",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            })
          : "get Token"}
      </Button>
      <Act<{ data: { authorizeUrl?: string } }>
        path={isGettingToken ? `${API}/doctor/tamin` : null}
        onDone={(status, result) => {
          setIsGettingToken(false);
          // the backend builds the authorize URL (environment, client id,
          // registered redirect address, PKCE + state)
          if (!status || !result?.data?.authorizeUrl) return;
          window.location.href = result.data.authorizeUrl;
        }}
      />
    </Fragment>
  );
};

export default DoctorTaminTokenManager;
