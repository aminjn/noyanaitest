import { useState } from "react";
import LoginPopup from "./LoginPopup";
import SignupPopup from "./SignupPopup";

const AuthPopup = ({ signup }: { signup?: boolean }) => {
  const [isLogin, setIsLogin] = useState<boolean>(!signup);
  return isLogin ? (
    <LoginPopup setIsLogin={setIsLogin} />
  ) : (
    <SignupPopup setIsLogin={setIsLogin} />
  );
};

export default AuthPopup;
