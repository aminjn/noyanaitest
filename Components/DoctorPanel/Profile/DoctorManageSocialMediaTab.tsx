import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import useSWR from "swr";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import { ContentKey } from "@/Components/Enums/contentKeys";
import useLocale from "@/Components/Hooks/useLocale";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import usePopup from "@/Components/Hooks/usePopup";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import MutateDoctorSocialMediaPopup from "./MutateDoctorSocailMediaPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteDoctorSocialMediaPopup from "./DeleteDoctorSocialMediaPopup";
import classes from "./DoctorManageSocialMediaTab.module.css";
import { ReactNode } from "react";
import InstagramIcon from "@/Components/Icons/InstagramIcon";
import TelegramIcon from "@/Components/Icons/TelegramIcon";
import WhatsappIcon from "@/Components/Icons/WhatsappIcon";

export const socialMedias = ["Instagram", "Telegarm", "Whatsapp"] as const;

export type SocialMedia = (typeof socialMedias)[number];

export const socialMediaDict: Record<SocialMedia, ContentKey> = {
  Instagram: "instagram",
  Whatsapp: "whatsapp",
  Telegarm: "telegram",
};

export const socialMediaIcons: Record<SocialMedia, ReactNode> = {
  Instagram: <InstagramIcon />,
  Telegarm: <TelegramIcon />,
  Whatsapp: <WhatsappIcon />,
};

export type DoctorSocialMediaPopulation = Population<{
  Doctor: DoctorProfilePopulation;
}>;
export interface IDoctorSocialMedia<
  T extends DoctorSocialMediaPopulation = DoctorSocialMediaPopulation
> extends MongoDoc {
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  target: string;
  media: SocialMedia;
}

const DoctorManageSocialMediaTab = () => {
  const { data, error, mutate } = useSWR<IDoctorSocialMedia[]>(
    `${API}/doctor/social`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          className={classes.main}
          title={getContent("socialMedias")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "MutateDoctorSocialMedia",
                  <MutateDoctorSocialMediaPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            name="DoctorManageSocialMedias"
            data={data}
            renderer={{
              media: {
                name: getContent("socialMediaName"),
                value: (node) => getContent(socialMediaDict[node.media]),
                filter: "Text",
              },
              target: {
                name: getContent("socialMediaLink"),
                value: (node) => node.target,
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateDoctorSocialMedia",
                          <MutateDoctorSocialMediaPopup
                            mutate={mutate}
                            node={node}
                          />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorSocialMedia",
                          <DeleteDoctorSocialMediaPopup
                            mutate={mutate}
                            node={node}
                          />
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default DoctorManageSocialMediaTab;
