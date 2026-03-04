// components/Chat/ChatModal.js
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { messageService } from "../../../Services/message.service";
import Pusher from 'pusher-js';
import EmojiPicker from 'emoji-picker-react';

import { 
  X, Users, MessageCircle, Plus, Search, Clock, User, CheckCircle, 
  Phone, Video, Info, Send, Paperclip, Smile, ImageIcon, FileText, 
  Mic, ChevronLeft, Star, MoreVertical, Check, CheckCheck, Lock, 
  HeadphonesIcon, ArrowLeft, Eye, EyeOff, CircleDot, LogIn, XCircle,
  Download, Trash2, File, Film, Music, Archive, Headset, HelpCircle
} from "lucide-react";

// ثابت معرف الدعم الفني
const SUPPORT_ID = 72;

const ChatModal = ({ 
  isOpen, 
  onClose, 
  currentUserId = 39, 
  defaultParticipantId = null,
  defaultParticipantName = null,
  isSupport = false,
  initialChatId = null,
  showDriversOnly = false
}) => {
  // States
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [participantId, setParticipantId] = useState(defaultParticipantId || "");
  const [participantName, setParticipantName] = useState("");
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pusherChannel, setPusherChannel] = useState(null);
  const [supportChat, setSupportChat] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: currentUserId,
    name: 'المستخدم',
    email: '',
    phone: ''
  });
  
  // Emoji & File States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatsContainerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const chatCreationAttemptedRef = useRef(null);
  const processedParticipantIdRef = useRef(null);
  const chatCreationFailedRef = useRef(null);
  const errorShownRef = useRef(null);
  const lastLoadedChatIdRef = useRef(null);
  const pusherInitializedRef = useRef(false);
  const attachmentMenuRef = useRef(null);

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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (!fileType) return <File size={20} />;
    
    const type = fileType.toLowerCase();
    
    if (type.startsWith('image/') || type.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return <ImageIcon size={20} />;
    }
    if (type.startsWith('video/') || type.match(/\.(mp4|mov|avi|mkv)$/)) {
      return <Film size={20} />;
    }
    if (type.startsWith('audio/') || type.match(/\.(mp3|wav|ogg)$/)) {
      return <Music size={20} />;
    }
    if (type.includes('pdf') || type.match(/\.pdf$/)) {
      return <FileText size={20} className="text-red-500" />;
    }
    if (type.includes('word') || type.includes('doc') || type.match(/\.(doc|docx)$/)) {
      return <FileText size={20} className="text-blue-500" />;
    }
    if (type.includes('excel') || type.includes('xls') || type.match(/\.(xls|xlsx)$/)) {
      return <FileText size={20} className="text-green-500" />;
    }
    if (type.includes('zip') || type.includes('rar') || type.match(/\.(zip|rar|7z)$/)) {
      return <Archive size={20} className="text-yellow-600" />;
    }
    
    return <File size={20} />;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`الملف ${file.name} كبير جداً. الحد الأقصى 10 ميجابايت`);
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

  // Check if chat is support chat
  const isSupportChat = useCallback((chat) => {
    if (!chat || !chat.participants) return false;
    
    // Check if SUPPORT_ID exists in participants
    return chat.participants.some(p => 
      String(p) === String(SUPPORT_ID) || 
      Number(p) === SUPPORT_ID
    );
  }, []);

  // Get chat name
  const getChatName = useCallback((chat) => {
    // إذا كانت محادثة الدعم
    if (isSupportChat(chat)) {
      return 'الدعم الفني';
    }

    const otherParticipants = chat.participants?.filter(p => {
      return String(p) !== String(currentUser.id) && String(p) !== String(SUPPORT_ID);
    }) || [];
    
    if (otherParticipants.length > 0) {
      const participant = otherParticipants[0];
      
      if (typeof participant === 'number' || /^\d+$/.test(participant)) {
        if (chat.type === "user_driver") {
          return `سائق ${participant}`;
        } else {
          return `المستخدم ${participant}`;
        }
      }
      
      return String(participant);
    }
    
    return `الدردشة ${chat.id}`;
  }, [currentUser.id, isSupportChat]);

  // Get chat avatar
  const getChatAvatar = useCallback((chat) => {
    if (isSupportChat(chat)) {
      return <Headset size={20} />;
    }
    
    const chatName = getChatName(chat);
    return chatName.charAt(0);
  }, [getChatName, isSupportChat]);

  // Get chat avatar color
  const getChatAvatarColor = useCallback((chat) => {
    if (isSupportChat(chat)) {
      return 'bg-purple-500';
    }
    return chat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500';
  }, [isSupportChat]);

  // Upload files and send message
  const uploadFilesAndSendMessage = async () => {
    if (!selectedChat || selectedFiles.length === 0 || !isLoggedIn) return;

    try {
      setUploadingFiles(true);
      
      const formData = new FormData();
      
      if (newMessage.trim()) {
        formData.append('message', newMessage);
      }
      
      if (selectedFiles.length > 0) {
        formData.append('message_type', 'file');
      }

      selectedFiles.forEach((file, index) => {
        formData.append('files[]', file);
      });

      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage.trim() || '',
        sender_id: currentUser.id,
        sender_type: "App\\Models\\User",
        isCurrentUser: true,
        is_temp: true,
        is_outgoing: true,
        message_type: 'file',
        attachments: selectedFiles.map(file => ({
          file_name: file.name,
          size: file.size,
          mime_type: file.type,
          url: URL.createObjectURL(file),
          pending: true,
          file: file
        })),
        created_at: new Date().toISOString(),
        formattedTime: formatMessageTime(new Date().toISOString())
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      setSelectedFiles([]);
      scrollToBottom();

      const result = await messageService.sendMessageWithAttachments(
        selectedChat.id, 
        formData
      );

      if (result.success) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === tempMessage.id) {
            return {
              ...msg,
              id: result.message?.id || msg.id,
              is_temp: false,
              pending: false,
              attachments: msg.attachments.map(att => ({
                ...att,
                pending: false,
                ...(result.message?.attachments?.[0] || {})
              }))
            };
          }
          return msg;
        }));
        
        setTimeout(() => {
          loadMessages(selectedChat.id);
        }, 500);
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        setSelectedFiles(prev => [...prev, ...(tempMessage.attachments?.map(a => a.file) || [])]);
        alert(result.message || 'فشل إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('حدث خطأ: ' + error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }
    
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending || uploadingFiles || !selectedChat) return;

    if (selectedFiles.length > 0) {
      await uploadFilesAndSendMessage();
      return;
    }

    try {
      setSending(true);
      
      const tempMessage = {
        id: `temp-${Date.now()}`,
        message: newMessage,
        sender_id: currentUser.id,
        sender_type: "App\\Models\\User",
        isCurrentUser: true,
        is_temp: true,
        is_outgoing: true,
        message_type: "text",
        metadata: ["text"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        read_at: null,
        formattedTime: formatMessageTime(new Date().toISOString())
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      scrollToBottom();

      const result = await messageService.sendMessage(selectedChat.id, newMessage);
      
      if (result.success && result.message) {
        setMessages(prev => {
          const newMessages = prev.map(msg => 
            msg.id === tempMessage.id ? {
              ...result.message,
              isCurrentUser: true,
              is_outgoing: true,
              formattedTime: formatMessageTime(result.message.created_at)
            } : msg
          );
          return newMessages;
        });
        
        await loadChats();
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        console.error('Failed to send message:', result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setSending(false);
    }
  };

  // Handle emoji click
  const onEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
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

  // Render attachment preview
  const renderAttachmentPreview = () => {
    if (selectedFiles.length === 0) return null;

    return (
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
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
            <Trash2 size={16} />
            <span>مسح الكل</span>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {selectedFiles.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            
            return (
              <div
                key={index}
                className="relative group bg-white rounded-lg border border-gray-200 p-2 pr-8"
              >
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewUrl);
                    removeFile(index);
                  }}
                  className="absolute left-1 top-1 text-gray-400 hover:text-red-500 z-10"
                >
                  <XCircle size={16} />
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
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render file message
  const renderFileMessage = (message) => {
    const attachments = message.attachments || [];
    if (attachments.length === 0) return null;

    return (
      <div className="space-y-2 mt-2">
        {attachments.map((attachment, index) => {
          const fileName = attachment.file_name || attachment.name || 'ملف';
          const fileSize = attachment.size || attachment.file_size;
          const mimeType = attachment.mime_type || attachment.type;
          
          const isImage = mimeType?.startsWith('image/') || 
                         fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          
          const imageUrl = attachment.url || 
                          (attachment.file ? URL.createObjectURL(attachment.file) : null);
          
          if (isImage && imageUrl) {
            return (
              <div key={index} className="relative group max-w-[300px]">
                <img
                  src={imageUrl}
                  alt={fileName}
                  className={`rounded-lg max-h-64 w-auto object-cover cursor-pointer transition-all ${
                    attachment.pending ? 'opacity-70' : 'hover:opacity-90'
                  }`}
                  onClick={() => !attachment.pending && window.open(imageUrl, '_blank')}
                />
                
                {attachment.pending && (
                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                    <div className="bg-white rounded-full p-2 shadow-lg">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>
            );
          }
          
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
                <p className="text-sm font-medium text-gray-800 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {fileSize ? formatFileSize(fileSize) : 'ملف'}
                  {!attachment.pending && fileName.split('.').pop() && ` • ${fileName.split('.').pop().toUpperCase()}`}
                </p>
              </div>
              {attachment.pending ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Download size={18} className="text-gray-500 flex-shrink-0" />
              )}
            </a>
          );
        })}
      </div>
    );
  };

  const handleNewPusherMessage = useCallback((newMessage) => {
    console.log('📨 معالجة رسالة جديدة من Pusher:', newMessage);
    
    if (selectedChat && selectedChat.id === newMessage.chat_id) {
      setMessages(prevMessages => {
        const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
        if (messageExists) {
          return prevMessages;
        }
        
        const formattedMessage = {
          ...newMessage,
          isCurrentUser: newMessage.sender_id === currentUser.id,
          is_outgoing: newMessage.sender_id === currentUser.id,
          formattedTime: formatMessageTime(newMessage.created_at)
        };
        
        const updatedMessages = [...prevMessages, formattedMessage];
        return updatedMessages.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeA - timeB;
        });
      });
      
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === newMessage.chat_id) {
            return {
              ...chat,
              last_message: newMessage.message,
              last_message_at: newMessage.created_at,
              updated_at: newMessage.created_at,
              unreadCount: (chat.unreadCount || 0) + 1
            };
          }
          return chat;
        })
      );
    }
  }, [selectedChat, currentUser.id]);

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
        if (data.message) {
          if (!data.message.chat_id && data.chat) {
            data.message.chat_id = data.chat.id;
          }
          handleNewPusherMessage(data.message);
        }
      });
      
      setPusherChannel(channel);
      return channel;
    } catch (error) {
      console.error('Pusher initialization failed:', error);
      return null;
    }
  }, [isLoggedIn, handleNewPusherMessage]);

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
            id: parsedUser.id || currentUserId,
            name: parsedUser.name || parsedUser.username || 'المستخدم',
            email: parsedUser.email || '',
            phone: parsedUser.phone || ''
          });
        } else {
          setCurrentUser({
            id: currentUserId,
            name: 'المستخدم',
            email: '',
            phone: ''
          });
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsLoggedIn(false);
      }
    }
  }, [currentUserId]);

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

  const showLoginToast = (customMessage = '') => {
    if (typeof window === 'undefined') return;

    const toast = document.createElement('div');
    toast.id = 'chat-login-toast';
    
    const message = customMessage || 'سجل الدخول لعرض المحادثات وإرسال الرسائل';
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 100000;
      max-width: 400px;
      animation: slideInToast 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    toast.innerHTML = `
      <svg style="width: 24px; height: 24px; flex-shrink: 0;" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <div style="flex: 1;">
        <strong style="display: block; margin-bottom: 4px; font-size: 14px;">${customMessage ? 'تنبيه' : 'يجب تسجيل الدخول'}</strong>
        <span style="font-size: 13px; opacity: 0.9;">${message}</span>
      </div>
      <button id="close-chat-toast" style="background: none; border: none; color: white; cursor: pointer; opacity: 0.7; padding: 4px;">
        ✕
      </button>
    `;
    
    if (!document.getElementById('chat-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-toast-styles';
      style.textContent = `
        @keyframes slideInToast {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToast {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        #chat-login-toast button:hover {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
    
    const existingToast = document.getElementById('chat-login-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    document.body.appendChild(toast);
    
    const closeBtn = toast.querySelector('#close-chat-toast');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });
    
    setTimeout(() => {
      removeToast(toast);
    }, 6000);
  };

  const removeToast = (toast) => {
    if (toast && toast.parentNode) {
      toast.style.animation = 'slideOutToast 0.3s ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  };

  // Create or get support chat
  const openSupportChat = useCallback(async () => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }

    // Check if support chat already exists in chats
    if (supportChat) {
      setSelectedChat(supportChat);
      return;
    }

    // Check if we already attempted to create support chat
    if (chatCreationAttemptedRef.current === SUPPORT_ID) {
      return;
    }

    try {
      chatCreationAttemptedRef.current = SUPPORT_ID;
      setCreatingChat(true);

      // التحقق من تسجيل الدخول أولاً
      const isAuthenticated = messageService.checkAuthStatus();
      if (!isAuthenticated) {
        showLoginToast("يرجى تسجيل الدخول أولاً");
        return;
      }

      // Try to create support chat
      const result = await messageService.createChat(
        SUPPORT_ID, 
        "user_user",
        "الدعم الفني"
      );

      if (result.success && result.chat) {
        const newChatId = result.chat.id || result.chat.chat_id;
        
        if (newChatId) {
          // Store support chat ID in localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('support_chat_id', newChatId.toString());
          }
          
          // Refresh chats list
          await loadChats();
          
          // Find and select the support chat
          const updatedChats = await messageService.getChats();
          if (updatedChats.success && Array.isArray(updatedChats.data)) {
            const supportChatFound = updatedChats.data.find(chat => isSupportChat(chat));
            if (supportChatFound) {
              setSupportChat(supportChatFound);
              setSelectedChat(supportChatFound);
            } else if (result.chat) {
              setSelectedChat(result.chat);
              setSupportChat(result.chat);
            }
          }
        }
      } else {
        console.error('Failed to create support chat:', result.error);
        
        // Try to get existing support chat from localStorage
        if (typeof window !== 'undefined') {
          const storedChatId = localStorage.getItem('support_chat_id');
          if (storedChatId) {
            await loadChats();
            const updatedChats = await messageService.getChats();
            if (updatedChats.success && Array.isArray(updatedChats.data)) {
              const supportChatFound = updatedChats.data.find(chat => isSupportChat(chat));
              if (supportChatFound) {
                setSupportChat(supportChatFound);
                setSelectedChat(supportChatFound);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error opening support chat:', error);
    } finally {
      setCreatingChat(false);
    }
  }, [isLoggedIn, supportChat, isSupportChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await messageService.getChats();
      
      if (response.success && Array.isArray(response.data)) {
        const chatsWithUnread = response.data.map(chat => {
          const unreadCount = calculateUnreadCount(chat);
          return {
            ...chat,
            unreadCount,
            lastActive: chat.last_message_at || chat.updated_at,
            isActive: selectedChat?.id === chat.id
          };
        });
        
        const sortedChats = chatsWithUnread.sort((a, b) => {
          const timeA = new Date(a.lastActive || 0).getTime();
          const timeB = new Date(b.lastActive || 0).getTime();
          return timeB - timeA;
        });
        
        setChats(sortedChats);
        setFilteredChats(sortedChats);
        
        // Find and store support chat
        const supportChatFound = sortedChats.find(chat => isSupportChat(chat));
        setSupportChat(supportChatFound || null);
        
        // If support chat exists in localStorage but not found, clear it
        if (typeof window !== 'undefined' && !supportChatFound) {
          localStorage.removeItem('support_chat_id');
        }
        
        if (initialChatId && !selectedChat) {
          const foundChat = sortedChats.find(chat => chat.id == initialChatId);
          if (foundChat) {
            setSelectedChat(foundChat);
          }
        }
      } else {
        setChats([]);
        setFilteredChats([]);
        setSupportChat(null);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
      setFilteredChats([]);
      setSupportChat(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateUnreadCount = (chat) => {
    if (!chat.messages || !Array.isArray(chat.messages)) return 0;
    
    return chat.messages.filter(msg => {
      if (!msg.sender_id) return false;
      const currentUserIdStr = String(currentUser.id);
      const senderIdStr = String(msg.sender_id);
      
      return !msg.is_read && senderIdStr !== currentUserIdStr;
    }).length;
  };

  const loadMessages = useCallback(async (chatId) => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }
    
    if (lastLoadedChatIdRef.current === chatId) {
      return;
    }
    
    try {
      setMessagesLoading(true);
      lastLoadedChatIdRef.current = chatId;
      
      const response = await messageService.getMessages(chatId);
      
      if (response.success && Array.isArray(response.data)) {
        const sortedMessages = response.data.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeA - timeB;
        });
        
        const formattedMsgs = sortedMessages.map(msg => ({
          ...msg,
          isCurrentUser: String(msg.sender_id) === String(currentUser.id),
          formattedTime: formatMessageTime(msg.created_at),
          is_outgoing: String(msg.sender_id) === String(currentUser.id)
        }));
        
        setMessages(formattedMsgs);
        
        setTimeout(() => {
          markChatAsRead(chatId);
        }, 100);
        
        scrollToBottom();
        
        const currentChat = chats.find(chat => chat.id === chatId);
        if (currentChat && currentChat.chat_uuid) {
          initializePusher(chatId, currentChat.chat_uuid);
        }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
      lastLoadedChatIdRef.current = null;
    } finally {
      setMessagesLoading(false);
    }
  }, [isLoggedIn, currentUser.id, chats, initializePusher]);

  useEffect(() => {
    if (selectedChat?.id && selectedChat?.chat_uuid && isLoggedIn) {
      initializePusher(selectedChat.id, selectedChat.chat_uuid);
    }
  }, [selectedChat?.id, selectedChat?.chat_uuid, isLoggedIn, initializePusher]);

  const createNewChatWithParticipant = useCallback(async () => {
    if (!defaultParticipantId || creatingChat || !isLoggedIn) return;
    
    if (chatCreationAttemptedRef.current === defaultParticipantId) {
      return;
    }
    
    if (chatCreationFailedRef.current === defaultParticipantId) {
      return;
    }
    
    try {
      chatCreationAttemptedRef.current = defaultParticipantId;
      processedParticipantIdRef.current = defaultParticipantId;
      
      setCreatingChat(true);
      setShowNewChatForm(true);
      
      const result = await messageService.createChat(
        defaultParticipantId, 
        "user_user", 
        defaultParticipantName || defaultParticipantId
      );
      
      if (result.success) {
        chatCreationFailedRef.current = null;
        errorShownRef.current = null;
        
        try {
          setLoading(true);
          const response = await messageService.getChats();
          
          if (response.success && Array.isArray(response.data)) {
            setChats(response.data);
            setFilteredChats(response.data);
          }
        } catch (loadError) {
          console.error('Error loading chats:', loadError);
        } finally {
          setLoading(false);
        }
        
        if (result.chat) {
          setSelectedChat(result.chat);
          setShowNewChatForm(false);
        } else {
          const newChatsResponse = await messageService.getChats();
          if (newChatsResponse.success && Array.isArray(newChatsResponse.data)) {
            const foundChat = newChatsResponse.data.find(chat => 
              chat.participants?.includes(defaultParticipantId) ||
              chat.participants?.includes(Number(defaultParticipantId)) ||
              chat.participants?.includes(String(defaultParticipantId))
            );
            
            if (foundChat) {
              setSelectedChat(foundChat);
              setShowNewChatForm(false);
            }
          }
        }
      } else {
        chatCreationFailedRef.current = defaultParticipantId;
        errorShownRef.current = defaultParticipantId;
        setShowNewChatForm(false);
      }
    } catch (error) {
      chatCreationFailedRef.current = defaultParticipantId;
      errorShownRef.current = defaultParticipantId;
      setShowNewChatForm(false);
    } finally {
      setCreatingChat(false);
    }
  }, [defaultParticipantId, defaultParticipantName, creatingChat, isLoggedIn]);

  const createNewChat = async () => {
    if (!isLoggedIn) {
      showLoginToast();
      return;
    }
    
    if (!participantId.trim()) {
      showLoginToast("يرجى إدخال معرف المستخدم");
      return;
    }

    // Prevent creating duplicate support chat
    if (String(participantId) === String(SUPPORT_ID)) {
      openSupportChat();
      setShowNewChatForm(false);
      setParticipantId("");
      setParticipantName("");
      return;
    }

    try {
      setCreatingChat(true);
      
      const result = await messageService.createChat(
        participantId, 
        "user_user", 
        participantName || participantId
      );
      
      if (result.success) {
        await loadChats();
        
        if (result.chat) {
          setSelectedChat(result.chat);
        } else {
          const newChatsResponse = await messageService.getChats();
          if (newChatsResponse.success && Array.isArray(newChatsResponse.data)) {
            const foundChat = newChatsResponse.data.find(chat => 
              chat.participants?.includes(participantId) ||
              chat.participants?.includes(Number(participantId))
            );
            
            if (foundChat) {
              setSelectedChat(foundChat);
            }
          }
        }
        
        setShowNewChatForm(false);
        setParticipantId("");
        setParticipantName("");
      } else {
        console.error('Failed to create chat:', result.error);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  const markChatAsRead = useCallback(async (chatId) => {
    try {
      setChats(prev => {
        const needsUpdate = prev.some(chat => 
          chat.id === chatId && chat.unreadCount > 0
        );
        if (!needsUpdate) return prev;
        
        return prev.map(chat => {
          if (chat.id === chatId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        });
      });
      
      setMessages(prev => {
        const needsUpdate = prev.some(msg => 
          !msg.isCurrentUser && !msg.is_read
        );
        if (!needsUpdate) return prev;
        
        return prev.map(msg => ({
          ...msg,
          is_read: msg.isCurrentUser ? msg.is_read : true
        }));
      });
    } catch (error) {
      console.error('Error marking chat as read:', error);
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatChatTime = (timestamp) => {
    if (!timestamp) return 'الآن';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMinutes < 1) return 'الآن';
      if (diffMinutes < 60) return `${diffMinutes} د`;
      if (diffHours < 24) return `${diffHours} س`;
      if (diffDays < 7) return `${diffDays} يوم`;
      
      return date.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'الآن';
    }
  };

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date >= today) return 'اليوم';
      if (date >= yesterday) return 'أمس';
      
      return date.toLocaleDateString('ar-SA', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const groupMessagesByDate = () => {
    const groups = {};
    const sortedMessages = [...messages].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeA - timeB;
    });
    
    sortedMessages.forEach(message => {
      const date = formatMessageDate(message.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    
    return groups;
  };

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      loadChats();
    } else if (isOpen && !isLoggedIn) {
      setLoading(false);
      setChats([]);
      setFilteredChats([]);
      setSupportChat(null);
    }
    
    return () => {
      if (pusherChannel) {
        pusherChannel.unbind_all();
        pusherChannel.unsubscribe();
      }
    };
  }, [isOpen, isLoggedIn]);

  useEffect(() => {
    let filtered = chats;
    
    if (showDriversOnly) {
      filtered = chats.filter(chat => chat.type === "user_driver");
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(chat => {
        const chatName = getChatName(chat).toLowerCase();
        const lastMessage = (chat.last_message || '').toLowerCase();
        const chatIdStr = `الدردشة ${chat.id}`.toLowerCase();
        
        return (
          chatName.includes(query) ||
          lastMessage.includes(query) ||
          chatIdStr.includes(query)
        );
      });
    }
    
    setFilteredChats(filtered);
  }, [searchQuery, chats, showDriversOnly, getChatName]);

  useEffect(() => {
    if (defaultParticipantId) {
      setParticipantId(defaultParticipantId);
      if (defaultParticipantName) {
        setParticipantName(defaultParticipantName);
      }
    }
  }, [defaultParticipantId, defaultParticipantName]);

  useEffect(() => {
    if (selectedChat?.id && isLoggedIn) {
      const chatId = selectedChat.id;
      
      if (lastLoadedChatIdRef.current !== chatId) {
        loadMessages(chatId);
      }
      
      setChats(prev => {
        const needsUpdate = prev.some(chat => 
          (chat.isActive && chat.id !== chatId) || 
          (!chat.isActive && chat.id === chatId)
        );
        
        if (!needsUpdate) return prev;
        
        return prev.map(chat => ({
          ...chat,
          isActive: chat.id === chatId
        }));
      });
    } else if (!selectedChat) {
      lastLoadedChatIdRef.current = null;
      setMessages([]);
      
      if (pusherChannel) {
        pusherChannel.unbind_all();
        pusherChannel.unsubscribe();
        setPusherChannel(null);
      }
    }
  }, [selectedChat?.id, isLoggedIn, loadMessages]);

  useEffect(() => {
    if (!isOpen) {
      chatCreationAttemptedRef.current = null;
      processedParticipantIdRef.current = null;
      chatCreationFailedRef.current = null;
      errorShownRef.current = null;
      return;
    }
    
    if (processedParticipantIdRef.current !== defaultParticipantId) {
      chatCreationAttemptedRef.current = null;
      chatCreationFailedRef.current = null;
      errorShownRef.current = null;
    }
    
    if (isOpen && isLoggedIn && defaultParticipantId && chats.length > 0 && !loading && !creatingChat) {
      if (
        (processedParticipantIdRef.current === defaultParticipantId && chatCreationAttemptedRef.current === defaultParticipantId) ||
        chatCreationFailedRef.current === defaultParticipantId
      ) {
        return;
      }
      
      const existingChat = chats.find(chat => 
        chat.participants?.includes(defaultParticipantId) ||
        chat.participants?.includes(Number(defaultParticipantId)) ||
        chat.participants?.includes(String(defaultParticipantId))
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        setShowNewChatForm(false);
        processedParticipantIdRef.current = defaultParticipantId;
        chatCreationAttemptedRef.current = null;
        chatCreationFailedRef.current = null;
        errorShownRef.current = null;
      } else {
        if (
          chatCreationAttemptedRef.current !== defaultParticipantId &&
          chatCreationFailedRef.current !== defaultParticipantId
        ) {
          createNewChatWithParticipant();
        }
      }
    }
  }, [isOpen, chats, loading, defaultParticipantId, defaultParticipantName, isLoggedIn, creatingChat, createNewChatWithParticipant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white w-full h-full md:w-[95%] md:h-[90vh] md:max-w-7xl md:mx-auto md:mt-5 md:rounded-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Sidebar - قائمة المحادثات */}
        {!defaultParticipantId && (
          <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} md:w-[400px] flex-col h-full border-r border-gray-200`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="text-[#579BE8]" size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">المحادثات</h2>
                  <p className="text-sm text-gray-700">{currentUser.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (!isLoggedIn) {
                      showLoginToast();
                      return;
                    }
                    setShowNewChatForm(true);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="محادثة جديدة"
                >
                  <Plus size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Support Chat Button - زر الدعم الفني */}
            {isLoggedIn && (
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <button
                  onClick={openSupportChat}
                  disabled={creatingChat}
                  className="w-full bg-white border-2 border-purple-200 rounded-xl p-3 hover:border-purple-300 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Headset size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      فريق الدعم الفني
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">متصل الآن</span>
                    </h3>
                    <p className="text-sm text-gray-600">جاهزون لمساعدتك - تواصل معنا</p>
                  </div>
                  {creatingChat && (
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="بحث في المحادثات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* New Chat Form */}
            <AnimatePresence>
              {showNewChatForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-b border-gray-200"
                >
                  <div className="p-4 bg-blue-50">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">بدء محادثة جديدة</h3>
                        <button
                          onClick={() => {
                            setShowNewChatForm(false);
                            setParticipantId("");
                            setParticipantName("");
                          }}
                          className="text-gray-700 hover:text-gray-700 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">معرف المستخدم (ID)</label>
                          <input
                            type="text"
                            value={participantId}
                            onChange={(e) => setParticipantId(e.target.value)}
                            placeholder="أدخل معرف المستخدم"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">اسم المستخدم (اختياري)</label>
                          <input
                            type="text"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            placeholder="أدخل اسم المستخدم"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={createNewChat}
                            disabled={creatingChat || !participantId.trim()}
                            className={`flex-1 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                              creatingChat || !participantId.trim()
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {creatingChat ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>جاري الإنشاء...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={18} />
                                <span>إنشاء محادثة</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          أدخل معرف السائق أو الشخص الذي تريد التواصل معه
                          {String(participantId) === String(SUPPORT_ID) && (
                            <span className="block mt-1 text-purple-600">
                              ✅ سيتم فتح محادثة الدعم الفني
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chats List */}
            <div 
              ref={chatsContainerRef}
              className="flex-1 overflow-y-auto bg-white"
            >
              {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                    <LogIn size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h3>
                  <p className="text-gray-700 text-center mb-6">سجل الدخول لعرض المحادثات والرسائل</p>
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <LogIn size={18} />
                    <span>تسجيل الدخول</span>
                  </button>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-700 mt-3">جاري تحميل المحادثات...</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                    <MessageCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-2">لا توجد محادثات</h3>
                  <p className="text-gray-700 text-center mb-6">ابدأ محادثتك الأولى</p>
                  <button
                    onClick={() => setShowNewChatForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>بدء محادثة جديدة</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredChats.map((chat) => {
                    const chatName = getChatName(chat);
                    const chatAvatar = getChatAvatar(chat);
                    const avatarColor = getChatAvatarColor(chat);
                    const isActive = selectedChat?.id === chat.id;
                    const isSupport = isSupportChat(chat);
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 ${
                          isActive 
                            ? `${isSupport ? 'bg-purple-50 border-r-4 border-purple-500' : 'bg-blue-50 border-r-4 border-blue-500'}` 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm ${avatarColor} ${isActive ? 'ring-2 ring-offset-2 ' + (isSupport ? 'ring-purple-300' : 'ring-blue-300') : ''}`}>
                            {typeof chatAvatar === 'string' ? chatAvatar : chatAvatar}
                          </div>
                          {(chat.unreadCount || 0) > 0 && !isActive && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className={`font-bold truncate flex items-center gap-2 ${
                              isActive 
                                ? isSupport ? 'text-purple-700' : 'text-blue-700' 
                                : 'text-gray-800'
                            }`}>
                              {chatName}
                              {isSupport && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">الدعم</span>
                              )}
                            </h3>
                            <span className="text-xs whitespace-nowrap flex-shrink-0">
                              <span className={isActive ? (isSupport ? 'text-purple-500' : 'text-[#579BE8]') : 'text-gray-700'}>
                                {formatChatTime(chat.lastActive)}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 gap-1">
                            <p className={`text-sm truncate flex-1 ${isActive ? (isSupport ? 'text-purple-500' : 'text-[#579BE8]') : 'text-gray-600'}`}>
                              {chat.last_message || 'ابدأ المحادثة الآن'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs ${isActive ? (isSupport ? 'text-purple-500' : 'text-blue-500') : 'text-gray-400'}`}>
                              {chat.participants?.length || 2} مشارك
                            </span>
                            {chat.type && !isSupport && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isActive 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {chat.type === "user_driver" ? "سائق" : "مستخدم"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className={`${
          defaultParticipantId 
            ? 'flex-1 flex flex-col'
            : selectedChat 
              ? 'flex-1 flex flex-col' 
              : 'hidden md:flex md:flex-1 md:flex-col'
        } h-full`}>
          {defaultParticipantId && !selectedChat && creatingChat ? (
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">جاري إنشاء المحادثة مع السائق...</p>
              </div>
            </div>
          ) : defaultParticipantId && !selectedChat && !creatingChat ? (
            <div className="h-full flex flex-col bg-gray-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                  <div>
                    <h3 className="font-bold text-gray-800">محادثة مع {defaultParticipantName || 'السائق'}</h3>
                    <p className="text-sm text-gray-700">ابدأ المحادثة الآن</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">ابدأ محادثة مع السائق</h3>
                  <p className="text-gray-600 mb-6">
                    سيتم إنشاء المحادثة تلقائياً عند إرسال أول رسالة
                  </p>
                  <button
                    onClick={createNewChatWithParticipant}
                    disabled={creatingChat}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingChat ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الإنشاء...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>إنشاء المحادثة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                  {!defaultParticipantId && (
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <ArrowLeft size={18} className="text-gray-700" />
                    </button>
                  )}
                  
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm ${
                      isSupportChat(selectedChat) ? 'bg-purple-500' : (selectedChat.type === "user_driver" ? 'bg-green-500' : 'bg-blue-500')
                    }`}>
                      {isSupportChat(selectedChat) ? <Headset size={18} /> : getChatAvatar(selectedChat)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                  </div>
                  
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-800 truncate flex items-center gap-2">
                      {getChatName(selectedChat)}
                      {isSupportChat(selectedChat) && (
                        <>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full whitespace-nowrap">الدعم الفني</span>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">متصل الآن</span>
                        </>
                      )}
                      {selectedChat.type === "user_driver" && !isSupportChat(selectedChat) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap">سائق</span>
                      )}
                    </h3>
                    <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="whitespace-nowrap">متصل الآن</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group"
                    title="إغلاق المحادثة"
                  >
                    <X size={20} className="text-gray-600 group-hover:text-red-600 transition-colors" />
                  </button>
                  <button className="hidden sm:flex w-10 h-10 rounded-full hover:bg-gray-100 items-center justify-center transition-colors">
                    <Phone size={18} className="text-gray-600" />
                  </button>
                  <button className="hidden sm:flex w-10 h-10 rounded-full hover:bg-gray-100 items-center justify-center transition-colors">
                    <Info size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto bg-gray-50 p-4"
              >
                {!isLoggedIn ? (
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                      <LogIn size={32} className="text-gray-400" />
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2">يجب تسجيل الدخول</h3>
                    <p className="text-gray-700 text-center mb-6">سجل الدخول لعرض وإرسال الرسائل</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <LogIn size={18} />
                      <span>تسجيل الدخول</span>
                    </button>
                  </div>
                ) : messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-blue-500">جاري تحميل الرسائل...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4 border border-gray-200">
                      {isSupportChat(selectedChat) ? (
                        <Headset size={32} className="text-purple-400" />
                      ) : (
                        <MessageCircle size={32} className="text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-bold text-gray-700 mb-2">
                      {isSupportChat(selectedChat) 
                        ? 'مرحباً بك في الدعم الفني'
                        : `بداية المحادثة مع ${getChatName(selectedChat)}`}
                    </h3>
                    <p className="text-gray-600">
                      {isSupportChat(selectedChat)
                        ? 'كيف يمكننا مساعدتك اليوم؟'
                        : 'ابدأ المحادثة بإرسال رسالة'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                      <div key={date}>
                        <div className="flex justify-center my-6">
                          <div className="bg-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
                            {date}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {dateMessages.map((message) => {
                            const isOutgoing = message.is_outgoing || message.isCurrentUser;
                            
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isOutgoing ? 'justify-start' : 'justify-end'}`}
                              >
                                <div
                                  style={{
                                    backgroundColor: isOutgoing ? MESSAGE_COLORS.outgoing.bg : MESSAGE_COLORS.incoming.bg,
                                    color: isOutgoing ? MESSAGE_COLORS.outgoing.text : MESSAGE_COLORS.incoming.text
                                  }}
                                  className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                                    isOutgoing
                                      ? 'rounded-br-none ml-auto'
                                      : 'rounded-bl-none border border-gray-200'
                                  } ${message.is_temp ? 'opacity-90' : ''}`}
                                >
                                  {/* رسالة نصية */}
                                  {message.message && (
                                    <div className="whitespace-pre-wrap break-words">
                                      {message.message}
                                    </div>
                                  )}
                                  
                                  {/* المرفقات (صور وملفات) */}
                                  {renderFileMessage(message)}
                                  
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <span 
                                      style={{
                                        color: isOutgoing ? MESSAGE_COLORS.outgoing.time : MESSAGE_COLORS.incoming.time
                                      }}
                                      className="text-xs"
                                    >
                                      {message.formattedTime || formatMessageTime(message.created_at)}
                                    </span>
                                    
                                    {isOutgoing && (
                                      message.is_read ? (
                                        <CheckCheck size={12} className="text-green-500" />
                                      ) : (
                                        <Check size={12} />
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Attachment Preview */}
              {renderAttachmentPreview()}

              {/* Input Area */}
              {isLoggedIn && selectedChat && (
                <div className="border-t border-gray-200 bg-white">
                  <div className="p-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        {/* Emoji Picker */}
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              ref={emojiPickerRef}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              className="absolute bottom-full right-0 mb-2 z-50"
                            >
                              <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                autoFocusSearch={false}
                                theme="light"
                                searchPlaceholder="بحث عن إيموجي..."
                                previewConfig={{ showPreview: false }}
                                width={320}
                                height={400}
                              />
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
                              className="absolute bottom-full right-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
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
                                    <FileText size={16} className="text-[#579BE8]" />
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
                                    <ImageIcon size={16} className="text-green-600" />
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
                                    <Film size={16} className="text-purple-600" />
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

                        {/* Text input */}
                        <textarea
                          ref={inputRef}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder={isSupportChat(selectedChat) ? "اكتب رسالتك لفريق الدعم الفني..." : "اكتب رسالة..."}
                          className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none pr-12"
                          rows="1"
                          disabled={sending || uploadingFiles}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Emoji Button */}
                        <button
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="p-3 text-gray-500 hover:text-yellow-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="إضافة إيموجي"
                          disabled={sending || uploadingFiles}
                        >
                          <Smile size={20} />
                        </button>

                        {/* Attachment Button */}
                        <button
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          className="p-3 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors relative"
                          title="إرفاق ملف"
                          disabled={sending || uploadingFiles}
                        >
                          <Paperclip size={20} />
                          {selectedFiles.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                              {selectedFiles.length}
                            </span>
                          )}
                        </button>

                        {/* Send Button */}
                        <button
                          onClick={sendMessage}
                          disabled={sending || uploadingFiles || (!newMessage.trim() && selectedFiles.length === 0)}
                          className={`p-3 rounded-lg transition-all flex-shrink-0 ${
                            sending || uploadingFiles || (!newMessage.trim() && selectedFiles.length === 0)
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : isSupportChat(selectedChat)
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {sending || uploadingFiles ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 pb-2 px-4">
                    {isSupportChat(selectedChat) 
                      ? 'سيقوم فريق الدعم بالرد عليك في أقرب وقت ممكن'
                      : 'نحن هنا لمساعدتك دائماً'}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center bg-gray-50">
              <div className="text-center max-w-md px-6">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center border-8 border-white shadow-lg">
                  <MessageCircle size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">اختر محادثة</h3>
                <p className="text-gray-600 mb-8 px-2">
                  اختر محادثة من القائمة على اليمين أو تواصل مع فريق الدعم الفني
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        showLoginToast();
                        return;
                      }
                      setShowNewChatForm(true);
                    }}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center"
                  >
                    <Plus size={24} className="text-[#579BE8] mb-2" />
                    <h4 className="font-bold text-gray-800">محادثة جديدة</h4>
                    <p className="text-sm text-gray-600">ابدأ محادثة</p>
                  </button>
                  <button
                    onClick={openSupportChat}
                    disabled={creatingChat}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center disabled:opacity-50"
                  >
                    {creatingChat ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mb-2"></div>
                    ) : (
                      <Headset size={24} className="text-purple-600 mb-2" />
                    )}
                    <h4 className="font-bold text-gray-800">الدعم الفني</h4>
                    <p className="text-sm text-gray-600">تواصل معنا</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatModal;