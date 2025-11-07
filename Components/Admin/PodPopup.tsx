import { Fragment, useState } from "react";
import Button from "../UI/Button";
import Act from "../UI/Act";
import { API } from "../config";

const PodPopup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Fragment>
      <Button onClick={() => setIsLoading(true)} isLoading={isLoading}>
        Go
      </Button>
      <Act
        path={isLoading ? `${API}/admin/pod` : null}
        method="GET"
        onDone={() => setIsLoading(false)}
      />
    </Fragment>
  );
};

export default PodPopup;
