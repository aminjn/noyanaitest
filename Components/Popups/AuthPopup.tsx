import Link from "next/link";
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
  useEffect,
  useMemo,
  useState,
} from "react";
import { isMobile, isOTP } from "../helpers/Validators";
import Form from "../UI/Form";
import CodeInput from "../UI/CodeInput";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";

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
  const { closePopup } = usePopup();
  const [code, setCode] = useState<string>("");
  const { isLoading, submit } = useForm({
    path: `${API}/auth`,
    method: "PATCH",
    mutator: () => ({ code, phone: `0${ctx.phone}` }),
    successCb: () => {
      refreshUser();
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
      <legend className={classes.legend}>تایید شماره موبایل</legend>
      <div className={classes.middle}>
        <p
          className={classes.tip}
        >{`کد ارسال شده به 0${ctx.phone} را وارد کنید`}</p>
        <button
          type="button"
          className={classes.back}
          onClick={() => setCtx((prev) => ({ ...prev, stage: "init" }))}
        >
          ویرایش شماره موبایل
        </button>
      </div>
      <CodeInput style={{ marginBlock: "1rem" }} onChange={(e) => setCode(e)} />
      <div className={classes.resend}>
        <span>1:00</span>
        <span>تا دریافت مجدد کد</span>
      </div>
      <Button
        className={classes.submit}
        variant={isOTP(code) ? "Primary" : "Neutral"}
        type="submit"
      >
        ورود
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

  return (
    <Form
      className={classes.form}
      onSubmit={() => {
        if (isLoading) return;
        if (isMobile(ctx.phone)) submit();
      }}
    >
      <legend className={classes.legend}>ورود/ثبت‌نام</legend>
      <p className={classes.tip} style={{ marginBottom: "1rem" }}>
        کد تایید به شماره‌ای که وارد می‌کنید ارسال خواهد شد
      </p>
      <MobileInput
        onChange={(e) => setCtx((prev) => ({ ...prev, phone: e.target.value }))}
        readOnly={isLoading}
        defaultValue={ctx.phone}
      />
      <Button
        variant={isMobile(ctx.phone) ? "Primary" : "Neutral"}
        className={classes.submit}
        isLoading={isLoading}
        type="submit"
      >
        تایید و ادامه
      </Button>
    </Form>
  );
};

const AuthPopup = () => {
  const { user } = useUser(undefined);

  const [context, setContext] = useState<AuthContext>({
    phone: "",
    stage: "init",
  });

  const { closePopup } = usePopup();

  useEffect(() => {
    if (!!user) closePopup();
  }, [closePopup, user]);

  const currentStage = useMemo<ReactNode>(() => {
    return {
      init: <InitStage ctx={context} setCtx={setContext} />,
      otp: <OtpStage ctx={context} setCtx={setContext} />,
    }[context.stage];
  }, [context]);

  return (
    <div className={classes.main}>
      <div className={classes.logo}>
        <LogoLong width={174} height={64} />
      </div>
      {currentStage}
      <p className={classes.notice}>
        با ورود و ثبت نام در سایت،با{" "}
        <Link className={classes.inlineLink} href={"/policy"}>
          قوانین نویان
        </Link>{" "}
        موافقت می‌کنم
      </p>
    </div>
  );
};

export default AuthPopup;
