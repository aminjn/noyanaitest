import CreateForm from "@/Components/Admin/UI/CreateForm";
import {
  IDoctorSocialMedia,
  socialMediaDict,
  socialMedias,
} from "./DoctorManageSocialMediaTab";
import classes from "./MutateDoctorSocailMediaPopup.module.css";
import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];
const MutateDoctorSocialMediaPopup = ({
  mutate,
  node,
}: {
  node?: IDoctorSocialMedia;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  return (
    <PopupCard>
      <CreateForm
        style={{ width: "min(90dvw , 40rem)" }}
        onCancel={() => {
          closePopup();
        }}
        hookProps={{
          path: `${API}/doctor/social${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        defaultValue={node}
        renderer={{
          media: {
            type: "select",
            title: getContent("socialMediaName"),
            options: socialMedias.reduce(
              (acc, el) => ({ ...acc, [el]: getContent(socialMediaDict[el]) }),
              {}
            ),
          },
          target: { title: getContent("socialMediaLink"), type: "text" },
        }}
      />
    </PopupCard>
  );
};

export default MutateDoctorSocialMediaPopup;
