"use client";

import AdminSectionHub from "../UI/AdminSectionHub";
import useHubTabAccess from "../UI/useHubTabAccess";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminManageAdvertisementsPage from "@/Components/Admin/Advertisement/AdminManageAdvertisementsPage";
import AdminManageInlineAdsPage from "@/Components/Admin/InlineAds/AdminManageInlineAdsPage";

// تبلیغات (2026-09 audit): banner and inline (text) ads were two menu items.
const AdsHub = () => {
  const canOpen = useHubTabAccess();
  return (
    <AdminSectionHub
      title={ta("تبلیغات")}
      tabs={[
        {
          id: "banners",
          title: ta("بنرها"),
          exclude: !canOpen("Advertisement"),
          content: <AdminManageAdvertisementsPage />,
        },
        {
          id: "inline",
          title: ta("تبلیغات خطی"),
          exclude: !canOpen("InlineAdvertisement"),
          content: <AdminManageInlineAdsPage />,
        },
      ]}
    />
  );
};

export default AdsHub;
