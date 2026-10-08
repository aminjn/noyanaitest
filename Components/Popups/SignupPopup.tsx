import {
  Dispatch,
  Fragment,
  SetStateAction,
  useContext,
  useState,
} from "react";
import DateInput from "../UI/DateInput";
import useForm from "../Hooks/useForm";
import { API } from "../config";
import MobileInput from "../UI/MobileInput";
import Input from "../UI/Input";
import Button from "../UI/Button";
import classes from "./SignupPopup.module.css";
import PopupCard from "../UI/PopupCard";
import CodeInput from "../UI/CodeInput";
import { isOTP } from "../helpers/Validators";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import SocketContext from "../Store/SocketContext";
import AuthShell from "./AuthShell";
import { tmdMedium } from "../UI/Typography";
import OtpResend, { otpWait, OtpSendReply } from "../UI/OtpResend";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common"];

type SignupInput = { birthDate: Date; phone: string; nationalId: string };

type CodeInputType = { code: string };
const SignupPopup = ({
  setIsLogin,
}: {
  setIsLogin: Dispatch<SetStateAction<boolean>>;
}) => {
  const { refreshUser } = useUser();

  const { closePopup } = usePopup();

  const [isCodeStage, setIsCodeStage] = useState<boolean>(false);
  const [sent, setSent] = useState({ wait: 60, at: 0, recent: false });
  const { setInput, isLoading, submit, input } = useForm<SignupInput, OtpSendReply>({
    path: `${API}/auth/signup`,
    method: "POST",
    //TODO:add validation
    mutator: (inp) => ({ ...inp, phone: `0${inp.phone}` }),
    successCb: (reply: OtpSendReply) => {
      setSent({ wait: otpWait(reply), at: Date.now(), recent: reply?.data?.sent === false });
      setIsCodeStage(true);
    },
  });

  const { reconnect } = useContext(SocketContext);

  const getContent = useScopedLocale(LOCALE_NS);

  const {
    setInput: setCodeInput,
    isLoading: isCodeLoading,
    submit: submitCode,
  } = useForm<CodeInputType>({
    path: `${API}/auth`,
    method: "PATCH",
    mutator: (inp) => ({ code: inp.code, phone: `0${input.phone}` }),
    hasProblem: (inp) => {
      if (!isOTP(inp.code)) return getContent("checkInput");
    },
    successCb: () => {
      refreshUser();
      reconnect();
      closePopup();
    },
    parser: "JSON",
  });

  return (
    <AuthShell>
      <div className={classes.main}>
        <legend className={`${classes.title} ${tmdMedium}`}>
          {getContent("signup")}
        </legend>
        {isCodeStage ? (
          <Fragment>
            <CodeInput
              onChange={(e) => setCodeInput((prev) => ({ ...prev, code: e }))}
            />
            <OtpResend
              wait={sent.wait}
              startedAt={sent.at}
              recent={sent.recent}
              isLoading={isLoading}
              onResend={() => submit()}
            />
            <Button
              onClick={() => submitCode()}
              isLoading={isCodeLoading}
              className={classes.action}
              variant="Primary"
              mode="Fill"
              size="L"
              radius="High"
            >
              {getContent("confirm")}
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <DateInput
              title={getContent("dateOfBirth")}
              onChange={(e) => setInput((prev) => ({ ...prev, birthDate: e }))}
              readOnly={isLoading}
            />
            <MobileInput
              readOnly={isLoading}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <Input
              title={getContent("nationalCode")}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, nationalId: e.target.value }))
              }
            />
            <Button
              onClick={submit}
              style={{ marginTop: "5rem" }}
              className={classes.action}
              variant="Primary"
              mode="Fill"
              size="L"
              radius="High"
            >
              {getContent("confirm")}
            </Button>
          </Fragment>
        )}
      </div>
      <Button
        onClick={() => setIsLogin(true)}
        variant="Primary"
        mode="Outline"
        radius="High"
        size="L"
        className={classes.switch}
      >
        {getContent("login")}
      </Button>
    </AuthShell>
  );
};

export default SignupPopup;
