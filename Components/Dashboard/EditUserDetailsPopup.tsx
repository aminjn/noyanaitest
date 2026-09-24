import Loading from "../Admin/UI/Loading";
import useUser, { IUser } from "../Hooks/useUser";
import PopupCard from "../UI/PopupCard";
import classes from "./EditUserDetailsPopup.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import HostedImage from "../UI/HostedImage";
import Ixon from "../UI/Ixon";
import { useState } from "react";
import useForm from "../Hooks/useForm";
import Act from "../UI/Act";
import { API } from "../config";
import IconButton from "../Admin/UI/IconButton";
import UplaodImageIcon from "../Icons/UploadImageIcon";
import Input from "../UI/Input";
import usePopup from "../Hooks/usePopup";
import Button from "../UI/Button";
import FormActions from "../Admin/UI/FormActions";

const NS: ContentNamespace[] = ["common", "dashboardEditUserDetailsPopup"];

const EditUserDetailsPopup = () => {
  const { user, refreshUser } = useUser();

  const getContent = useScopedLocale(NS);

  const [isUploading, setIsUploading] = useState<{ avatar: File } | null>(null);

  const { closePopup } = usePopup();

  const { setInput, submit, isLoading } = useForm<IUser>({
    path: `${API}/user`,
    method: "POST",
    successCb: () => {
      refreshUser();
      closePopup();
    },
  });

  if (!user) return <Loading />;
  return (
    <PopupCard>
      <div className={classes.main}>
        <div className={classes.imageBox}>
          <div className={classes.image}>
            <HostedImage
              alt={user.username || getContent("notAssigned")}
              src={user.avatar}
              fill
              sizes="10rem"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={classes.imageInputBox}>
            <input
              className={classes.imageInput}
              type="file"
              accept="image/*"
              disabled={!!isUploading}
              onChange={(e) => {
                if (!!isUploading) return;
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading({ avatar: file });
              }}
            />
            <Ixon>
              <UplaodImageIcon />
            </Ixon>
          </div>
        </div>
        <Input
          title={getContent("username")}
          defaultValue={user.username}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, username: e.target.value }))
          }
        />
        <FormActions>
          <Button type="submit" onClick={submit} isLoading={isLoading}>
            {getContent("submit")}
          </Button>
          <Button type="button" onClick={() => closePopup()} variant="Neutral">
            {getContent("cancel")}
          </Button>
        </FormActions>
      </div>
      <Act
        path={isUploading ? `${API}/user` : null}
        method="POST"
        onDone={(status) => {
          setIsUploading(null);
          if (!status) return;
          refreshUser();
        }}
        payload={isUploading || undefined}
        parser="FORM"
      />
    </PopupCard>
  );
};

export default EditUserDetailsPopup;
