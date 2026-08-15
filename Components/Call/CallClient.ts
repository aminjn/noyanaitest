/**
 * Client-side implementation of the backend call service documented in
 * `noyanai-back/CALL_SERVICE.md`. Two exports:
 *
 * - `CallApi`   - plain REST calls (create/list/history/end/kick/mute/record).
 *                 Stateless, usable anywhere (call history pages, an
 *                 "incoming call" banner, admin tooling, etc).
 * - `CallClient` - a stateful class for ONE active call session: joins the
 *                 room over the shared socket, drives mediasoup-client
 *                 (Device/Transport/Producer/Consumer), and emits typed
 *                 events for the UI to render. Framework-agnostic - no React
 *                 imports - so it's easy to wrap in a hook or use as-is.
 *
 * This file only runs in the browser (getUserMedia, mediasoup-client). Only
 * import it from client components.
 */

import { Socket } from "socket.io-client";
import { Device } from "mediasoup-client";
import type {
  Transport,
  Producer,
  Consumer,
  RtpCapabilities,
  RtpParameters,
  MediaKind,
  TransportOptions,
} from "mediasoup-client/types";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";

// ---------------------------------------------------------------------------
// Types mirroring the backend (Services/Call/types.ts + Models/*)
// ---------------------------------------------------------------------------

export type CallType = "voice" | "video";
export type CallSource = "adhoc" | "booking";
export type CallStatus = "ringing" | "active" | "ended" | "cancelled";
export type CallParticipantRole = "host" | "guest";
export type MediaTag = "mic" | "webcam" | "screenVideo" | "screenAudio";
export type MuteKind = "audio" | "video";

export interface ICallRoom {
  _id: string;
  initiator?: string;
  host?: string;
  participants: string[];
  callType: CallType;
  source: CallSource;
  booking?: string;
  status: CallStatus;
  startedAt: string;
  connectedAt?: string;
  endedAt?: string;
  recordingEnabled: boolean;
  maxParticipants: number;
}

export interface ICallParticipant {
  _id: string;
  room: string;
  user: string;
  role: CallParticipantRole;
  status: "invited" | "joined" | "left" | "kicked" | "rejected" | "missed";
  audioMuted: boolean;
  videoMuted: boolean;
  forceMuted: boolean;
  screenSharing: boolean;
}

export interface ProducerInfo {
  producerId: string;
  userId: string;
  mediaTag: MediaTag;
}

type ApiEnvelope<T> = { message: string; data: T };

// ---------------------------------------------------------------------------
// REST - Services/Call is fronted by /api/v1/call, see CALL_SERVICE.md §3
// ---------------------------------------------------------------------------

export const CallApi = {
  start: (payload: { participantIds: string[]; callType: CallType }) =>
    fetcher<ApiEnvelope<ICallRoom>>({
      url: `${API}/call`,
      method: "POST",
      payload,
      // The backend parses this route with upload.none() (multipart) and
      // JSON.parses the participantIds field back into an array - so it
      // must arrive as a stringified form field, not a JSON body.
      bodyParser: "FORM",
    }).then((r) => r.data),

  startFromBooking: (bookingId: string, callType?: CallType) =>
    fetcher<ApiEnvelope<ICallRoom>>({
      url: `${API}/call/booking/${bookingId}`,
      method: "POST",
      payload: callType ? { callType } : undefined,
    }).then((r) => r.data),

  getOngoing: () =>
    fetcher<ApiEnvelope<ICallRoom[]>>({ url: `${API}/call` }).then(
      (r) => r.data,
    ),

  getHistory: (page = 1, limit?: number) =>
    fetcher<
      ApiEnvelope<{
        data: ICallRoom[];
        total: number;
        page: number;
        limit: number;
      }>
    >({
      url: `${API}/call/history?page=${page}${limit ? `&limit=${limit}` : ""}`,
    }).then((r) => r.data),

  getOne: (roomId: string) =>
    fetcher<ApiEnvelope<{ room: ICallRoom; connectedUserIds: string[] }>>({
      url: `${API}/call/${roomId}`,
    }).then((r) => r.data),

  answer: (roomId: string) =>
    fetcher({ url: `${API}/call/${roomId}/answer`, method: "POST" }),

  reject: (roomId: string) =>
    fetcher({ url: `${API}/call/${roomId}/reject`, method: "POST" }),

  leave: (roomId: string) =>
    fetcher({ url: `${API}/call/${roomId}/leave`, method: "PUT" }),

  end: (roomId: string) =>
    fetcher({ url: `${API}/call/${roomId}`, method: "DELETE" }),

  kick: (roomId: string, targetUserId: string) =>
    fetcher({
      url: `${API}/call/${roomId}/kick`,
      method: "POST",
      payload: { targetUserId },
    }),

  mute: (
    roomId: string,
    targetUserId: string,
    kind: MuteKind,
    muted: boolean,
  ) =>
    fetcher({
      url: `${API}/call/${roomId}/mute`,
      method: "POST",
      payload: { targetUserId, kind, muted },
    }),

  startRecording: (roomId: string) =>
    fetcher({ url: `${API}/call/${roomId}/recording/start`, method: "POST" }),

  stopRecording: (roomId: string) =>
    fetcher({ url: `${API}/call/${roomId}/recording/stop`, method: "POST" }),

  getRecordings: (roomId: string) =>
    fetcher<ApiEnvelope<unknown[]>>({
      url: `${API}/call/${roomId}/recordings`,
    }).then((r) => r.data),
};

/**
 * Ask the server to re-emit "call:incoming" for any call this socket's user
 * was invited to that's still ringing. Call this once you're already
 * listening for "call:incoming" (e.g. right after `socket.on("call:incoming",
 * ...)` in whatever component owns that listener, such as a global
 * "incoming call" manager) - and again on every "connect" event (covers a
 * fresh page load and any reconnect).
 *
 * This is deliberately pull-based rather than the server pushing it
 * automatically when the socket connects: a server-side push fired from the
 * connection handler can race the client attaching its listener (which only
 * happens once React has mounted/run that component's effect) and get
 * silently dropped if the listener isn't there yet. Asking for it explicitly,
 * after the listener already exists, makes this race-free.
 */
export const checkPendingIncomingCalls = (socket: Socket): void => {
  socket.emit("call:checkPending");
};

// ---------------------------------------------------------------------------
// Tiny typed event emitter (no external dependency needed)
// ---------------------------------------------------------------------------

export type CallClientEventMap = {
  /** Someone invited you to a call - reaches you on your personal channel,
   *  independent of whether you've joined any call room yet. */
  incoming: {
    roomId: string;
    callType: CallType;
    initiator: string;
    initiatorPhone?: string;
    initiatorUsername?: string;
  };
  /** join() finished: transports are up, local media (if any) is publishing,
   *  existing remote producers are being consumed. */
  joined: { roomId: string; role: CallParticipantRole };
  /** One of your own tracks started publishing. */
  localTrack: { mediaTag: MediaTag; track: MediaStreamTrack };
  /** A remote participant's track is ready to render. */
  remoteTrack: {
    userId: string;
    mediaTag: MediaTag;
    producerId: string;
    track: MediaStreamTrack;
  };
  /** Stop rendering this track - the remote participant closed/paused it away. */
  remoteTrackClosed: {
    userId: string;
    producerId: string;
    mediaTag?: MediaTag;
  };
  participantJoined: { userId: string; role: CallParticipantRole };
  participantLeft: { userId: string; reason: "left" | "kicked" };
  participantRejected: { userId: string };
  /** `forced: true` means the host did it, not the participant themselves. */
  muteChanged: {
    userId: string;
    kind: MuteKind;
    muted: boolean;
    forced: boolean;
  };
  /** The host force-muted/unmuted YOU specifically. */
  youWereMuted: { kind: MuteKind; muted: boolean };
  /** You were removed from the call - local state is already torn down by
   *  the time this fires. */
  kicked: { roomId: string };
  /** Ring timed out / everyone declined before anyone joined. */
  cancelled: { roomId: string; reason?: string };
  /** Call is over for everyone - local state is already torn down. */
  ended: { roomId: string; reason?: string };
  recordingStarted: { roomId: string };
  recordingStopped: { roomId: string };
  error: { message: string; context?: string };
};

type Listener<T> = (payload: T) => void;

class TypedEmitter<TEvents extends Record<string, unknown>> {
  private listeners: { [K in keyof TEvents]?: Set<Listener<TEvents[K]>> } = {};

  on<K extends keyof TEvents>(
    event: K,
    listener: Listener<TEvents[K]>,
  ): () => void {
    let set = this.listeners[event];
    if (!set) {
      set = new Set();
      this.listeners[event] = set;
    }
    set.add(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): void {
    this.listeners[event]?.delete(listener);
  }

  protected emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    this.listeners[event]?.forEach((listener) => listener(payload));
  }
}

// ---------------------------------------------------------------------------
// CallClient - one instance == one active call session
// ---------------------------------------------------------------------------

type AckResponse<T> = { ok: true; data: T } | { ok: false; error: string };

// Structurally identical to whatever object literal we pass as `appData` to
// transport.produce() below - naming it lets the `producers` map below be
// typed as `Producer<LocalProducerAppData>` everywhere instead of the
// generic (and therefore incompatible-by-getter/setter-variance) `Producer`.
type LocalProducerAppData = { mediaTag: MediaTag };

export type JoinOptions = {
  /** Publish the mic by default. Default true. */
  audio?: boolean;
  /** Publish the webcam. Default false (set true for video calls, or rely
   *  on `stream` instead if you already grabbed one for a preview). */
  video?: boolean;
  /** Already-acquired MediaStream (e.g. from a pre-join camera preview).
   *  Takes precedence over audio/video. */
  stream?: MediaStream;
  /** Set to false to join without publishing anything yet - call
   *  `publish()` later once you're ready (e.g. after a "ready" button). */
  autoPublish?: boolean;
};

export class CallClient extends TypedEmitter<CallClientEventMap> {
  readonly socket: Socket;
  /** Your own user id - used only to ignore the echo of your own producers
   *  coming back on "call:newProducer" (the server broadcasts to the whole
   *  room, including yourself). */
  private readonly userId: string;

  private roomId: string | null = null;
  private role: CallParticipantRole | null = null;
  private device: Device | null = null;
  private sendTransport: Transport | null = null;
  private recvTransport: Transport | null = null;
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private producers: Map<MediaTag, Producer<LocalProducerAppData>> = new Map();
  private consumers: Map<string, Consumer> = new Map(); // key: producerId
  private consumerMediaTags: Map<string, MediaTag> = new Map(); // key: producerId

  constructor(socket: Socket, userId: string) {
    super();
    this.socket = socket;
    this.userId = userId;
    this.socket.on("call:incoming", this.onIncoming);
    this.socket.on("call:newProducer", this.onNewProducer);
    this.socket.on("call:producerClosed", this.onProducerClosed);
    this.socket.on("call:participantJoined", this.onParticipantJoined);
    this.socket.on("call:participantLeft", this.onParticipantLeft);
    this.socket.on("call:participantRejected", this.onParticipantRejected);
    this.socket.on("call:participantMuteChanged", this.onMuteChanged);
    this.socket.on("call:youWereMuted", this.onYouWereMuted);
    this.socket.on("call:kicked", this.onKicked);
    this.socket.on("call:cancelled", this.onCancelled);
    this.socket.on("call:ended", this.onEnded);
    this.socket.on("call:recordingStarted", this.onRecordingStarted);
    this.socket.on("call:recordingStopped", this.onRecordingStopped);
  }

  // -- public read-only state --------------------------------------------

  get currentRoomId(): string | null {
    return this.roomId;
  }

  get currentRole(): CallParticipantRole | null {
    return this.role;
  }

  get isInCall(): boolean {
    return !!this.roomId;
  }

  // -- lifecycle -----------------------------------------------------------

  /** Join a call room and (by default) start publishing your mic/cam. */
  async join(roomId: string, opts: JoinOptions = {}): Promise<void> {
    if (this.roomId) throw new Error("Already in a call - call leave() first");

    const { role, existingProducers, rtpCapabilities } = await this.emitAck<{
      role: CallParticipantRole;
      existingProducers: ProducerInfo[];
      rtpCapabilities: RtpCapabilities;
    }>("call:join", { roomId });

    const device = new Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });

    const sendTransport = await this.createTransport(device, roomId, "send");
    const recvTransport = await this.createTransport(device, roomId, "recv");

    // Commit state now that the mediasoup side is fully ready.
    this.roomId = roomId;
    this.role = role;
    this.device = device;
    this.sendTransport = sendTransport;
    this.recvTransport = recvTransport;

    if (opts.autoPublish !== false) {
      const stream =
        opts.stream ??
        (opts.audio !== false || opts.video
          ? await navigator.mediaDevices.getUserMedia({
              audio: opts.audio !== false,
              video: !!opts.video,
            })
          : null);
      if (stream) await this.publish(stream);
    }

    for (const producerInfo of existingProducers) {
      await this.consume(producerInfo);
    }

    this.emit("joined", { roomId, role });
  }

  /** Publish a MediaStream's audio/video tracks (tagged "mic"/"webcam").
   *  Call this yourself if you joined with `autoPublish: false`. */
  async publish(stream: MediaStream): Promise<void> {
    this.localStream = stream;
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) await this.produceTrack(audioTrack, "mic");
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) await this.produceTrack(videoTrack, "webcam");
  }

  /** Mute/unmute your own mic or turn your own camera on/off. Actually
   *  pauses the RTP (peers stop receiving frames) in addition to updating
   *  the server-side flag other clients read. */
  async setMute(kind: MuteKind, muted: boolean): Promise<void> {
    const { roomId } = this.ensureActive();
    const tag: MediaTag = kind === "audio" ? "mic" : "webcam";
    const producer = this.producers.get(tag);
    if (producer) {
      if (muted) producer.pause();
      else producer.resume();
    }
    await this.emitAck("call:setMute", { roomId, kind, muted });
  }

  /** Start sharing your screen (video, plus system audio if the browser/OS
   *  provides it). Renders as its own remote track tagged "screenVideo" /
   *  "screenAudio" for everyone else. */
  async startScreenShare(): Promise<void> {
    this.ensureActive();
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    this.screenStream = stream;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        this.stopScreenShare().catch((err) =>
          this.emit("error", { message: err.message, context: "screenShare" }),
        );
      };
      await this.produceTrack(videoTrack, "screenVideo");
    }
    const audioTrack = stream.getAudioTracks()[0];
    if (audioTrack) await this.produceTrack(audioTrack, "screenAudio");
  }

  async stopScreenShare(): Promise<void> {
    const { roomId } = this.ensureActive();
    for (const tag of ["screenVideo", "screenAudio"] as MediaTag[]) {
      const producer = this.producers.get(tag);
      if (!producer) continue;
      await this.emitAck("call:closeProducer", {
        roomId,
        producerId: producer.id,
      });
      producer.close();
      this.producers.delete(tag);
    }
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.screenStream = null;
  }

  /** Decline an incoming call without ever joining it. */
  async reject(roomId: string): Promise<void> {
    await this.emitAck("call:reject", { roomId });
  }

  /** Leave the call and tear down all local media/transports. */
  async leave(): Promise<void> {
    if (!this.roomId) return;
    const roomId = this.roomId;
    this.teardownLocal();
    await this.emitAck("call:leave", { roomId }).catch(() => {
      // best-effort - if the socket is already gone the server will clean
      // up on the disconnect handler anyway
    });
  }

  /** Detach all socket listeners. Call this when the owning component
   *  unmounts (does not touch the shared socket connection itself). */
  destroy(): void {
    this.teardownLocal();
    this.socket.off("call:incoming", this.onIncoming);
    this.socket.off("call:newProducer", this.onNewProducer);
    this.socket.off("call:producerClosed", this.onProducerClosed);
    this.socket.off("call:participantJoined", this.onParticipantJoined);
    this.socket.off("call:participantLeft", this.onParticipantLeft);
    this.socket.off("call:participantRejected", this.onParticipantRejected);
    this.socket.off("call:participantMuteChanged", this.onMuteChanged);
    this.socket.off("call:youWereMuted", this.onYouWereMuted);
    this.socket.off("call:kicked", this.onKicked);
    this.socket.off("call:cancelled", this.onCancelled);
    this.socket.off("call:ended", this.onEnded);
    this.socket.off("call:recordingStarted", this.onRecordingStarted);
    this.socket.off("call:recordingStopped", this.onRecordingStopped);
  }

  // -- host-only moderation (also available via CallApi over REST) --------

  async kickParticipant(targetUserId: string): Promise<void> {
    const { roomId } = this.ensureActive();
    await this.emitAck("call:kick", { roomId, targetUserId });
  }

  async muteParticipant(
    targetUserId: string,
    kind: MuteKind,
    muted: boolean,
  ): Promise<void> {
    const { roomId } = this.ensureActive();
    await this.emitAck("call:muteParticipant", {
      roomId,
      targetUserId,
      kind,
      muted,
    });
  }

  async startRecording(): Promise<void> {
    const { roomId } = this.ensureActive();
    await this.emitAck("call:startRecording", { roomId });
  }

  async stopRecording(): Promise<void> {
    const { roomId } = this.ensureActive();
    await this.emitAck("call:stopRecording", { roomId });
  }

  // -- internals: mediasoup plumbing --------------------------------------

  private async createTransport(
    device: Device,
    roomId: string,
    direction: "send" | "recv",
  ): Promise<Transport> {
    const params = await this.emitAck<TransportOptions>(
      "call:createTransport",
      {
        roomId,
        direction,
      },
    );
    const transport =
      direction === "send"
        ? device.createSendTransport(params)
        : device.createRecvTransport(params);

    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      this.emitAck("call:connectTransport", {
        roomId,
        transportId: transport.id,
        dtlsParameters,
      })
        .then(() => callback())
        .catch(errback);
    });

    if (direction === "send") {
      transport.on(
        "produce",
        ({ kind, rtpParameters, appData }, callback, errback) => {
          const mediaTag = (appData as { mediaTag: MediaTag }).mediaTag;
          this.emitAck<{ id: string }>("call:produce", {
            roomId,
            transportId: transport.id,
            kind,
            rtpParameters,
            mediaTag,
          })
            .then(({ id }) => callback({ id }))
            .catch(errback);
        },
      );
    }

    return transport;
  }

  private async produceTrack(
    track: MediaStreamTrack,
    mediaTag: MediaTag,
  ): Promise<Producer<LocalProducerAppData>> {
    const { sendTransport } = this.ensureActive();
    const producer = await sendTransport.produce({
      track,
      appData: { mediaTag },
    });
    this.producers.set(mediaTag, producer);
    this.emit("localTrack", { mediaTag, track });
    return producer;
  }

  private async consume(info: ProducerInfo): Promise<void> {
    const { roomId, device, recvTransport } = this.ensureActive();
    if (this.consumers.has(info.producerId)) return; // already consuming it

    const params = await this.emitAck<{
      id: string;
      kind: MediaKind;
      rtpParameters: RtpParameters;
      producerId: string;
      producerUserId?: string;
      mediaTag?: MediaTag;
    }>("call:consume", {
      roomId,
      transportId: recvTransport.id,
      producerId: info.producerId,
      rtpCapabilities: device.recvRtpCapabilities,
    });

    const consumer = await recvTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters,
    });

    this.consumers.set(info.producerId, consumer);
    this.consumerMediaTags.set(info.producerId, info.mediaTag);

    await this.emitAck("call:resumeConsumer", {
      roomId,
      consumerId: consumer.id,
    });

    this.emit("remoteTrack", {
      userId: info.userId,
      mediaTag: info.mediaTag,
      producerId: info.producerId,
      track: consumer.track,
    });
  }

  private ensureActive(): {
    roomId: string;
    device: Device;
    sendTransport: Transport;
    recvTransport: Transport;
  } {
    if (
      !this.roomId ||
      !this.device ||
      !this.sendTransport ||
      !this.recvTransport
    ) {
      throw new Error("Not currently in an active call - call join() first");
    }
    return {
      roomId: this.roomId,
      device: this.device,
      sendTransport: this.sendTransport,
      recvTransport: this.recvTransport,
    };
  }

  private teardownLocal(): void {
    this.sendTransport?.close(); // closes mic/cam/screen producers too
    this.recvTransport?.close(); // closes consumers too
    this.sendTransport = null;
    this.recvTransport = null;
    this.producers.clear();
    this.consumers.clear();
    this.consumerMediaTags.clear();
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.screenStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.screenStream = null;
    this.device = null;
    this.roomId = null;
    this.role = null;
  }

  /** Promise wrapper around the {ok, data|error} ack every call:* event
   *  responds with (see CALL_SERVICE.md §4). */
  private async emitAck<T = unknown>(
    event: string,
    payload: object,
  ): Promise<T> {
    const res = (await this.socket.emitWithAck(
      event,
      payload,
    )) as AckResponse<T>;
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }

  // -- socket event handlers (bound instance properties so destroy() can
  //    remove exactly these listeners without touching anyone else's) -----

  private onIncoming = (payload: CallClientEventMap["incoming"]) => {
    this.emit("incoming", payload);
  };

  private onNewProducer = (payload: ProducerInfo) => {
    if (payload.userId === this.userId) return; // the room broadcast echoes our own producers back to us
    if (!this.roomId) return; // not in a call right now
    this.consume(payload).catch((err) =>
      this.emit("error", { message: err.message, context: "consume" }),
    );
  };

  private onProducerClosed = ({
    producerId,
    userId,
  }: {
    producerId: string;
    userId: string;
  }) => {
    const consumer = this.consumers.get(producerId);
    const mediaTag = this.consumerMediaTags.get(producerId);
    consumer?.close();
    this.consumers.delete(producerId);
    this.consumerMediaTags.delete(producerId);
    this.emit("remoteTrackClosed", { userId, producerId, mediaTag });
  };

  private onParticipantJoined = (
    payload: CallClientEventMap["participantJoined"],
  ) => {
    this.emit("participantJoined", payload);
  };

  private onParticipantLeft = (
    payload: CallClientEventMap["participantLeft"],
  ) => {
    this.emit("participantLeft", payload);
  };

  private onParticipantRejected = (
    payload: CallClientEventMap["participantRejected"],
  ) => {
    this.emit("participantRejected", payload);
  };

  private onMuteChanged = (payload: CallClientEventMap["muteChanged"]) => {
    this.emit("muteChanged", payload);
  };

  private onYouWereMuted = (payload: CallClientEventMap["youWereMuted"]) => {
    // The server already pauses/resumes the SFU-side producer regardless of
    // what we do here (that's what actually guarantees other participants
    // stop hearing/seeing you) - this just keeps the local Producer's state
    // (and therefore whether the browser still sends RTP at all) in sync.
    const tag: MediaTag = payload.kind === "audio" ? "mic" : "webcam";
    const producer = this.producers.get(tag);
    if (producer) {
      if (payload.muted) producer.pause();
      else producer.resume();
    }
    this.emit("youWereMuted", payload);
  };

  private onKicked = (payload: CallClientEventMap["kicked"]) => {
    if (payload.roomId !== this.roomId) return;
    this.teardownLocal();
    this.emit("kicked", payload);
  };

  private onCancelled = (payload: CallClientEventMap["cancelled"]) => {
    if (payload.roomId !== this.roomId) return;
    this.teardownLocal();
    this.emit("cancelled", payload);
  };

  private onEnded = (payload: CallClientEventMap["ended"]) => {
    if (payload.roomId !== this.roomId) return;
    this.teardownLocal();
    this.emit("ended", payload);
  };

  private onRecordingStarted = (
    payload: CallClientEventMap["recordingStarted"],
  ) => {
    this.emit("recordingStarted", payload);
  };

  private onRecordingStopped = (
    payload: CallClientEventMap["recordingStopped"],
  ) => {
    this.emit("recordingStopped", payload);
  };
}
