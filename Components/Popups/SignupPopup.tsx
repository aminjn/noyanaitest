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
import useLocale from "../Hooks/useLocale";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import SocketContext from "../Store/SocketContext";

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
  const { setInput, isLoading, submit, input } = useForm<SignupInput>({
    path: `${API}/auth/signup`,
    method: "POST",
    //TODO:add validation
    mutator: (inp) => ({ ...inp, phone: `0${inp.phone}` }),
    successCb: () => {
      setIsCodeStage(true);
    },
  });

  const { reconnect } = useContext(SocketContext);

  const getContent = useLocale();

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
    <PopupCard>
      <div className={classes.main}>
        {isCodeStage ? (
          <Fragment>
            <CodeInput
              onChange={(e) => setCodeInput((prev) => ({ ...prev, code: e }))}
            />
            <Button onClick={() => submitCode()} isLoading={isCodeLoading}>
              {getContent("confirm")}
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <DateInput
              title="تاریخ تولد"
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
              title="کد ملی"
              onChange={(e) =>
                setInput((prev) => ({ ...prev, nationalId: e.target.value }))
              }
            />
            <Button onClick={submit}>تایید</Button>
          </Fragment>
        )}
        <button onClick={() => setIsLogin(true)}>ورود</button>
      </div>
    </PopupCard>
  );
};

export default SignupPopup;
