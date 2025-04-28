import React, { useRef, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaDesktop, FaPlay } from "react-icons/fa";
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
const socket = io("http://localhost:5000"); // Backend server URL

const VideoCall = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const screenStream = useRef(null);

  const { appointmentId } = useParams();
  const [roomId] = useState(appointmentId);
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);

  const role = window.location.pathname.startsWith('/user') ? 'User' :
               window.location.pathname.startsWith('/counselor') ? 'Counselor' :
               null;


  const startCall = async () => {
    setIsCallStarted(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", { candidate: event.candidate, roomId });
        }
      };

      socket.emit("join-room", { roomId, userId: user.id, role });

      socket.on("start-call", async () => { 
        setIsConnected(true);
        if (role === "User") {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          socket.emit("offer", { offer, roomId });
        }
      });

      socket.on("offer", async (data) => {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("answer", { answer, roomId });
      });

      socket.on("answer", (data) => {
        peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      });

      socket.on("candidate", (data) => {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      });

    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const toggleMute = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  const startScreenSharing = async () => {
    try {
      screenStream.current = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.current.getTracks()[0];

      peerConnection.current.getSenders().forEach(sender => {
        if (sender.track.kind === "video") {
          sender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);
      screenTrack.onended = stopScreenSharing;
    } catch (error) {
      console.error("Error starting screen sharing:", error);
    }
  };

  const stopScreenSharing = () => {
    const videoTrack = localStream.current.getVideoTracks()[0];

    peerConnection.current.getSenders().forEach(sender => {
      if (sender.track.kind === "video") {
        sender.replaceTrack(videoTrack);
      }
    });

    setIsScreenSharing(false);
  };

  const leaveCall = () => {
    socket.emit("leave-room", { roomId, userId: user.id });
    peerConnection.current?.close();
    localStream.current?.getTracks().forEach(track => track.stop());
    setIsCallStarted(false);
    setIsConnected(false);
    onLeave();
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 text-white min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Video Call ({role})</h2>

      {/* Video Section with Decreased Width */}
      <div className="relative flex items-center justify-center w-[60vw] h-[70vh] bg-gray-800 rounded-lg shadow-xl">
        {isCallStarted ? (
          <>
            {/* Remote Video */}
            <video ref={remoteVideoRef} autoPlay playsInline className="w-[85%] h-full border-4 border-blue-500 rounded-xl shadow-lg object-cover" />
            
            {/* Local Video (Mini Floating) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 border-2 border-gray-300 rounded-md overflow-hidden">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full" />
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-lg">Click Start to begin the call</p>
        )}
      </div>

      {!isConnected && isCallStarted && <p className="mt-4 text-gray-400">Waiting for another participant...</p>}

      {/* Controls */}
      <div className="mt-6 flex space-x-4">
        {!isCallStarted ? (
          <button onClick={startCall} className="p-4 rounded-full bg-green-600 hover:bg-green-500">
            <FaPlay className="text-white text-2xl" />
          </button>
        ) : (
          <>
            <button onClick={toggleMute} className="p-4 rounded-full bg-gray-700 hover:bg-gray-600">
              {isMuted ? <FaMicrophoneSlash className="text-red-500 text-2xl" /> : <FaMicrophone className="text-green-400 text-2xl" />}
            </button>

            <button onClick={toggleVideo} className="p-4 rounded-full bg-gray-700 hover:bg-gray-600">
              {isVideoOff ? <FaVideoSlash className="text-red-500 text-2xl" /> : <FaVideo className="text-green-400 text-2xl" />}
            </button>

            <button onClick={isScreenSharing ? stopScreenSharing : startScreenSharing} className="p-4 rounded-full bg-gray-700 hover:bg-gray-600">
              <FaDesktop className="text-yellow-400 text-2xl" />
            </button>

            <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-500">
              <FaPhoneSlash className="text-white text-2xl" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoCall;