import { useState } from "react";
import LoginPopup from "./LoginPopup";
import SignupPopup from "./SignupPopup";

const AuthPopup = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  return isLogin ? (
    <LoginPopup setIsLogin={setIsLogin} />
  ) : (
    <SignupPopup setIsLogin={setIsLogin} />
  );
};

export default AuthPopup;
