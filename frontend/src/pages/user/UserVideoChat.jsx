import React, { useRef, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaDesktop, FaPlay } from "react-icons/fa";
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
const socket = io("http://localhost:5000"); // Backend server URL

const UserVideoChat = () => {
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
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Call Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 mb-8">
          <div className="px-6 py-5 border-b border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900">
              {role} Video Call Session
            </h2>
          </div>
          <div className="p-6">
            {/* Video Section */}
            <div className="relative flex items-center justify-center w-full h-[60vh] bg-blue-100 rounded-lg shadow-inner">
              {isCallStarted ? (
                <>
                  {/* Remote Video */}
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full rounded-lg object-cover"
                  />
                  
                  {/* Local Video (Mini Floating) */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 border-2 border-blue-300 rounded-md overflow-hidden bg-white shadow-md">
                    <video 
                      ref={localVideoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <FaVideo className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600">Click Start to begin the call</p>
                </div>
              )}
            </div>

            {!isConnected && isCallStarted && (
              <div className="mt-4 text-center">
                <p className="text-blue-600 animate-pulse">
                  Waiting for another participant to join...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100">
          <div className="p-6 flex justify-center space-x-4">
            {!isCallStarted ? (
              <button 
                onClick={startCall}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-300"
              >
                <FaPlay className="mr-2 h-5 w-5" />
                Start Call
              </button>
            ) : (
              <>
                <button 
                  onClick={toggleMute} 
                  className={`p-4 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} hover:bg-blue-200 transition-colors duration-300`}
                >
                  {isMuted ? <FaMicrophoneSlash className="h-6 w-6" /> : <FaMicrophone className="h-6 w-6" />}
                </button>

                <button 
                  onClick={toggleVideo} 
                  className={`p-4 rounded-full ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} hover:bg-blue-200 transition-colors duration-300`}
                >
                  {isVideoOff ? <FaVideoSlash className="h-6 w-6" /> : <FaVideo className="h-6 w-6" />}
                </button>

                <button 
                  onClick={isScreenSharing ? stopScreenSharing : startScreenSharing} 
                  className={`p-4 rounded-full ${isScreenSharing ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'} hover:bg-blue-200 transition-colors duration-300`}
                >
                  <FaDesktop className="h-6 w-6" />
                </button>

                <button 
                  onClick={leaveCall} 
                  className="p-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-300"
                >
                  <FaPhoneSlash className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserVideoChat;

// import VideoChat from "../../components/video/VideoChat"

// const UserVideoChat = () => {
//   return <VideoChat />
// }

// export default UserVideoChat
