import { useMemo } from "react";
import PanelSidebar, { LinkMap } from "./PanelSidebar";
import UserEditIcon from "../Icons/UserEditIcon";
import CartIcon from "../Icons/CartIcon";
import FolderIcon from "../Icons/FolderIcon";

const PharmacyPanelSidebar = () => {
  const links = useMemo<LinkMap>(
    () => [
      {
        title: "secrataries",
        icon: <UserEditIcon />,
        show: true,
        target: "secretary",
      },
      {
        title: "products",
        icon: <CartIcon />,
        show: true,
        target: "product",
      },
      {
        title: "productPackages",
        icon: <FolderIcon />,
        show: true,
        target: "productPackage",
      },
      {
        title: "prescriptions",
        icon: <UserEditIcon />,
        show: true,
        target: "prescription",
      },
      { title: "tamin", show: true, icon: <UserEditIcon />, target: "tamin" },
    ],
    [],
  );

  return <PanelSidebar links={links} panel="pharmacypanel" />;
};

export default PharmacyPanelSidebar;
