import { Fragment, ReactNode, useMemo } from "react";
import classes from "./AdvertisementItem.module.css";
import useSWR from "swr";
import { IInlineAdvertisement } from "@/Components/Admin/InlineAds/AdminManageInlineAdsPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import Image from "next/image";
import { imagePath } from "@/Components/helpers/imagepath";
import Link from "next/link";

const AdvertisementItem = ({
  id,
  children,
}: {
  id: string;
  children?: ReactNode;
}) => {
  const { data, error } = useSWR<IInlineAdvertisement>(
    `${API}/auto/inlinead/${id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const content = useMemo<ReactNode>(() => {
    if (!data) return null;
    return (
      <Fragment>
        <Image
          src={imagePath(data.image)}
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
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <Fragment>
            {data.target ? (
              <Link href={data.target} target="_blank" className={classes.main}>
                {content}
              </Link>
            ) : (
              <div className={classes.main}>{content}</div>
            )}
          </Fragment>
        )}
      </HandleLoading>
      {children}
    </Fragment>
  );
};

export default AdvertisementItem;
