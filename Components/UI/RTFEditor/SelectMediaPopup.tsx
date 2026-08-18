import { IBlogMedia } from "@/Components/BlogMedia/AdminManageBlogMediasPage";
import classes from "./SelectMediaPopup.module.css";
import { MongoDoc } from "@/Components/Hooks/useUser";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateBlogMediaPopup from "@/Components/BlogMedia/MutateBlogMediaPopup";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Box from "@/Components/Admin/UI/Box";
import { useState } from "react";
import HostedImage from "@/Components/UI/HostedImage";
import IconButton from "@/Components/Admin/UI/IconButton";
import FullScreenIcon from "@/Components/Icons/FullScreenIcon";
import FullScreenImagePopup from "@/Components/Popups/FullScreenImagePopup";
import EditIcon from "@/Components/Icons/EditIcon";
import Input from "../Input";
import Button from "../Button";
import useNotification from "@/Components/Hooks/useNotification";

const SelectMediaPopup = ({
  onDone,
}: {
  onDone: (src: string, alt: string) => unknown;
}) => {
  const { data, error, mutate } = useSWR<IBlogMedia[]>(
    `${API}/auto/blogmedia`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const [selected, setSelected] = useState<IBlogMedia | null>(null);
  const [alt, setAlt] = useState<string>("");

  const pushNotification = useNotification();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          className={classes.main}
          title="انتخاب تصویر"
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateBlogMedia",
                  <MutateBlogMediaPopup mutate={mutate} />,
                ),
            },
          ]}
        >
          <div className={classes.container}>
            <div className={classes.actions}>
              <Input title="آلت" onChange={(e) => setAlt(e.target.value)} />
              <Button
                onClick={() => {
                  if (!selected)
                    return pushNotification(
                      "لطفا یک تصویر انتخاب کنید",
                      "Warn",
                    );
                  if (!selected.file)
                    return pushNotification(
                      "نتصویر انتخابی فایلی ندارد",
                      "Warn",
                    );
                  if (!alt)
                    return pushNotification("لطفا آلت را وارد کنید", "Warn");
                  onDone(selected.file, alt);
                }}
              >
                تایید
              </Button>
            </div>
            <div className={classes.items}>
              {data.map((media) => (
                <div
                  key={media._id}
                  className={`${classes.item} ${
                    selected?._id === media._id ? classes.activeItem : ""
                  }`}
                  onClick={() => setSelected(media)}
                >
                  <div className={classes.image}>
                    <HostedImage
                      src={media.file}
                      alt=""
                      style={{ objectFit: "contain" }}
                      fill
                      sizes="30rem"
                    />
                  </div>
                  <div className={classes.itemActions}>
                    <IconButton
                      variant="Neutral"
                      onClick={() =>
                        setPopup(
                          "FullscreenImagePreview",
                          <FullScreenImagePopup src={media.file} />,
                        )
                      }
                    >
                      <FullScreenIcon />
                    </IconButton>
                    <IconButton
                      variant="Info"
                      onClick={() =>
                        setPopup(
                          "MutateBlogMedia",
                          <MutateBlogMediaPopup
                            mutate={mutate}
                            defaultValue={media}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};
export default SelectMediaPopup;
