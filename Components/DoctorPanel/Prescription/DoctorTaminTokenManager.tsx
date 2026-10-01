import { useIntlLocale } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Act from "@/Components/UI/Act";
import Button from "@/Components/UI/Button";
import { Fragment, useState } from "react";
import useSWR from "swr";

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
              month: "long",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            })
          : "get Token"}
      </Button>
      <Act<{ data: { challenge: string } }>
        path={isGettingToken ? `${API}/doctor/tamin` : null}
        onDone={(status, result) => {
          setIsGettingToken(false);
          if (!status || !result) return;
          window.location.href = `${process.env.TAMIN_DOMAIN}/auth/server/authorize?redirect_uri=${process.env.DOMAIN}/doctorpanel/tamin&code_challenge=${result.data.challenge}&client_id=portal-js&response_type=code&code_challenge_method=S256`;
        }}
      />
    </Fragment>
  );
};

export default DoctorTaminTokenManager;
