import { useCallback, useState } from "react";
import classes from "./JoinRoom.module.css";
import useNotification from "../Hooks/useNotification";
import useSocket from "../Hooks/useSocket";
import Form from "../UI/Form";
import Input from "../UI/Input";
import Button from "../UI/Button";

type JoinRoomResponse =
  | { state: "Error"; message: string; roomName?: never }
  | { state: "Success"; message?: never; roomName: string };

const JoinRoom = ({
  onSuccess,
}: {
  onSuccess: (roomName: string) => unknown;
}) => {
  const [input, setInput] = useState<
    Partial<{ userName: string; roomName: string }>
  >({});

  const socket = useSocket();

  const pushNotification = useNotification();

  const onSubmit = useCallback(async () => {
    if (!input.roomName || !input.userName)
      return pushNotification("Bad Input");
    const response: JoinRoomResponse = await socket.emitWithAck(
      "joinRoom",
      input,
    );
    if (response.state === "Error") return pushNotification(response.message);
    console.log(response);
    onSuccess(response.roomName);
  }, [input, onSuccess, pushNotification, socket]);

  return (
    <div className={classes.main}>
      <p className={classes.connectionStatus}>
        {socket.connected ? "Connected" : "Not Connected"}
      </p>
      <Form className={classes.form} onSubmit={onSubmit}>
        <Input
          title="Room"
          onChange={(e) =>
            setInput((prev) => ({ ...prev, roomName: e.target.value }))
          }
        />
        <Input
          title="Name"
          onChange={(e) =>
            setInput((prev) => ({ ...prev, userName: e.target.value }))
          }
        />
        <Button type="submit">Join</Button>
      </Form>
    </div>
  );
};

export default JoinRoom;
