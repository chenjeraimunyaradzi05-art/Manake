import React from 'react';
import { useSocket } from '../../hooks/useSocket';
import { Video, Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

interface VideoCallModalProps {
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({ onClose: _onClose }) => {
  const {
    callAccepted,
    myVideo,
    userVideo,
    callEnded,
    stream,
    callIncoming,
    answerCall,
    endCall
  } = useSocket();

  const [micOn, setMicOn] = React.useState(true);
  const [videoOn, setVideoOn] = React.useState(true);

  // If no call is incoming and no call is active, don't render anything (or return null)
  // unless this modal is explicitly opened to make a call (logic handled by parent usually).
  // But here we rely on hook state.
  
  const showModal = (callIncoming?.isReceiving && !callAccepted) || (callAccepted && !callEnded);

  if (!showModal) return null;

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !micOn);
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = !videoOn);
      setVideoOn(!videoOn);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl mx-4 relative">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-medium">
               {callAccepted ? "In Call" : "Incoming Call..."}
            </span>
          </div>
          {callIncoming?.from && !callAccepted && (
             <span className="text-lg font-semibold">{callIncoming.from} is calling...</span>
          )}
        </div>

        {/* Video Grid */}
        <div className="relative aspect-video bg-gray-800 flex items-center justify-center overflow-hidden">
          {/* Remote Video (Main) */}
          {callAccepted && !callEnded ? (
            <video 
              playsInline 
              ref={userVideo} 
              autoPlay 
              className="w-full h-full object-cover" 
            />
          ) : (
             <div className="flex flex-col items-center justify-center text-gray-500">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                  <Video size={40} />
                </div>
                <p>Waiting for video...</p>
             </div>
          )}

          {/* Local Video (PiP) */}
          {stream && (
            <div className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
               <video 
                 playsInline 
                 muted 
                 ref={myVideo} 
                 autoPlay 
                 className="w-full h-full object-cover transform scale-x-[-1]" 
               />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6 flex items-center justify-center gap-6">
          
          {/* Receive Call UI */}
          {callIncoming?.isReceiving && !callAccepted && (
            <div className="flex gap-8 items-center">
                 <button 
                  onClick={answerCall}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 animate-bounce">
                    <Phone className="text-white fill-current" size={32} />
                  </div>
                  <span className="text-white text-sm">Answer</span>
                </button>

                <button 
                   onClick={endCall} // Or reject
                   className="flex flex-col items-center gap-2 group"
                >
                   <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <PhoneOff className="text-white" size={32} />
                   </div>
                   <span className="text-white text-sm">Decline</span>
                </button>
            </div>
          )}

          {/* In-Call Controls */}
          {callAccepted && !callEnded && (
             <>
               <button 
                 onClick={toggleMic}
                 className={`p-4 rounded-full transition-colors ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
               >
                 {micOn ? <Mic className="text-white" /> : <MicOff className="text-white" />}
               </button>

               <button 
                 onClick={endCall}
                 className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-lg"
               >
                 <PhoneOff className="text-white" size={32} />
               </button>

               <button 
                 onClick={toggleVideo}
                 className={`p-4 rounded-full transition-colors ${videoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
               >
                 {videoOn ? <VideoIcon className="text-white" /> : <VideoOff className="text-white" />}
               </button>
             </>
          )}

        </div>
      </div>
    </div>
  );
};
