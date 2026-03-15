// components/VoiceRecorder.js
"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaPlay, FaTrash, FaPaperPlane, FaPause } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  // بدء التسجيل
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioBlob(audioBlob);
        
        // إيقاف جميع المسارات
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // بدء التايمر
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('لا يمكن الوصول إلى الميكروفون. تأكد من السماح بالوصول.');
    }
  };
  
  // إيقاف التسجيل
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  // تشغيل/إيقاف التسجيل الصوتي
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // إرسال التسجيل
  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingTime);
    }
  };
  
  // إلغاء وحذف التسجيل
  const handleCancel = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingTime(0);
    
    if (onCancel) {
      onCancel();
    }
  };
  
  // تنظيف
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  // تنسيق الوقت (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 mb-2"
    >
      {!audioUrl ? (
        // وضع التسجيل
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isRecording ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-red-500 font-medium">تسجيل...</span>
                <span className="text-gray-700 font-mono">{formatTime(recordingTime)}</span>
              </>
            ) : (
              <span className="text-gray-700">اضغط للتسجيل</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-12 h-12 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
              >
                <FaMicrophone size={20} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-12 h-12 rounded-full bg-gray-700 text-white hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                <FaStop size={16} />
              </button>
            )}
            
            <button
              onClick={handleCancel}
              className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <FaTrash size={16} />
            </button>
          </div>
        </div>
      ) : (
        // معاينة التسجيل
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                className="w-full"
                controls
              />
            </div>
            
            <span className="text-sm text-gray-700 font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
          
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <FaTrash size={16} />
              <span>حذف</span>
            </button>
            
            <button
              onClick={handleSend}
              className="px-6 py-2 bg-[#579BE8] text-white rounded-lg hover:bg-[#4a8bd1] transition-colors flex items-center gap-2"
            >
              <FaPaperPlane size={16} />
              <span>إرسال</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default VoiceRecorder;