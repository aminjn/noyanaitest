"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

export type BreadCrumpTrail = { title: string; target: string }[];

const BreadCrumpContext = createContext<{
  trail: BreadCrumpTrail;
  setTrail: Dispatch<SetStateAction<BreadCrumpTrail>>;
}>({ setTrail: () => {}, trail: [] });

export const BreadCrumpContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [trail, setTrail] = useState<BreadCrumpTrail>([]);
  return (
    <BreadCrumpContext.Provider value={{ setTrail, trail }}>
      {children}
    </BreadCrumpContext.Provider>
  );
};

export default BreadCrumpContext;
