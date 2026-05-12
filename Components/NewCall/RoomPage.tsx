import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "../UI/Button";
import classes from "./RoomPage.module.css";
import { Device } from "mediasoup-client";
import useSocket from "../Hooks/useSocket";
import useNotification from "../Hooks/useNotification";

const DeviceLoader = ({
  device,
  setDevice,
}: {
  device: Device | null;
  setDevice: Dispatch<SetStateAction<Device | null>>;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [didInit, setDidInit] = useState<boolean>(false);

  const socket = useSocket();

  const pushNotification = useNotification();

  const initDevice = useCallback(async () => {
    if (!!device || !!isLoading) return;
    setIsLoading(true);
    const d = new Device();
    setDevice(d);
    const response = await socket.emitWithAck("getRtpCap");
    setIsLoading(false);
    if (response === "Error")
      return pushNotification("Server is Not Ready", "Error");
    d.load({ routerRtpCapabilities: response });
  }, [device, isLoading, pushNotification, setDevice, socket]);

  useEffect(() => {
    if (didInit) return;
    setDidInit(true);
    initDevice();
  }, [didInit, initDevice]);

  return (
    <Button onClick={initDevice} isLoading={isLoading}>
      {!!device ? "device Initialized" : "Init Device"}
    </Button>
  );
};

const StreamToggler = ({
  setStream,
  stream,
}: {
  stream: MediaStream | null;
  setStream: Dispatch<SetStateAction<MediaStream | null>>;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [didInit, setDidInit] = useState<boolean>(false);

  const pushNotification = useNotification();

  const onStart = useCallback(async () => {
    if (!!stream || isLoading) return;
    setIsLoading(true);
    try {
      const s = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(s);
    } catch (err) {
      pushNotification("Failed To get Stream", "Error");
      if (err instanceof Error) pushNotification(err.message, "Error");
    }
    setIsLoading(false);
  }, [isLoading, pushNotification, setStream, stream]);

  useEffect(() => {
    if (didInit) return;
    setDidInit(true);
    onStart();
  }, [didInit, onStart]);

  return (
    <Button onClick={onStart}>{!!stream ? "Feed is On" : "Feed is Off"}</Button>
  );
};

const ProduceTransportRequester = ({
  device,
  stream,
}: {
  device: Device;
  stream: MediaStream;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const socket = useSocket();

  const [didInit, setDidInit] = useState<boolean>(false);

  const onRequest = useCallback(async () => {
    if (!!isLoading) return;
    setIsLoading(true);
    const response = await socket.emitWithAck("requestTransport", {
      kind: "Produce",
    });
    const transport = device.createSendTransport(response);
    transport.on("connect", async ({ dtlsParameters }, callBack, errBack) => {
      const connectResponse = await socket.emitWithAck("connectTransport", {
        dtlsParameters,
        id: transport.id,
        kind: "Produce",
      });
      if (connectResponse === "Success") {
        callBack();
      } else if (connectResponse === "Error") {
        console.log("Couldnt Connect Produce Transport");
        errBack(new Error());
        setIsLoading(false);
      } else {
        console.log("Unknown Connect Signal Received");
        errBack(new Error());
        setIsLoading(false);
      }
      console.log(connectResponse);
    });
    transport.on("produce", async (parameters, callBack, errBack) => {
      console.log("Produce on Produce Transport Was Fired");
      console.log(parameters);
      const { kind, rtpParameters } = parameters;
      const startResponse = await socket.emitWithAck("startProducing", {
        kind,
        rtpParameters,
        transportId: transport.id,
      });
      console.log({ startResponse });
      if (startResponse === "Error") {
        console.log("Failed To Strat Producing");
        errBack(new Error());
      } else {
        callBack({ id: startResponse });
        console.log("Fully Connected");
      }
      setIsLoading(false);
    });
    transport.produce({ track: stream.getVideoTracks()[0] });
    transport.produce({ track: stream.getAudioTracks()[0] });
  }, [device, isLoading, socket, stream]);

  useEffect(() => {
    if (didInit) return;
    setDidInit(true);
    onRequest();
  }, [didInit, onRequest]);

  return (
    <Button onClick={onRequest} isLoading={isLoading}>
      {"Request Transport"}
    </Button>
  );
};

const RefreshConsumers = ({
  setAvailableProducers,
}: {
  setAvailableProducers: Dispatch<SetStateAction<string[]>>;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const socket = useSocket();

  const refreshAvailableProducers = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    const response = await socket.emitWithAck("getAvailableProducers");
    console.log({ response });
    setAvailableProducers(response);
    setIsLoading(false);
  }, [isLoading, setAvailableProducers, socket]);

  useEffect(() => {
    socket.on("producerChange", refreshAvailableProducers);
  }, [refreshAvailableProducers, socket]);

  return (
    <Button onClick={refreshAvailableProducers} isLoading={isLoading}>
      Refresh Producers
    </Button>
  );
};

const ConsumeTransportRequester = ({
  device,
  producer,
  setStream,
}: {
  device: Device;
  producer: string;
  setStream: Dispatch<SetStateAction<MediaStream | null>>;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [didInit, setDidInit] = useState<boolean>(false);

  const socket = useSocket();

  const pushNotification = useNotification();

  const onRequest = useCallback(async () => {
    if (!!isLoading) return;
    setIsLoading(true);
    const response = await socket.emitWithAck("requestTransport", {
      kind: "Consume",
    });
    const transport = device.createRecvTransport(response);
    transport.on("connect", async ({ dtlsParameters }, callBack, errBack) => {
      const connectResponse = await socket.emitWithAck("connectTransport", {
        dtlsParameters,
        id: transport.id,
        kind: "Consume",
      });
      if (connectResponse === "Success") {
        callBack();
      } else if (connectResponse === "Error") {
        console.log("Couldnt Connect Consume Transport");
        errBack(new Error());
        setIsLoading(false);
      } else {
        console.log("Unknown Connect Signal Received");
        errBack(new Error());
        setIsLoading(false);
      }
      console.log(connectResponse);
    });
    const consumeResponse = await socket.emitWithAck("initConsume", {
      producerId: producer,
      rtpCapabilities: device.recvRtpCapabilities,
      transportId: transport.id,
    });
    console.log(consumeResponse);
    if (consumeResponse === "Error") {
      console.log("Couldnt Consume");
      pushNotification("Couldn't Consume", "Error");
      setIsLoading(false);
    } else if (consumeResponse === "Cant") {
      pushNotification("Your Device Is Not Compatible", "Error");
      setIsLoading(false);
    } else {
      const consumer = await transport.consume({
        producerId: producer,
        id: consumeResponse.id,
        kind: consumeResponse.kind,
        rtpParameters: consumeResponse.rtpParameters,
      });
      const { track } = consumer;
      setStream(new MediaStream([track]));
      const resumeResponse = await socket.emitWithAck("resumeConsume", {
        consumerId: consumer.id,
      });
      if (resumeResponse === "Error") {
        pushNotification("Error Resuming Feed");
      }
      setIsLoading(false);
    }
  }, [device, isLoading, producer, pushNotification, setStream, socket]);

  useEffect(() => {
    if (didInit) return;
    setDidInit(true);
    onRequest();
  }, [didInit, onRequest]);

  return (
    <Button onClick={onRequest} isLoading={isLoading}>
      {"Request Transport"}
    </Button>
  );
};

const Consumer = ({
  producer,
  device,
}: {
  producer: string;
  device: Device;
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const isAudio = useMemo<boolean>(
    () => !!stream?.getAudioTracks().length,
    [stream],
  );

  return (
    <div className={classes.consumer}>
      {!!stream && (
        <Fragment>
          {isAudio ? (
            <audio
              autoPlay
              controls
              ref={(el) => {
                if (!el) return;
                el.srcObject = stream;
              }}
            />
          ) : (
            <video
              autoPlay
              ref={(el) => {
                if (!el) return;
                el.srcObject = stream;
              }}
              controls
            />
          )}
        </Fragment>
      )}
      <p>{producer}</p>
      <ConsumeTransportRequester
        device={device}
        producer={producer}
        setStream={setStream}
      />
    </div>
  );
};

const Self = ({ stream }: { stream: MediaStream }) => {
  return (
    <div className={classes.self}>
      <video
        muted
        ref={(el) => {
          if (!el) return;
          el.srcObject = stream;
        }}
        autoPlay
      />
    </div>
  );
};

const RoomPage = ({ roomName }: { roomName: string }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [availableProducers, setAvailableProducers] = useState<string[]>([]);

  return (
    <div className={classes.main}>
      <legend>{roomName}</legend>
      <div className={classes.actions}>
        <DeviceLoader device={device} setDevice={setDevice} />
        <StreamToggler stream={stream} setStream={setStream} />
        {!!device && !!stream && (
          <ProduceTransportRequester stream={stream} device={device} />
        )}
      </div>
      {!!device && (
        <RefreshConsumers setAvailableProducers={setAvailableProducers} />
      )}
      {!!device && (
        <div className={classes.consumers}>
          {availableProducers.map((producer) => (
            <Consumer device={device} key={producer} producer={producer} />
          ))}
        </div>
      )}
      {!!stream && <Self stream={stream} />}
    </div>
  );
};

export default RoomPage;
