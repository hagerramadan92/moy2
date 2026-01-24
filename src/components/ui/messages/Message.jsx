"use client";

import { useState, useEffect, useRef } from "react";
// import { apiService } from '../../../../api.service';
import { pusherClient } from '@/lib/pusherClient';

const ChatApp = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-initialize on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat changes
  useEffect(() => {
    if (inputRef.current && currentChat) {
      inputRef.current.focus();
    }
  }, [currentChat]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if we have a token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Please log in to continue.');
        setIsLoading(false);
        return;
      }
   
      // Check CSRF token before making any requests
      const hasCsrfToken = apiService.checkCsrfToken();
      
      if (!hasCsrfToken) {
        console.warn('CSRF token not found in cookies. Some POST requests might fail.');
      }
      
      // Load all chats
      await loadChats();
      
    } catch (error) {
      console.error('Initialization error:', error);
      
      // Handle CSRF errors specifically
      if (error.message.includes('CSRF') || error.message.includes('csrf')) {
        setError('Session security error. Please refresh the page and try again.');
      } else {
        setError(error.message || 'Failed to initialize chat');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const chatsResponse = await apiService.getChats();
      
      // Access the chats array from response
      let chatsArray = [];
      
      if (Array.isArray(chatsResponse)) {
        chatsArray = chatsResponse;
      } else if (chatsResponse?.chats?.data && Array.isArray(chatsResponse.chats.data)) {
        chatsArray = chatsResponse.chats.data;
      } else if (chatsResponse?.data && Array.isArray(chatsResponse.data)) {
        chatsArray = chatsResponse.data;
      } else if (chatsResponse?.chats && Array.isArray(chatsResponse.chats)) {
        chatsArray = chatsResponse.chats;
      }
      
      setChats(chatsArray);
      
      // Auto-select first chat if available and no chat is selected
      if (chatsArray.length > 0 && !currentChat) {
        handleSelectChat(chatsArray[0]);
      }
      
    } catch (error) {
      console.error('Error loading chats:', error);
      
      // Check if it's a CSRF error
      if (error.message.includes('CSRF') || error.message.includes('csrf')) {
        setError('CSRF token error. Please refresh the page and try again.');
      } else {
        setError('Failed to load chats: ' + error.message);
      }
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleSelectChat = async (chat) => {
    try {
      setCurrentChat(chat);
      setIsLoading(true);
      
      // Load messages for selected chat
      await loadMessages(chat.id);
      
    } catch (error) {
      console.error('Error selecting chat:', error);
      setError('Failed to load chat messages: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const messagesData = await apiService.getChatMessages(chatId);
      
      // Handle different response formats
      let messagesArray = [];
      
      if (Array.isArray(messagesData)) {
        messagesArray = messagesData;
      } else if (messagesData?.data && Array.isArray(messagesData.data)) {
        messagesArray = messagesData.data;
      } else if (messagesData?.messages && Array.isArray(messagesData.messages)) {
        messagesArray = messagesData.messages;
      }
      
      
      // Determine sender for each message
      const formattedMessages = messagesArray.map(msg => ({
        ...msg,
        status: "sent",
        sender: msg.sender_id === 39 ? "user" : "other",
        text: msg.message || msg.text || ''
      }));
      
      setMessages(formattedMessages);
      
      // Setup Pusher for real-time updates for this chat
      setupPusher(chatId);
      
    } catch (error) {
      console.error('Load messages error:', error);
      // If loading messages fails, still set up Pusher but with empty messages
      setupPusher(chatId);
      setMessages([]);
    }
  };

  const setupPusher = (chatId) => {
    try {
      const channel = pusherClient.subscribe("chat-app");
      
      channel.bind("new-upcoming-message", (data) => {
        
        // Check if message belongs to current chat
        if (data.chat_id === chatId || data.chatId === chatId) {
          setMessages(prev => {
            const messageId = data.id || data.message_id || Date.now();
            
            // Prevent duplicates
            if (prev.some((msg) => msg.id === messageId)) return prev;
            
            // Determine sender
            const sender = data.sender_id === 39 ? "user" : "other";
            
            return [...prev, { 
              ...data, 
              status: "sent",
              id: messageId,
              sender: sender,
              text: data.message || data.text || ''
            }];
          });
        }
      });
      
      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe("chat-app");
      };
    } catch (pusherError) {
      console.error('Pusher setup error:', pusherError);
    }
  };

  const handleSendMessage = async () => {
    if (!currentChat || message.trim() === "" || isSending) return;
    
    const messageText = message.trim();
    const chatId = currentChat.id;
    
    // Check CSRF token before sending
    const hasCsrfToken = apiService.checkCsrfToken();
    if (!hasCsrfToken) {
      setError('Security token missing. Please refresh the page and try again.');
      return;
    }
    
    // Create optimistic message
    const tempMessage = {
      id: Date.now().toString(),
      text: messageText,
      message: messageText,
      sender: "user",
      sender_id: 39,
      chat_id: chatId,
      createdAt: new Date().toISOString(),
      status: "pending",
      message_type: "text",
      metadata: "text"
    };
    
    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setMessage("");
    setIsSending(true);
    
    try {
      // Send message via API
      const sentMessage = await apiService.sendMessage(chatId, {
        text: messageText
      });
      
      
      // Update the message in the chats list
      updateChatLastMessage(chatId, messageText);
      
      // Replace temp message with real one
      const finalMessage = {
        ...sentMessage,
        id: sentMessage.id || sentMessage.message_id || tempMessage.id,
        status: "sent",
        sender: "user",
        sender_id: 39,
        text: sentMessage.message || sentMessage.text || messageText
      };
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id ? finalMessage : msg
        )
      );
      
      // Clear any errors
      setError(null);
      
      // Focus input again
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
    } catch (error) {
      console.error('Send message error:', error);
      
      // Mark message as failed
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id 
            ? { ...msg, status: "failed" }
            : msg
        )
      );
      
      // Restore message for retry
      setMessage(messageText);
      
      // Show error
      if (error.message.includes('CSRF') || error.message.includes('csrf') || error.message.includes('session')) {
        setError('Session security error. Please refresh the page and try again.');
      } else {
        setError('Failed to send message: ' + error.message);
      }
    } finally {
      setIsSending(false);
    }
  };

  const updateChatLastMessage = (chatId, messageText) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === chatId
          ? {
              ...chat,
              last_message: messageText,
              last_message_at: new Date().toISOString()
            }
          : chat
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const retryFailedMessage = async (failedMessage) => {
    try {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === failedMessage.id 
            ? { ...msg, status: "pending" }
            : msg
        )
      );
      
      setIsSending(true);
      
      const sentMessage = await apiService.sendMessage(currentChat.id, {
        text: failedMessage.text
      });
      
      const finalMessage = {
        ...sentMessage,
        id: sentMessage.id || sentMessage.message_id || failedMessage.id,
        status: "sent",
        sender: "user",
        text: sentMessage.message || sentMessage.text || failedMessage.text
      };
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === failedMessage.id ? finalMessage : msg
        )
      );
      
    } catch (error) {
      console.error('Retry error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === failedMessage.id 
            ? { ...msg, status: "failed" }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (chat) => {
    if (!chat.participants || !Array.isArray(chat.participants)) {
      return 'Unknown';
    }
    
    // Filter out current user (ID 39) and get the other participant
    const otherParticipants = chat.participants.filter(p => 
      p !== 39 && p !== "39"
    );
    
    if (otherParticipants.length === 0) {
      return 'Unknown';
    }
    
    // Return the first other participant
    const participant = otherParticipants[0];
    return `User ${participant}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={initializeApp}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Chat List */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {chats.length} conversation{chats.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading chats...</p>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500">No chats yet</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    currentChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {getOtherParticipant(chat).charAt(0)}
                      </div>
                    </div>
                    
                    {/* Chat Info */}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getOtherParticipant(chat)}
                          </p>
                          {chat.last_message && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {chat.last_message}
                            </p>
                          )}
                        </div>
                        {chat.last_message_at && (
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {formatDate(chat.last_message_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium mr-3">
                  {getOtherParticipant(currentChat).charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getOtherParticipant(currentChat)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Chat ID: {currentChat.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                  <p className="text-gray-400 mt-2">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id || msg.message_id || `msg-${msg.createdAt}`}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                          msg.sender === "user"
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white border text-gray-800 rounded-bl-none"
                        } ${msg.status === "pending" ? 'opacity-70' : ''} ${
                          msg.status === "failed" ? 'border-2 border-red-300 bg-red-50' : ''
                        }`}
                      >
                        <div className="text-sm break-words">{msg.text}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${msg.sender === "user" ? 'text-blue-200' : 'text-gray-500'}`}>
                            {formatTime(msg.createdAt || msg.timestamp)}
                          </span>
                          <div className="flex items-center ml-2">
                            {msg.status === "pending" && (
                              <span className="text-xs text-gray-400 animate-pulse">Sending...</span>
                            )}
                            {msg.status === "failed" && (
                              <button
                                onClick={() => retryFailedMessage(msg)}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Retry
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    !message.trim() || isSending
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isSending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : "Send"}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 px-1">
                Press Enter to send
              </div>
            </div>
          </>
        ) : (
          /* Welcome screen when no chat is selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Chat</h3>
              <p className="text-gray-600 mb-6">
                {chats.length > 0 
                  ? "Select a chat from the sidebar to start messaging"
                  : "No chats available yet"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;