"use client";

import { API } from "@/Components/config";
import CreateForm from "../UI/CreateForm";
import NodeManager from "../UI/NodeManger";
import { aboutTeamFormRenderer, IAboutTeam } from "./AdminManageAboutTeamsPage";

const AdminManageAboutTeamPage = () => {
  return (
    <NodeManager<IAboutTeam>
      modelName="aboutTeam"
      getTitle={(node) => node.name || node._id}
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
