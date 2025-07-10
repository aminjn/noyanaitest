import { AdminProps } from "@/app/[adminKey]/page";
import { adminKey } from "@/Components/config";
import { notFound } from "next/navigation";
import { ReactNode } from "react";

const CheckAdminKey = ({
  providedAdminKey,
  children,
}: {
  providedAdminKey: string;
  children: ReactNode;
}) => {
  if (providedAdminKey !== adminKey) return notFound();
  return children;
};

export default CheckAdminKey;
