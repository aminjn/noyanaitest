import { mutate } from "swr";
import {
  IRedirection,
  redirectionStatusCodes,
} from "./AdminManageRedirectionsPage";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "../UI/CreateForm";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const MutateRedirectionPopup = ({
  mutate,
  node,
}: {
  node?: IRedirection;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={node ? ta("ویرایش ریدایرکت") : ta("ریدایرکت جدید")}>
      <CreateForm
        style={{ width: "min(40rem , 90dvw)" }}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/redirection${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        renderer={{
          old: { type: "text", title: ta("قدیم") },
          current: { type: "text", title: ta("جدید") },
          statusCode: {
            type: "select",
            options: redirectionStatusCodes.reduce(
              (acc, el) => ({ ...acc, [el.toString()]: el }),
              {}
            ),
            title: ta("کد"),
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default MutateRedirectionPopup;
