import Link from "@/Components/i18n/Link";
import Button from "../UI/Button";
import LogoLong from "../UI/LogoLong";
import MobileInput from "../UI/MobileInput";
import classes from "./AuthPopup.module.css";
import useForm from "../Hooks/useForm";
import { API } from "../config";
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isMobile, isOTP } from "../helpers/Validators";
import Form from "../UI/Form";
import CodeInput from "../UI/CodeInput";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import SocketContext from "../Store/SocketContext";
import AuthShell from "./AuthShell";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

const authStages = ["init", "otp"] as const;
type AuthStage = (typeof authStages)[number];

type AuthContext = {
  phone: string;
  stage: AuthStage;
};

type StageProps = {
  ctx: AuthContext;
  setCtx: Dispatch<SetStateAction<AuthContext>>;
};

const OtpStage = ({ ctx, setCtx }: StageProps) => {
  const { refreshUser } = useUser(undefined);
  const { reconnect } = useContext(SocketContext);
  const { closePopup } = usePopup();
  const [code, setCode] = useState<string>("");
  const getContent = useScopedLocale(LOCALE_NS);
  const { isLoading, submit } = useForm({
    path: `${API}/auth`,
    method: "PATCH",
    mutator: () => ({ code, phone: `0${ctx.phone}` }),
    successCb: () => {
      refreshUser();
      reconnect();
      closePopup();
    },
    parser: "JSON",
  });

  return (
    <Form
      className={classes.form}
      onSubmit={() => {
        if (isLoading) return;
        if (!isOTP(code)) return;
        submit();
      }}
    >
      <legend className={classes.legend}>
        {getContent("verifyMobileNumber")}
      </legend>
      <div className={classes.middle}>
        <p
          className={classes.tip}
        >{getContent("enterCodeSentToX", [`0${ctx.phone}`])}</p>
        <button
          type="button"
          className={classes.back}
          onClick={() => setCtx((prev) => ({ ...prev, stage: "init" }))}
        >
          {getContent("editMobileNumber")}
        </button>
      </div>
      <CodeInput
        autoFocus
        style={{ marginBlock: "1rem" }}
        onChange={(e) => setCode(e)}
      />
      <div className={classes.resend}>
        <span>1:00</span>
        <span>{getContent("untilCodeResend")}</span>
      </div>
      <Button
        className={classes.submit}
        variant={isOTP(code) ? "Primary" : "Disable"}
        type="submit"
        mode="Fill"
        size="L"
        radius="High"
      >
        {getContent("login")}
      </Button>
    </Form>
  );
};

const InitStage = ({ ctx, setCtx }: StageProps) => {
  const { submit, isLoading } = useForm({
    path: `${API}/auth`,
    method: "POST",
    parser: "JSON",
    mutator: () => ({
      phone: `0${ctx.phone}`,
    }),
    successCb: () => setCtx((prev) => ({ ...prev, stage: "otp" })),
  });
  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <Form
      className={classes.form}
      onSubmit={() => {
        if (isLoading) return;
        if (isMobile(ctx.phone)) submit();
      }}
    >
      <legend className={classes.legend}>{getContent("loginOrSignup")}</legend>
      <p className={classes.tip} style={{ marginBottom: "1rem" }}>
        {getContent("verificationCodeWillBeSentToYourNumber")}
      </p>
      <MobileInput
        onChange={(e) => setCtx((prev) => ({ ...prev, phone: e.target.value }))}
        readOnly={isLoading}
        defaultValue={ctx.phone}
      />
      <Button
        variant={isMobile(ctx.phone) ? "Primary" : "Disable"}
        className={classes.submit}
        isLoading={isLoading}
        mode="Fill"
        type="submit"
        radius="High"
        size="L"
      >
        {getContent("confirmAndContinue")}
      </Button>
    </Form>
  );
};

const LoginPopup = ({
  setIsLogin,
}: {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
}) => {
  const [context, setContext] = useState<AuthContext>({
    phone: "",
    stage: "init",
  });

  const getContent = useScopedLocale(LOCALE_NS);

  const currentStage = useMemo<ReactNode>(() => {
    return {
      init: <InitStage ctx={context} setCtx={setContext} />,
      otp: <OtpStage ctx={context} setCtx={setContext} />,
    }[context.stage];
  }, [context]);

  return (
    <AuthShell>
      {currentStage}
      <Button
        onClick={() => setIsLogin(false)}
        variant="Primary"
        mode="Outline"
        radius="High"
        size="L"
        className={classes.switch}
      >
        {getContent("signup")}
      </Button>
    </AuthShell>
  );
};

export default LoginPopup;
