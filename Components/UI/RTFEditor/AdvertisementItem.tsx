import { Fragment, ReactNode, useMemo } from "react";
import classes from "./AdvertisementItem.module.css";
import useSWR from "swr";
import { IInlineAdvertisement } from "@/Components/Admin/InlineAds/AdminManageInlineAdsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HostedImage from "@/Components/UI/HostedImage";
import Link from "@/Components/i18n/Link";

const AdvertisementItem = ({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) => {
  // public endpoint: only an active, unexpired ad (the admin-only /auto
  // endpoint showed visitors an error box)
  const { data } = useSWR<IInlineAdvertisement>(
    `${API}/public/inlineAd/${id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { shouldRetryOnError: false },
  );

  const content = useMemo<ReactNode>(() => {
    if (!data) return null;
    return (
      <Fragment>
        <HostedImage
          src={data.image}
          alt={data.title || ""}
          fill
          style={{ objectFit: "cover" }}
          sizes="100dvw"
        />
        {!!data.title && <span className={classes.title}>{data.title}</span>}
        {!!data.subTitle && (
          <span className={classes.subTitle}>{data.subTitle}</span>
        )}
      </Fragment>
    );
  }, [data]);

  return (
    <Fragment>
      {!!data && (
        <Fragment>
          <Fragment>
            {data.target ? (
              <Link href={data.target} target="_blank" className={classes.main}>
                {content}
              </Link>
            ) : (
              <div className={classes.main}>{content}</div>
            )}
          </Fragment>
        </Fragment>
      )}
      {children}
    </Fragment>
  );
};

export default AdvertisementItem;
