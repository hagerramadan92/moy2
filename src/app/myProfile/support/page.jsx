"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaPaperPlane, FaPaperclip, FaSmile, FaInfoCircle, FaTimes, FaFile, FaDownload, FaSearch, FaCheckDouble, FaCheck, FaMicrophone, FaStop, FaPlay, FaPause } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import { messageService } from "../../../../Services/message.service";

import EmojiPicker from 'emoji-picker-react';
import Pusher from 'pusher-js';

// Voice Recorder Component
const VoiceRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    
    // بدء التسجيل
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // تحديد نوع MIME المناسب للتسجيل
            const options = { mimeType: 'audio/webm' };
            try {
                mediaRecorderRef.current = new MediaRecorder(stream, options);
            } catch (e) {
                // إذا لم يدعم المتصفح webm، نستخدم الصيغة الافتراضية
                mediaRecorderRef.current = new MediaRecorder(stream);
            }
            
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = () => {
                // تحديد نوع الملف بناءً على MIME type المدعوم
                let mimeType = 'audio/webm';
                if (mediaRecorderRef.current.mimeType) {
                    mimeType = mediaRecorderRef.current.mimeType;
                }
                
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                
                // تحديد الامتداد المناسب
                let extension = 'webm';
                if (mimeType.includes('mp4')) extension = 'm4a';
                else if (mimeType.includes('mpeg')) extension = 'mp3';
                else if (mimeType.includes('wav')) extension = 'wav';
                else if (mimeType.includes('aac')) extension = 'aac';
                
                // إضافة خاصية الامتداد للـ blob
                audioBlob.extension = extension;
                
                const url = URL.createObjectURL(audioBlob);
                setAudioBlob(audioBlob);
                setAudioUrl(url);
                
                // إيقاف المسارات
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
            
            // بدء المؤقت
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast.error('لا يمكن الوصول إلى الميكروفون');
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
    
    // إلغاء التسجيل
    const cancelRecording = () => {
        stopRecording();
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setIsPlaying(false);
        onCancel();
    };
    
    // إرسال التسجيل
    const sendRecording = () => {
        if (audioBlob) {
            // تحديد الامتداد المناسب للملف
            const extension = audioBlob.extension || 'webm';
            
            // إنشاء كائن ملف بالامتداد الصحيح
            const audioFile = new File(
                [audioBlob], 
                `voice-message.${extension}`, 
                { type: audioBlob.type || 'audio/webm' }
            );
            
            onSend(audioFile, recordingTime);
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        }
    };
    
    // تشغيل/إيقاف التسجيل
    const togglePlayback = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play().catch(e => console.log('Playback error:', e));
            }
            setIsPlaying(!isPlaying);
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
    
    // تنسيق الوقت
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white dark:bg-card rounded-xl p-3 border border-border/60 shadow-lg"
        >
            {!audioBlob ? (
                // وضع التسجيل
                <div className="flex items-center gap-3">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isRecording 
                                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                                : 'bg-[#579BE8] hover:bg-[#4a8bd1]'
                        }`}
                    >
                        {isRecording ? <FaStop size={20} className="text-white" /> : <FaMicrophone size={20} className="text-white" />}
                    </button>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                            <span className="text-sm font-medium">
                                {isRecording ? formatTime(recordingTime) : 'اضغط للتسجيل'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {isRecording ? 'جاري التسجيل...' : 'سجل رسالة صوتية'}
                        </p>
                    </div>
                    
                    <button
                        onClick={cancelRecording}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaTimes size={16} className="text-gray-500" />
                    </button>
                </div>
            ) : (
                // وضع المعاينة
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlayback}
                        className="w-12 h-12 rounded-full bg-[#579BE8] hover:bg-[#4a8bd1] flex items-center justify-center transition-all"
                    >
                        {isPlaying ? <FaPause size={20} className="text-white" /> : <FaPlay size={20} className="text-white" />}
                    </button>
                    
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                    />
                    
                    <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-[#579BE8] transition-all duration-100"
                                style={{ width: isPlaying ? '100%' : '0%' }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-600">🎤 رسالة صوتية</span>
                            <span className="text-xs text-gray-500">{formatTime(recordingTime)}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <button
                            onClick={sendRecording}
                            className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
                            title="إرسال"
                        >
                            <FaPaperPlane size={14} className="text-white" />
                        </button>
                        <button
                            onClick={cancelRecording}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            title="إلغاء"
                        >
                            <FaTimes size={14} className="text-gray-500" />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default function HelpCenterPage() {
    // States
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [chatId, setChatId] = useState(null);
    const [creatingChat, setCreatingChat] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pusherChannel, setPusherChannel] = useState(null);
    const [currentUser, setCurrentUser] = useState({
        id: null,
        name: 'المستخدم',
        email: '',
        phone: ''
    });
    
    // Voice Recording States
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [playingVoiceId, setPlayingVoiceId] = useState(null);
    const audioRefs = useRef({});
    
    // Support ID States
    const [supportParticipantId, setSupportParticipantId] = useState(null);
    const [loadingSupportId, setLoadingSupportId] = useState(false);
    const [supportChat, setSupportChat] = useState(null);
    const [supportList, setSupportList] = useState([]);
    
    // Pagination
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Refs
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const searchInputRef = useRef(null);
    const attachmentMenuRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const lastLoadedChatIdRef = useRef(null);
    const chatCreationAttemptedRef = useRef(null);
    
    // ألوان ثابتة للرسائل
    const MESSAGE_COLORS = {
        outgoing: {
            bg: '#0084ff',
            text: '#FFFFFF',
            time: 'rgba(255, 255, 255, 0.9)',
            gradient: 'linear-gradient(135deg, #0084ff 0%, #0066cc 100%)',
            shadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        },
        incoming: {
            bg: '#f0f0f0',
            text: '#050505',
            time: '#65676B',
            gradient: 'linear-gradient(135deg, #f0f0f0 0%, #e4e6eb 100%)',
            border: '1px solid #e4e6eb',
            shadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }
    };

    // Format message time
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';
            
            return date.toLocaleTimeString('ar-SA', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return '';
        }
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Toggle voice playback - نسخة طبق الأصل من الكود الشغال
    const toggleVoicePlayback = (messageId, audioUrl) => {
        if (playingVoiceId === messageId) {
            // إيقاف التشغيل
            if (audioRefs.current[messageId]) {
                audioRefs.current[messageId].pause();
                audioRefs.current[messageId].currentTime = 0;
            }
            setPlayingVoiceId(null);
        } else {
            // إيقاف أي تشغيل سابق
            if (playingVoiceId && audioRefs.current[playingVoiceId]) {
                audioRefs.current[playingVoiceId].pause();
                audioRefs.current[playingVoiceId].currentTime = 0;
            }
            
            // تشغيل الجديد
            if (audioRefs.current[messageId]) {
                audioRefs.current[messageId].play();
                setPlayingVoiceId(messageId);
            } else {
                const audio = new Audio(audioUrl);
                audio.onended = () => setPlayingVoiceId(null);
                audio.play();
                audioRefs.current[messageId] = audio;
                setPlayingVoiceId(messageId);
            }
        }
    };

    // Get file icon - نسخة محدثة مع دعم الصيغ الجديدة
    const getFileIcon = (fileType) => {
        if (!fileType) return <FaFile size={20} />;
        
        const type = fileType.toLowerCase();
        
        if (type.startsWith('image/') || type.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <FaFile className="text-blue-500" size={20} />;
        }
        if (type.startsWith('video/') || type.match(/\.(mp4|mov|avi|mkv)$/)) {
            return <FaFile className="text-purple-500" size={20} />;
        }
        // تحديث شرط الصوت ليشمل الامتدادات الجديدة
        if (type.startsWith('audio/') || 
            type.match(/\.(mp3|wav|m4a|aac)$/) ||
            type.endsWith('.mp3') ||
            type.endsWith('.wav') ||
            type.endsWith('.m4a') ||
            type.endsWith('.aac')) {
            return <FaFile className="text-green-500" size={20} />;
        }
        if (type.includes('pdf') || type.match(/\.pdf$/)) {
            return <FaFile className="text-red-500" size={20} />;
        }
        if (type.includes('word') || type.includes('doc') || type.match(/\.(doc|docx)$/)) {
            return <FaFile className="text-blue-500" size={20} />;
        }
        if (type.includes('excel') || type.includes('xls') || type.match(/\.(xls|xlsx)$/)) {
            return <FaFile className="text-green-500" size={20} />;
        }
        if (type.includes('zip') || type.includes('rar') || type.match(/\.(zip|rar|7z)$/)) {
            return <FaFile className="text-yellow-600" size={20} />;
        }
        
        return <FaFile size={20} />;
    };

    // Render voice message - نسخة طبق الأصل من الكود الشغال
  // في صفحة page.jsx، ابحث عن دالة renderVoiceMessage واستبدلها بهذا:

// Render voice message - نسخة محسنة مع معالجة أخطاء التحميل

const renderVoiceMessage = (message, attachment) => {
    const isPlaying = playingVoiceId === message.id;
    let audioUrl = attachment?.file_url || attachment?.url || message.file_url;
    
    if (!audioUrl) return null;
    
    // التحقق من أن الملف صوتي
    const isAudioFile = 
        audioUrl.endsWith('.mp3') ||
        audioUrl.endsWith('.wav') ||
        audioUrl.endsWith('.m4a') ||
        audioUrl.endsWith('.aac') ||
        message.message_type === 'voice' ||
        attachment?.mime_type?.startsWith('audio/');
    
    if (!isAudioFile) return null;
    
    // معالجة الرابط - إضافة token في الـ headers أو في الـ URL
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    // طريقة 1: إضافة token في الـ URL كـ query parameter (إذا كان الخادم يدعم ذلك)
    const fullAudioUrl = audioUrl.startsWith('http') 
        ? audioUrl 
        : `https://dashboard.waytmiah.com${audioUrl.startsWith('/') ? audioUrl : '/' + audioUrl}`;
    
    // إضافة token إلى الرابط إذا كان متاحاً (لبعض الخوادم)
    const urlWithToken = token ? `${fullAudioUrl}?token=${token}` : fullAudioUrl;
    
    // حساب المدة
    const duration = message.duration || attachment?.duration || 30;
    const durationFormatted = typeof duration === 'number' 
        ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
        : '0:30';
    
    // دالة تشغيل الصوت مع معالجة الأخطاء
   // دالة متقدمة لتشغيل الصوت مع معالجة الأخطاء
const playAudio = async (messageId, url) => {
  try {
    if (playingVoiceId === messageId) {
      // إيقاف التشغيل
      if (audioRefs.current[messageId]) {
        audioRefs.current[messageId].pause();
        audioRefs.current[messageId].currentTime = 0;
      }
      setPlayingVoiceId(null);
      return;
    }
    
    // إيقاف أي تشغيل سابق
    if (playingVoiceId && audioRefs.current[playingVoiceId]) {
      audioRefs.current[playingVoiceId].pause();
      audioRefs.current[playingVoiceId].currentTime = 0;
    }
    
    const token = localStorage.getItem('accessToken');
    
    // ✅ الحل: استخدام audio element مباشرة مع إضافة token في headers
    const audio = new Audio();
    
    // استخدام fetch لتحميل الملف مع التوكن أولاً
    try {
      console.log('محاولة تحميل الصوت مع التوكن:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'audio/mpeg, audio/mp3, audio/wav, audio/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`فشل التحميل: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('تم تحميل الصوت، نوع الملف:', blob.type);
      
      // إنشاء رابط مؤقت من blob
      const blobUrl = URL.createObjectURL(blob);
      
      // ✅ هذا يتجاوز CORS لأنه URL محلي
      audio.src = blobUrl;
      
      // إعداد events
      audio.onended = () => {
        URL.revokeObjectURL(blobUrl);
        setPlayingVoiceId(null);
      };
      
      audio.onerror = (e) => {
        console.error('خطأ في تشغيل الصوت:', e);
        URL.revokeObjectURL(blobUrl);
        setPlayingVoiceId(null);
        
        // ✅ محاولة بديلة - استخدام عنصر audio في DOM
        playAudioWithAudioElement(messageId, url, token);
      };
      
      // محاولة التشغيل
      await audio.play();
      
      // حفظ المرجع
      if (audioRefs.current[messageId]) {
        // تنظيف الرابط القديم
        if (audioRefs.current[messageId].src?.startsWith('blob:')) {
          URL.revokeObjectURL(audioRefs.current[messageId].src);
        }
      }
      audioRefs.current[messageId] = audio;
      setPlayingVoiceId(messageId);
      
    } catch (fetchError) {
      console.error('فشل تحميل الصوت:', fetchError);
      
      // ✅ محاولة بديلة 2: استخدام عنصر HTMLAudioElement مع التوكن في الـ headers
      playAudioWithAudioElement(messageId, url, token);
    }
  } catch (error) {
    console.error('خطأ عام في تشغيل الصوت:', error);
    
    // ✅ محاولة أخيرة: فتح الرابط في نافذة جديدة
    if (confirm('تعذر تشغيل الصوت. هل تريد فتحه في نافذة جديدة؟')) {
      window.open(url, '_blank');
    }
    setPlayingVoiceId(null);
  }
};

// ✅ دالة مساعدة: استخدام عنصر audio في DOM مع التوكن
const playAudioWithAudioElement = (messageId, url, token) => {
  try {
    // إنشاء عنصر audio مؤقت في DOM
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.style.display = 'none';
    document.body.appendChild(audioElement);
    
    // إضافة التوكن في headers غير ممكن مع عنصر audio مباشرة
    // لذلك نستخدم source مع التوكن في query string
    const urlWithToken = token 
      ? `${url}${url.includes('?') ? '&' : '?'}token=${token}`
      : url;
    
    audioElement.src = urlWithToken;
    
    audioElement.onended = () => {
      document.body.removeChild(audioElement);
      setPlayingVoiceId(null);
    };
    
    audioElement.onerror = () => {
      console.error('فشل التشغيل بعنصر audio');
      document.body.removeChild(audioElement);
      setPlayingVoiceId(null);
      
      // ✅ محاولة أخيرة: استخدام iframe
      playAudioWithIframe(messageId, url, token);
    };
    
    audioElement.play().catch(err => {
      console.error('فشل تشغيل audio element:', err);
      document.body.removeChild(audioElement);
      setPlayingVoiceId(null);
    });
    
    audioRefs.current[messageId] = audioElement;
    setPlayingVoiceId(messageId);
  } catch (error) {
    console.error('خطأ في playAudioWithAudioElement:', error);
    setPlayingVoiceId(null);
  }
};

// ✅ دالة مساعدة أخيرة: استخدام iframe مخفي
const playAudioWithIframe = (messageId, url, token) => {
  try {
    const urlWithToken = token 
      ? `${url}${url.includes('?') ? '&' : '?'}token=${token}`
      : url;
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = urlWithToken;
    document.body.appendChild(iframe);
    
    // لا يمكن تتبع متى ينتهي التشغيل بالـ iframe
    setTimeout(() => {
      document.body.removeChild(iframe);
      setPlayingVoiceId(null);
    }, 30000); // افترض أن المدة 30 ثانية
    
    audioRefs.current[messageId] = {
      stop: () => {
        document.body.removeChild(iframe);
        setPlayingVoiceId(null);
      }
    };
    setPlayingVoiceId(messageId);
  } catch (error) {
    console.error('خطأ في playAudioWithIframe:', error);
    setPlayingVoiceId(null);
  }
};
    
    return (
        <div className="flex items-center gap-3 p-2 bg-gray-100 rounded-lg min-w-[200px]">
            <button
                onClick={() => playAudio(message.id, fullAudioUrl)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPlaying 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-[#579BE8] hover:bg-[#4a8bd1]'
                }`}
            >
                {isPlaying ? <FaStop size={16} className="text-white" /> : <FaPlay size={16} className="text-white" />}
            </button>
            
            <div className="flex-1">
                <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-[#579BE8] transition-all duration-100" 
                        style={{ width: isPlaying ? '100%' : '0%' }}
                    ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-600">🎤 رسالة صوتية</span>
                    <span className="text-xs text-gray-500">
                        {durationFormatted}
                    </span>
                </div>
            </div>
            
            <a 
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    // تحميل الملف مع token
                    fetch(fullAudioUrl, {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : ''
                        }
                    })
                    .then(res => res.blob())
                    .then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = message.file_name || 'voice-message.mp3';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    })
                    .catch(err => console.error('Download failed:', err));
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                title="تحميل"
            >
                <FaDownload size={12} className="text-gray-500" />
            </a>
        </div>
    );
};

    // Render file message - محدثة لدعم الصوت
    const renderFileMessage = (message) => {
        // التحقق من وجود attachments أو file_url مباشرة في الرسالة
        const hasFileUrl = message.file_url;
        const attachments = message.attachments || [];
        
        // إذا كانت رسالة صوتية
        if (message.message_type === 'voice') {
            // إنشاء attachment من بيانات الرسالة
            const voiceAttachment = {
                url: message.file_url,
                duration: message.duration,
                file_name: message.file_name,
                mime_type: message.metadata?.mime_type || 'audio/mp3'
            };
            return renderVoiceMessage(message, voiceAttachment);
        }
        
        if (attachments.some(a => a.is_voice || a.mime_type?.startsWith('audio/'))) {
            const voiceAttachment = attachments.find(a => a.is_voice || a.mime_type?.startsWith('audio/')) || attachments[0];
            if (voiceAttachment) {
                return renderVoiceMessage(message, voiceAttachment);
            }
        }
        
        // إذا كانت الرسالة تحتوي على file_url مباشرة
        if (hasFileUrl && message.message_type === 'file') {
            const fileName = message.file_name || 'ملف';
            const fileUrl = message.file_url;
            const isImage = fileUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
            
            if (isImage) {
                return (
                    <div className="relative group max-w-[300px] mt-2">
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="rounded-lg max-h-64 w-auto object-cover cursor-pointer hover:opacity-90 transition-all"
                            onClick={() => window.open(fileUrl, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                                onClick={() => window.open(fileUrl, '_blank')}
                                className="p-2 bg-white rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                title="فتح الصورة"
                            >
                                <FaDownload size={14} />
                            </button>
                        </div>
                    </div>
                );
            }
            
            // لو ملف مش صورة
            return (
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors max-w-xs mt-2"
                >
                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                        {getFileIcon(fileName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                            {fileName}
                        </p>
                        {message.file_size && (
                            <p className="text-[10px] sm:text-xs text-gray-500">
                                {formatFileSize(message.file_size)}
                            </p>
                        )}
                    </div>
                    <FaDownload size={14} className="text-gray-500 flex-shrink-0" />
                </a>
            );
        }
        
        // إذا كانت الرسالة فيها attachments array
        if (attachments.length > 0) {
            return (
                <div className="space-y-2 mt-2">
                    {attachments.map((attachment, index) => {
                        const fileName = attachment.file_name || attachment.name || 'ملف';
                        const fileSize = attachment.size || attachment.file_size;
                        const mimeType = attachment.mime_type || attachment.type;
                        
                        const isImage = mimeType?.startsWith('image/') || 
                                       fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                        
                        const isVoice = attachment.is_voice || mimeType?.startsWith('audio/');
                        
                        const imageUrl = attachment.url || 
                                        (attachment.file ? URL.createObjectURL(attachment.file) : null);
                        
                        // إذا كانت صورة
                        if (isImage && imageUrl) {
                            return (
                                <div key={index} className="relative group max-w-[300px]">
                                    <img
                                        src={imageUrl}
                                        alt={fileName}
                                        className={`rounded-lg max-h-48 sm:max-h-64 w-auto object-cover cursor-pointer transition-all ${
                                            attachment.pending ? 'opacity-70' : 'hover:opacity-90'
                                        }`}
                                        onClick={() => !attachment.pending && window.open(imageUrl, '_blank')}
                                    />
                                    
                                    {attachment.pending && (
                                        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                            <div className="bg-white rounded-full p-2 shadow-lg">
                                                <div className="w-5 h-5 border-2 border-[#579BE8] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!attachment.pending && (
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => window.open(imageUrl, '_blank')}
                                                className="p-2 bg-white rounded-full shadow-lg transform hover:scale-110 transition-transform"
                                                title="فتح الصورة"
                                            >
                                                <FaDownload size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        
                        // إذا كانت رسالة صوتية
                        if (isVoice) {
                            return renderVoiceMessage(message, attachment);
                        }
                        
                        // باقي أنواع الملفات
                        return (
                            <a
                                key={index}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors max-w-xs ${
                                    attachment.pending ? 'opacity-70 pointer-events-none' : ''
                                }`}
                            >
                                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                                    {getFileIcon(mimeType || fileName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                                        {fileName}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-500">
                                        {fileSize ? formatFileSize(fileSize) : 'ملف'}
                                    </p>
                                </div>
                                {attachment.pending ? (
                                    <div className="w-4 h-4 border-2 border-[#579BE8] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FaDownload size={14} className="text-gray-500 flex-shrink-0" />
                                )}
                            </a>
                        );
                    })}
                </div>
            );
        }
        
        return null;
    };

    // Check authentication status
    const checkAuthStatus = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                const token = localStorage.getItem('accessToken');
                const userData = localStorage.getItem('user');
                
                const isAuth = !!token;
                setIsLoggedIn(isAuth);
                
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setCurrentUser({
                        id: parsedUser.id || null,
                        name: parsedUser.name || parsedUser.username || 'المستخدم',
                        email: parsedUser.email || '',
                        phone: parsedUser.phone || ''
                    });
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                setIsLoggedIn(false);
            }
        }
    }, []);

    // جلب support ID من الـ API
    const fetchSupportId = useCallback(async () => {
        if (!isLoggedIn) return null;
        
        try {
            setLoadingSupportId(true);
            const result = await messageService.getFirstSupportId();
            
            if (result.success && result.id) {
                setSupportParticipantId(result.id);
                setSupportList(result.all || []);
                
                if (typeof window !== 'undefined') {
                    localStorage.setItem('support_participant_id', result.id.toString());
                    if (result.support?.name) {
                        localStorage.setItem('support_participant_name', result.support.name);
                    }
                }
                
                return result.id;
            } else {
                if (typeof window !== 'undefined') {
                    const storedId = localStorage.getItem('support_participant_id');
                    if (storedId) {
                        setSupportParticipantId(parseInt(storedId));
                        return parseInt(storedId);
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('Error fetching support ID:', error);
            return null;
        } finally {
            setLoadingSupportId(false);
        }
    }, [isLoggedIn]);

    // Initialize Pusher
    const initializePusher = useCallback((chatId, chatUuid) => {
        if (!chatUuid || !isLoggedIn || !chatId) return null;
        
        try {
            if (pusherChannel) {
                pusherChannel.unbind_all();
                pusherChannel.unsubscribe();
            }
            
            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
                authEndpoint: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dashboard.waytmiah.com/api/v1'}/broadcasting/auth`,
                auth: {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Accept': 'application/json'
                    }
                },
                enabledTransports: ['ws', 'wss']
            });
            
            const channelName = `chat.${chatUuid}`;
            const channel = pusher.subscribe(channelName);
            
            channel.bind('MessageSent', (data) => {
                console.log('📨 New message from Pusher:', data);
                handleNewPusherMessage(data.message);
            });
            
            setPusherChannel(channel);
            return channel;
        } catch (error) {
            console.error('Pusher initialization failed:', error);
            return null;
        }
    }, [isLoggedIn]);

    // Handle new Pusher message
    const handleNewPusherMessage = useCallback((newMessage) => {
        if (!newMessage || !chatId) return;
        
        console.log('📨 معالجة رسالة جديدة من Pusher في Support:', newMessage);
        
        if (chatId && chatId === newMessage.chat_id) {
            setMessages(prevMessages => {
                const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
                if (messageExists) {
                    return prevMessages;
                }
                
                const isFromCurrentUser = newMessage.sender_id === currentUser.id;
                
                let fileData = null;
                if (newMessage.file_url) {
                    fileData = {
                        url: newMessage.file_url,
                        name: newMessage.file_name || 'ملف',
                        size: newMessage.file_size,
                        type: newMessage.file_type || (newMessage.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/' : 'file'),
                        isImage: newMessage.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i),
                        isVoice: newMessage.message_type === 'voice',
                        duration: newMessage.duration
                    };
                } else if (newMessage.attachments?.[0]) {
                    fileData = {
                        url: newMessage.attachments[0].url,
                        name: newMessage.attachments[0].file_name || newMessage.attachments[0].name,
                        size: newMessage.attachments[0].size,
                        type: newMessage.attachments[0].mime_type || newMessage.attachments[0].type,
                        isImage: (newMessage.attachments[0].mime_type || '').startsWith('image/'),
                        isVoice: newMessage.message_type === 'voice',
                        duration: newMessage.duration
                    };
                }
                
                const formattedMessage = {
                    id: newMessage.id,
                    type: isFromCurrentUser ? "user" : "support",
                    text: newMessage.message || newMessage.text || "",
                    time: formatMessageTime(newMessage.created_at),
                    timestamp: new Date(newMessage.created_at || newMessage.timestamp || Date.now()).getTime(),
                    is_outgoing: isFromCurrentUser,
                    isCurrentUser: isFromCurrentUser,
                    is_read: newMessage.is_read || false,
                    file: fileData,
                    message_type: newMessage.message_type,
                    file_url: newMessage.file_url,
                    file_name: newMessage.file_name,
                    file_size: newMessage.file_size,
                    duration: newMessage.duration,
                    attachments: newMessage.attachments
                };
                
                console.log('✅ إضافة رسالة جديدة إلى القائمة:', formattedMessage);
                
                const updatedMessages = [...prevMessages, formattedMessage];
                return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
            });
            
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } else {
            console.log('⚠️ الرسالة لا تخص المحادثة الحالية:', newMessage.chat_id, 'chatId:', chatId);
        }
    }, [chatId, currentUser.id]);

    // Create or get support chat
    const createOrGetChat = useCallback(async () => {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return null;
        }

        if (creatingChat) return null;

        let currentSupportId = supportParticipantId;
        if (!currentSupportId) {
            currentSupportId = await fetchSupportId();
            if (!currentSupportId) {
                toast.error("لا يوجد دعم فني متاح حالياً");
                return null;
            }
        }

        if (chatCreationAttemptedRef.current === currentSupportId) {
            return null;
        }

        try {
            chatCreationAttemptedRef.current = currentSupportId;
            setCreatingChat(true);

            const result = await messageService.createChat(
                currentSupportId, 
                "user_user",
                "الدعم الفني"
            );

            if (result.success && result.chat) {
                const newChatId = result.chat.id || result.chat.chat_id;
                
                if (newChatId) {
                    setChatId(newChatId);
                    setSupportChat(result.chat);
                    
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('support_chat_id', newChatId.toString());
                    }
                    
                    return newChatId;
                }
            } else {
                console.error('Failed to create support chat:', result.error);
                
                if (typeof window !== 'undefined') {
                    const storedChatId = localStorage.getItem('support_chat_id');
                    if (storedChatId) {
                        setChatId(parseInt(storedChatId));
                        return parseInt(storedChatId);
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('Error creating support chat:', error);
            return null;
        } finally {
            setCreatingChat(false);
        }
    }, [isLoggedIn, supportParticipantId, fetchSupportId, creatingChat]);

    // Load messages
    const loadMessages = useCallback(async (currentChatId, page = 1, refresh = false) => {
        if (!currentChatId || !isLoggedIn) return;

        if (page === 1 && !refresh && lastLoadedChatIdRef.current === currentChatId) {
            return;
        }

        try {
            if (page === 1) {
                setMessagesLoading(true);
                lastLoadedChatIdRef.current = currentChatId;
            }

            const response = await messageService.getMessages(currentChatId, { 
                page,
                refresh: refresh || page === 1
            });

            if (response.success && Array.isArray(response.data)) {
                const fetchedMessages = response.data;
                
                const formattedMessages = fetchedMessages.map(msg => ({
                    id: msg.id,
                    type: msg.sender_id === currentUser.id ? "user" : "support",
                    text: msg.message || msg.text || "",
                    time: formatMessageTime(msg.created_at),
                    timestamp: new Date(msg.created_at).getTime(),
                    is_outgoing: msg.sender_id === currentUser.id,
                    isCurrentUser: msg.sender_id === currentUser.id,
                    is_read: msg.is_read || false,
                    message_type: msg.message_type,
                    file_url: msg.file_url,
                    file_name: msg.file_name,
                    file_size: msg.file_size,
                    duration: msg.duration,
                    attachments: msg.attachments,
                    file: msg.file_url ? {
                        url: msg.file_url,
                        name: msg.file_name || 'ملف',
                        size: msg.file_size,
                        type: msg.file_type || (msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image/' : 'file'),
                        isImage: msg.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i),
                        isVoice: msg.message_type === 'voice',
                        duration: msg.duration
                    } : (msg.attachments?.[0] ? {
                        url: msg.attachments[0].url,
                        name: msg.attachments[0].file_name || msg.attachments[0].name,
                        size: msg.attachments[0].size,
                        type: msg.attachments[0].mime_type || msg.attachments[0].type,
                        isImage: (msg.attachments[0].mime_type || '').startsWith('image/'),
                        isVoice: msg.message_type === 'voice',
                        duration: msg.duration
                    } : null)
                }));

                const sortedMessages = formattedMessages.sort((a, b) => a.timestamp - b.timestamp);

                if (page === 1) {
                    setMessages(sortedMessages);
                    setCurrentPage(1);
                    setHasMoreMessages(fetchedMessages.length >= 20);
                    
                    setTimeout(() => {
                        scrollToBottom();
                    }, 300);
                } else {
                    setMessages(prev => {
                        const combined = [...sortedMessages, ...prev];
                        return combined.sort((a, b) => a.timestamp - b.timestamp);
                    });
                    setCurrentPage(prev => prev + 1);
                    setHasMoreMessages(fetchedMessages.length >= 20);
                }

                if (page === 1) {
                    const chatDetails = await messageService.getChatDetails(currentChatId);
                    if (chatDetails.success && chatDetails.data?.chat_uuid) {
                        initializePusher(currentChatId, chatDetails.data.chat_uuid);
                    }
                }
            } else {
                if (page === 1) {
                    setMessages([]);
                }
                setHasMoreMessages(false);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            if (page === 1) {
                toast.error("حدث خطأ في تحميل الرسائل");
                setMessages([]);
            }
        } finally {
            if (page === 1) {
                setMessagesLoading(false);
                setLoading(false);
            }
        }
    }, [isLoggedIn, currentUser.id, initializePusher]);

    // Load more messages (pagination)
    const loadMoreMessages = async () => {
        if (!chatId || !hasMoreMessages || messagesLoading) return;

        try {
            prevScrollHeightRef.current = messagesContainerRef.current?.scrollHeight || 0;
            await loadMessages(chatId, currentPage + 1);
            
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    const newScrollHeight = messagesContainerRef.current.scrollHeight;
                    const scrollDiff = newScrollHeight - prevScrollHeightRef.current;
                    messagesContainerRef.current.scrollTop = scrollDiff;
                }
            }, 100);
        } catch (error) {
            console.error("Error loading more messages:", error);
        }
    };

    // Handle scroll to load more messages
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        
        const { scrollTop } = messagesContainerRef.current;
        
        if (scrollTop < 100 && hasMoreMessages && !messagesLoading && !loading) {
            loadMoreMessages();
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت`);
                return false;
            }
            return true;
        });

        setSelectedFiles(prev => [...prev, ...validFiles]);
        setShowAttachmentMenu(false);
    };

    // Remove file from selection
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Upload files and send message
    const uploadFilesAndSendMessage = async () => {
        if (!chatId || selectedFiles.length === 0 || !isLoggedIn) return;

        try {
            setUploadingFiles(true);
            
            const formData = new FormData();
            
            if (message.trim()) {
                formData.append('message', message);
            }
            
            formData.append('message_type', 'file');

            selectedFiles.forEach((file) => {
                formData.append('file', file);
            });

            const attachments = selectedFiles.map(file => ({
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
                isImage: file.type.startsWith('image/'),
                pending: true
            }));

            const tempMessage = {
                id: `temp-${Date.now()}`,
                type: "user",
                text: message.trim() || (attachments.length === 1 && attachments[0].isImage ? '🖼️ صورة' : '📎 ملف'),
                time: formatMessageTime(new Date().toISOString()),
                timestamp: Date.now(),
                is_temp: true,
                is_outgoing: true,
                isCurrentUser: true,
                is_read: false,
                file: attachments[0],
                attachments: attachments,
                message_type: 'file'
            };

            setMessages(prev => [...prev, tempMessage]);
            setMessage("");
            setSelectedFiles([]);
            scrollToBottom();

            const result = await messageService.sendMessageWithAttachments(chatId, formData);

            if (result.success) {
                setMessages(prev => prev.map(msg => {
                    if (msg.id === tempMessage.id) {
                        const apiMessage = result.data?.message || result.message;
                        
                        return {
                            id: apiMessage?.id || msg.id,
                            type: "user",
                            text: apiMessage?.message || msg.text,
                            time: formatMessageTime(apiMessage?.created_at),
                            timestamp: new Date(apiMessage?.created_at || Date.now()).getTime(),
                            is_outgoing: true,
                            isCurrentUser: true,
                            is_temp: false,
                            is_read: apiMessage?.is_read || false,
                            message_type: apiMessage?.message_type,
                            file_url: apiMessage?.file_url,
                            file_name: apiMessage?.file_name,
                            file_size: apiMessage?.file_size,
                            duration: apiMessage?.duration,
                            attachments: apiMessage?.attachments
                        };
                    }
                    return msg;
                }));
            } else {
                setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                setSelectedFiles(prev => [...prev, ...selectedFiles]);
                toast.error(result.error || result.message || 'فشل إرسال الرسالة');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error('حدث خطأ: ' + error.message);
        } finally {
            setUploadingFiles(false);
        }
    };

    // Send voice message
    // في ملف page.jsx، ابحث عن دالة sendVoiceMessage واستبدلها بهذا:

// Send voice message
const sendVoiceMessage = async (audioFile, duration) => {
  if (!chatId || !isLoggedIn) return;
  
  try {
    setUploadingFiles(true);
    
    const tempId = `temp-${Date.now()}`;
    const tempUrl = URL.createObjectURL(audioFile);
    
    const tempMessage = {
      id: tempId,
      type: "user",
      text: '🎤 رسالة صوتية',
      time: formatMessageTime(new Date().toISOString()),
      timestamp: Date.now(),
      is_temp: true,
      is_outgoing: true,
      isCurrentUser: true,
      is_read: false,
      message_type: 'voice',
      duration: duration,
      file_url: tempUrl,
      file_name: audioFile.name, // سيكون voice-message.mp3
      file_size: audioFile.size,
      file: {
        url: tempUrl,
        name: audioFile.name,
        size: audioFile.size,
        type: 'audio/mp3', // تأكد من أنها MP3
        isVoice: true,
        duration: duration,
        pending: true
      }
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setShowVoiceRecorder(false);
    scrollToBottom();
    
    const result = await messageService.sendVoiceMessage(chatId, audioFile);
    
    if (result.success) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === tempId) {
          const apiMessage = result.data?.message || result.message;
          
          return {
            id: apiMessage?.id || msg.id,
            type: "user",
            text: '🎤 رسالة صوتية',
            time: formatMessageTime(apiMessage?.created_at),
            timestamp: new Date(apiMessage?.created_at || Date.now()).getTime(),
            is_outgoing: true,
            isCurrentUser: true,
            is_temp: false,
            is_read: false,
            message_type: 'voice',
            duration: duration,
            file_url: apiMessage?.file_url || msg.file_url,
            file_name: apiMessage?.file_name || audioFile.name,
            file_size: apiMessage?.file_size || msg.file_size,
            file: {
              url: apiMessage?.file_url || msg.file_url,
              name: apiMessage?.file_name || audioFile.name,
              size: apiMessage?.file_size || msg.file_size,
              type: 'audio/mp3',
              isVoice: true,
              duration: duration,
              pending: false
            }
          };
        }
        return msg;
      }));
      
      URL.revokeObjectURL(tempUrl);
    } else {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      URL.revokeObjectURL(tempUrl);
      toast.error(result.error || 'فشل إرسال التسجيل الصوتي');
    }
  } catch (error) {
    console.error('Error sending voice:', error);
    toast.error('حدث خطأ في إرسال التسجيل الصوتي');
  } finally {
    setUploadingFiles(false);
  }
};

    // Send text message
    const handleSendMessage = async () => {
        if (!isLoggedIn) {
            toast.error("يرجى تسجيل الدخول أولاً");
            return;
        }
        
        if ((!message.trim() && selectedFiles.length === 0) || sending || uploadingFiles || !chatId) return;

        if (selectedFiles.length > 0) {
            await uploadFilesAndSendMessage();
            return;
        }

        try {
            setSending(true);
            
            const tempMessage = {
                id: `temp-${Date.now()}`,
                type: "user",
                text: message,
                time: formatMessageTime(new Date().toISOString()),
                timestamp: Date.now(),
                is_temp: true,
                is_outgoing: true,
                isCurrentUser: true,
                is_read: false,
                message_type: 'text'
            };

            setMessages(prev => [...prev, tempMessage]);
            setMessage("");
            scrollToBottom();

            const result = await messageService.sendMessage(chatId, message);

            if (result.success && result.message) {
                setMessages(prev => prev.map(msg => 
                    msg.id === tempMessage.id ? {
                        id: result.message.id,
                        type: "user",
                        text: result.message.message,
                        time: formatMessageTime(result.message.created_at),
                        timestamp: new Date(result.message.created_at).getTime(),
                        is_outgoing: true,
                        isCurrentUser: true,
                        is_temp: false,
                        is_read: result.message.is_read || false,
                        message_type: 'text'
                    } : msg
                ));
            } else {
                setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
                toast.error(result.error || 'فشل إرسال الرسالة');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            toast.error('حدث خطأ في إرسال الرسالة');
        } finally {
            setSending(false);
        }
    };

    // Search in messages
    const searchMessages = (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const results = messages.filter(msg => 
            msg.text?.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(results.sort((a, b) => b.timestamp - a.timestamp));
        setShowSearchResults(true);
    };

    // Handle emoji click
    const onEmojiClick = (emojiData) => {
        setMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    // Jump to specific message
    const jumpToMessage = (messageId) => {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('bg-blue-50', 'transition-colors', 'duration-1000');
            setTimeout(() => {
                messageElement.classList.remove('bg-blue-50');
            }, 2000);
        }
        setShowSearchResults(false);
        setSearchQuery("");
        setShowSearch(false);
    };

    // Scroll to bottom
    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
                setShowAttachmentMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check authentication on mount
    useEffect(() => {
        checkAuthStatus();
        
        const handleStorageChange = (e) => {
            if (e.key === 'accessToken' || e.key === 'user' || e.key === null) {
                checkAuthStatus();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [checkAuthStatus]);

    // Initialize chat
    useEffect(() => {
        const initializeChat = async () => {
            if (!isLoggedIn) {
                setLoading(false);
                return;
            }

            const firstSupportId = await fetchSupportId();
            
            if (!firstSupportId) {
                setLoading(false);
                return;
            }

            if (typeof window !== 'undefined') {
                const storedChatId = localStorage.getItem('support_chat_id');
                if (storedChatId) {
                    setChatId(parseInt(storedChatId));
                    await loadMessages(parseInt(storedChatId), 1);
                } else {
                    const newChatId = await createOrGetChat();
                    if (newChatId) {
                        await loadMessages(newChatId, 1);
                    } else {
                        setLoading(false);
                    }
                }
            }
        };

        initializeChat();
        
        return () => {
            if (pusherChannel) {
                pusherChannel.unbind_all();
                pusherChannel.unsubscribe();
            }
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            audioRefs.current = {};
        };
    }, [isLoggedIn, fetchSupportId, createOrGetChat, loadMessages]);

    return (
        <div className="flex flex-col h-[500px] sm:h-[600px] md:h-[700px] lg:h-[750px] bg-white dark:bg-card border border-border/60 rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-sm fade-in-up p-1 sm:p-2 md:p-0">
            {/* Chat Header */}
            <div className="p-2 sm:p-3 md:p-4 border-b border-border/60 bg-secondary/5 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-[#579BE8]/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#579BE8]">
                            <BiSupport size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 bg-green-500 border-2 border-white dark:border-card rounded-full shadow-sm" title="متصل الآن" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground text-sm sm:text-base md:text-lg truncate">
                            {loadingSupportId ? 'جاري التحميل...' : 'الدعم الفني'}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-green-500 font-medium truncate">متصل الآن - جاهزون لمساعدتك</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                    <button 
                        onClick={() => {
                            setShowSearch(!showSearch);
                            if (!showSearch) {
                                setTimeout(() => searchInputRef.current?.focus(), 100);
                            } else {
                                setSearchQuery("");
                                setShowSearchResults(false);
                            }
                        }}
                        className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white dark:hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary"
                    >
                        <IoIosSearch size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-1.5 sm:p-2 md:p-2.5 hover:bg-white dark:hover:bg-card rounded-lg sm:rounded-xl border border-transparent hover:border-border transition-all text-muted-foreground hover:text-primary">
                        <FaInfoCircle size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-border/60 bg-secondary/5 overflow-hidden"
                    >
                        <div className="p-2 sm:p-3">
                            <div className="relative">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchMessages(e.target.value);
                                    }}
                                    placeholder="ابحث في المحادثة..."
                                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-9 sm:pr-10 bg-white dark:bg-card border border-border/60 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#579BE8]/50 transition-colors"
                                />
                                <FaSearch className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("");
                                            setShowSearchResults(false);
                                        }}
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground"
                                    >
                                        <FaTimes size={12} className="sm:w-3 sm:h-3" />
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {showSearchResults && searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-card rounded-xl border border-border/60 shadow-lg"
                                    >
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => jumpToMessage(result.id)}
                                                className="w-full text-right px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-[#579BE8]/10 transition-colors border-b border-border/60 last:border-0"
                                            >
                                                <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-1">
                                                    {result.text}
                                                </p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                                                    {result.time} - {result.type === 'user' ? 'أنت' : 'الدعم الفني'}
                                                </p>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                                {showSearchResults && searchQuery && searchResults.length === 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center text-xs text-muted-foreground/60 mt-2"
                                    >
                                        لا توجد نتائج للبحث
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area */}
            <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-secondary"
            >
                {messagesLoading && currentPage === 1 && (
                    <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#579BE8]"></div>
                    </div>
                )}

                {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <BiSupport size={32} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h3>
                        <p className="text-gray-600 text-center mb-4">سجل الدخول للتواصل مع الدعم الفني</p>
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="px-6 py-2 bg-[#579BE8] text-white rounded-lg hover:bg-[#4a8bd1] transition-colors"
                        >
                            تسجيل الدخول
                        </button>
                    </div>
                ) : loading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-2 sm:space-y-3">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-7 sm:h-7 md:h-8 md:w-8 border-b-2 border-[#579BE8] mx-auto"></div>
                            <p className="text-xs sm:text-sm text-muted-foreground">جاري تحميل المحادثة...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => (
                                <motion.div
                                    id={`message-${msg.id}`}
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === "user" ? "justify-start" : "justify-end"}`}
                                >
                                    <div className={`max-w-[85%] sm:max-w-[80%] md:max-w-[75%] space-y-0.5 sm:space-y-1 ${msg.type === "user" ? "items-end" : "items-start"}`}>
                                        <div
                                            style={{
                                                backgroundColor: msg.type === "user" ? MESSAGE_COLORS.outgoing.bg : MESSAGE_COLORS.incoming.bg,
                                                color: msg.type === "user" ? MESSAGE_COLORS.outgoing.text : MESSAGE_COLORS.incoming.text
                                            }}
                                            className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed ${
                                                msg.type === "user"
                                                    ? "rounded-tl-none"
                                                    : "rounded-tr-none"
                                            } ${msg.is_temp ? "opacity-70" : ""}`}
                                        >
                                            {msg.file && (
                                                <div className="mb-2">
                                                    {msg.file.isVoice ? (
                                                        renderVoiceMessage(msg, msg.file)
                                                    ) : msg.file.isImage ? (
                                                        <div className="relative group">
                                                            <img 
                                                                src={msg.file.url} 
                                                                alt={msg.file.name}
                                                                className="max-w-full max-h-48 sm:max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => window.open(msg.file.url, '_blank')}
                                                            />
                                                            {msg.file.pending && (
                                                                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                                                            {getFileIcon(msg.file.type)}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium truncate">{msg.file.name}</p>
                                                                {msg.file.size && (
                                                                    <p className="text-[10px] opacity-70">{formatFileSize(msg.file.size)}</p>
                                                                )}
                                                            </div>
                                                            {msg.file.url && !msg.file.pending && (
                                                                <a 
                                                                    href={msg.file.url} 
                                                                    download={msg.file.name}
                                                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <FaDownload className="w-3 h-3" />
                                                                </a>
                                                            )}
                                                            {msg.file.pending && (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {!msg.file?.isVoice && renderFileMessage(msg)}
                                            
                                            {msg.text && !msg.file?.isVoice && msg.message_type !== 'voice' && (
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 px-1">
                                            {msg.type === "support" && (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-[#579BE8] uppercase tracking-wider">
                                                    الدعم الفني
                                                </span>
                                            )}
                                            <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">{msg.time}</span>
                                            {msg.is_temp && (
                                                <span className="text-[9px] sm:text-[10px] text-muted-foreground/60">⏳</span>
                                            )}
                                            {msg.type === "user" && (
                                                msg.is_read ? (
                                                    <FaCheckDouble className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <FaCheck className="w-3 h-3 text-muted-foreground/60" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Attachment Preview */}
            <AnimatePresence>
                {selectedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="px-2 sm:px-3 md:px-4 pt-2 sm:pt-3"
                    >
                        <div className="bg-secondary/10 rounded-xl p-2 sm:p-3 border border-border/60">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-foreground">
                                    المرفقات ({selectedFiles.length})
                                </span>
                                <button
                                    onClick={() => {
                                        selectedFiles.forEach(file => {
                                            if (file.preview) URL.revokeObjectURL(file.preview);
                                        });
                                        setSelectedFiles([]);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                                >
                                    <FaTimes size={14} />
                                    <span>مسح الكل</span>
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {selectedFiles.map((file, index) => {
                                    const previewUrl = URL.createObjectURL(file);
                                    
                                    return (
                                        <div
                                            key={index}
                                            className="relative group bg-white rounded-lg border border-border/60 p-2 pr-8"
                                        >
                                            <button
                                                onClick={() => {
                                                    URL.revokeObjectURL(previewUrl);
                                                    removeFile(index);
                                                }}
                                                className="absolute left-1 top-1 text-gray-400 hover:text-red-500 z-10"
                                            >
                                                <FaTimes size={14} />
                                            </button>
                                            
                                            <div className="flex items-center gap-2">
                                                {file.type.startsWith('image/') ? (
                                                    <div className="w-12 h-12 rounded overflow-hidden">
                                                        <img
                                                            src={previewUrl}
                                                            alt={file.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
                                                        {getFileIcon(file.type)}
                                                    </div>
                                                )}
                                                
                                                <div className="flex-1 min-w-0 max-w-[150px]">
                                                    <p className="text-xs font-medium text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice Recorder */}
            <AnimatePresence>
                {showVoiceRecorder && (
                    <VoiceRecorder
                        onSend={sendVoiceMessage}
                        onCancel={() => setShowVoiceRecorder(false)}
                    />
                )}
            </AnimatePresence>

            {/* Input Bar */}
            {isLoggedIn && (
                <div className="p-2 sm:p-3 md:p-4 lg:p-5 border-t border-border/60 bg-secondary/5">
                    <div className="relative">
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div
                                    ref={emojiPickerRef}
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 z-50"
                                >
                                    <div className="bg-white dark:bg-card rounded-xl shadow-lg border border-border/60 overflow-hidden">
                                        <EmojiPicker
                                            onEmojiClick={onEmojiClick}
                                            autoFocusSearch={false}
                                            theme="light"
                                            height={350}
                                            width={300}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Attachment Menu */}
                        <AnimatePresence>
                            {showAttachmentMenu && (
                                <motion.div
                                    ref={attachmentMenuRef}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-lg shadow-xl border border-border/60 overflow-hidden"
                                >
                                    <div className="p-2 min-w-[200px]">
                                        <button
                                            onClick={() => {
                                                fileInputRef.current?.click();
                                                setShowAttachmentMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <FaFile className="text-[#579BE8]" size={16} />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">مستند</p>
                                                <p className="text-xs text-gray-500">PDF, Word, Excel</p>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                imageInputRef.current?.click();
                                                setShowAttachmentMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <FaFile className="text-green-600" size={16} />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">صورة</p>
                                                <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'video/*,audio/*';
                                                input.multiple = true;
                                                input.onchange = (e) => handleFileSelect(e);
                                                input.click();
                                                setShowAttachmentMenu(false);
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                <FaFile className="text-purple-600" size={16} />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">وسائط متعددة</p>
                                                <p className="text-xs text-gray-500">فيديو, صوت</p>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Hidden file inputs */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <input
                            ref={imageInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className="flex items-end gap-1.5 sm:gap-2 md:gap-3 bg-white dark:bg-card p-1.5 sm:p-2 rounded-2xl sm:rounded-[24px] md:rounded-[28px] border border-border/60 shadow-inner group focus-within:border-[#579BE8]/50 transition-colors">
                            <div className="flex items-center gap-0.5 sm:gap-1 pb-0.5 sm:pb-1 pr-1 sm:pr-2 flex-shrink-0">
                                <button 
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all"
                                >
                                    <FaSmile size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                </button>
                                <button 
                                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                                    className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-[#579BE8] hover:bg-[#579BE8]/5 rounded-full transition-all relative"
                                    disabled={sending || uploadingFiles}
                                >
                                    <FaPaperclip size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                    {selectedFiles.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#579BE8] text-white text-xs rounded-full flex items-center justify-center">
                                            {selectedFiles.length}
                                        </span>
                                    )}
                                </button>
                                <button 
                                    onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                                    className={`p-1.5 sm:p-2 md:p-2.5 rounded-full transition-all ${
                                        showVoiceRecorder 
                                            ? 'bg-red-500 text-white hover:bg-red-600' 
                                            : 'text-muted-foreground hover:text-red-500 hover:bg-red-50'
                                    }`}
                                    disabled={sending || uploadingFiles}
                                    title="تسجيل صوتي"
                                >
                                    <FaMicrophone size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                </button>
                            </div>

                            <textarea
                                rows={1}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder={sending || uploadingFiles ? "جاري الإرسال..." : "اكتب رسالتك هنا..."}
                                className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-medium py-2 sm:py-2.5 md:py-3 outline-none resize-none max-h-24 sm:max-h-28 md:max-h-32 text-foreground scrollbar-none"
                                style={{ height: 'auto' }}
                                disabled={sending || uploadingFiles}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />

                            <button
                                onClick={handleSendMessage}
                                className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center flex-shrink-0 ${
                                    (message.trim() || selectedFiles.length > 0) && !sending && !uploadingFiles
                                        ? "bg-[#579BE8] text-white hover:bg-[#4a8bd1] shadow-[#579BE8]/20"
                                        : "bg-secondary/40 text-muted-foreground cursor-not-allowed"
                                }`}
                                disabled={(!message.trim() && selectedFiles.length === 0) || sending || uploadingFiles}
                            >
                                {sending || uploadingFiles ? (
                                    <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 border-b-2 border-white"></div>
                                ) : (
                                    <FaPaperPlane size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px] sm:translate-x-[-1px]" />
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-[9px] sm:text-[10px] text-muted-foreground/60 mt-2 sm:mt-3 font-medium px-2">
                        سيقوم فريقنا بالرد عليك في أقرب وقت ممكن. نحن هنا لمساعدتك دائماً.
                    </p>
                </div>
            )}
        </div>
    );
}