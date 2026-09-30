"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import { ta } from "@/Components/Admin/i18n/adminText";
import NodeManager from "../UI/NodeManger";
import { aboutTeamFormRenderer, IAboutTeam } from "./AdminManageAboutTeamsPage";

const AdminManageAboutTeamPage = () => {
  return (
    <NodeManager<IAboutTeam>
      deleteBackTo="/aboutPage?tab=team"
      modelName="aboutTeam"
      getTitle={(node) => node.name || ta("بدون نام")}
      content={({ mutate, node }) => (
        <CreateForm
          renderer={aboutTeamFormRenderer}
          defaultValue={node}
          hookProps={{
            path: `${API}/auto/aboutTeam/${node._id}`,
            method: "POST",
            successCb: () => {
              mutate();
            },
          }}
        />
      )}
    />
  );
};

export default AdminManageAboutTeamPage;
