import useSWR from "swr";
import classes from "./SelectAdPopup.module.css";
import { IInlineAdvertisement } from "@/Components/Admin/InlineAds/AdminManageInlineAdsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateInlineAdPopup from "@/Components/Admin/InlineAds/MutateInlineAdPopup";
import AdvertisementItem from "./AdvertisementItem";
import { useState } from "react";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import Button from "../Button";
import useNotification from "@/Components/Hooks/useNotification";

const SelectAdPopup = ({ onDone }: { onDone: (id: string) => unknown }) => {
  const { data, error, mutate } = useSWR<IInlineAdvertisement[]>(
    `${API}/auto/inlinead`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const [selected, setSelected] = useState<IInlineAdvertisement | null>(null);

  const pushNotification = useNotification();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title="انتخاب تبلیغ"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateInlineAd",
                  <MutateInlineAdPopup mutate={mutate} />
                ),
            },
          ]}
          className={classes.main}
        >
          <Button
            className={classes.action}
            onClick={() => {
              if (!selected)
                return pushNotification(
                  "لطفا یک مورد را انتخاب فرمایید",
                  "Warn"
                );
              onDone(selected._id);
            }}
          >
            اضافه کن
          </Button>
          <div className={classes.list}>
            {data.map((ad) => (
              <div
                key={ad._id}
                className={`${classes.adItem} ${
                  selected?._id === ad._id ? classes.selected : ""
                }`}
                onClick={() => setSelected(ad)}
              >
                <div className={classes.adContent}>
                  <AdvertisementItem id={ad._id} />
                </div>
                <div className={classes.adActions}>
                  <IconButton
                    onClick={() =>
                      setPopup(
                        "MutateInlineAd",
                        <MutateInlineAdPopup mutate={mutate} node={ad} />
                      )
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default SelectAdPopup;
