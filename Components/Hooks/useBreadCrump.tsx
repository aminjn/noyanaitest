import { useCallback, useContext, useEffect, useState } from "react";
import BreadCrumpContext, { BreadCrumpTrail } from "../Store/BreadCrumpStore";

const useBreadCrump = (trail: BreadCrumpTrail) => {
  const { setTrail } = useContext(BreadCrumpContext);
  const [sat, setSat] = useState<boolean>(false);

  useEffect(() => {
    if (!sat) {
      setTrail(trail);
      setSat(true);
    }
  }, [sat, setTrail, trail]);
};

export default useBreadCrump;
