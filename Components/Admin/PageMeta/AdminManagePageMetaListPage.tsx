"use client";

import WithTitle from "../UI/WithTitle";
import TabSystem, { TabSystemTab } from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import PageMetaEditor from "./PageMetaEditor";
import {
  pageMetaListResourceTypeLabels,
  pageMetaListResourceTypes,
} from "./pageMetaConstants";

const AdminManagePageMetaListPage = () => {
  const items: TabSystemTab[] = pageMetaListResourceTypes.map(
    (resourceType) => ({
      id: resourceType,
      title: pageMetaListResourceTypeLabels[resourceType],
      icon: <InfoIcon />,
      content: <PageMetaEditor resourceType={resourceType} />,
    }),
  );

  return (
    <WithTitle title="متادیتای صفحات لیست">
      <TabSystem name="AdminManagePageMetaList" items={items} />
    </WithTitle>
  );
};

export default AdminManagePageMetaListPage;
