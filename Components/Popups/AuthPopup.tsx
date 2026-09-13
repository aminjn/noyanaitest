import { useEffect, useState } from "react";
import LoginPopup from "./LoginPopup";
import SignupPopup from "./SignupPopup";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";

const AuthPopup = ({ signup }: { signup?: boolean }) => {
  const { user } = useUser(undefined);

  const { closePopup } = usePopup();

  useEffect(() => {
    if (!!user) closePopup();
  }, [closePopup, user]);
  
  const [isLogin, setIsLogin] = useState<boolean>(!signup);
  return isLogin ? (
    <LoginPopup setIsLogin={setIsLogin} />
  ) : (
    <SignupPopup setIsLogin={setIsLogin} />
  );
};

export default AuthPopup;
