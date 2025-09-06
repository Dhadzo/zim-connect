import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  Video,
  Send,
  MessageCircle,
  Heart,
  ArrowLeft,
  Smile,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  useMatches,
  useMatchMessages,
  useSendMessage,
  useMarkMessagesAsRead
} from '../hooks/useMatches';
import { useUIStore } from '../stores/useUIStore';
import { useMessagesRealtime } from '../hooks/useRealtime';
import { useLastMessages } from '../hooks/useLastMessages';

import VideoCallModal from '../components/VideoCallModal';
import { useQueryClient } from '@tanstack/react-query';

const Matches = () => {
  const { user } = useAuth();
  const {
    selectedChatMatch,
    setSelectedChatMatch,
    showVideoCall,
    setShowVideoCall
  } = useUIStore();

  const [chatMessage, setChatMessage] = useState('');

  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // React Query hooks for data fetching
  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError
  } = useMatches(user?.id);

  const {
    data: chatMessages = [],
    isLoading: messagesLoading,
    error: messagesError
  } = useMatchMessages(selectedChatMatch?.matchId || undefined);

  // Get last messages for all matches
  const matchIds = matches.map((match) => match.id);
  const { data: lastMessages = {} } = useLastMessages(matchIds);

  // Mutations
  const sendMessage = useSendMessage();
  const markMessagesAsRead = useMarkMessagesAsRead();

  // Real-time subscription for messages in the selected chat
  useMessagesRealtime(selectedChatMatch?.matchId, user?.id);

  // Clear selected chat match if it no longer exists in matches
  useEffect(() => {
    if (selectedChatMatch && matches.length > 0) {
      const matchStillExists = matches.some(
        (match) => match.id === selectedChatMatch.matchId
      );
      if (!matchStillExists) {
        setSelectedChatMatch(null);
      }
    }
  }, [matches, selectedChatMatch, setSelectedChatMatch]);

  // Debug logging for real-time updates
  useEffect(() => {
    if (selectedChatMatch?.matchId) {
    } else {
    }
  }, [selectedChatMatch?.matchId]);

  // Auto-scroll to latest message
  const scrollToBottom = (smooth: boolean = true) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        // Force immediate scroll to bottom without any animation
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }
  };

  // Scroll to bottom when messages change or chat is selected
  useEffect(() => {
    if (chatMessages.length > 0) {
      // For initial load, scroll immediately without animation
      // For new messages, use smooth scroll
      const isNewMessage = chatMessages.length > 1;
      scrollToBottom(isNewMessage);
    }
  }, [chatMessages, selectedChatMatch?.matchId]);

  // Immediate scroll to bottom when chat is first selected
  useEffect(() => {
    if (selectedChatMatch?.matchId && chatMessages.length > 0) {
      // Use requestAnimationFrame for perfect timing after DOM is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom(false); // No animation for initial load
        });
      });
    }
  }, [selectedChatMatch?.matchId]);

  // Format time for display
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1d ago';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedChatMatch || !user) return;

    const messageText = chatMessage.trim();

    setChatMessage(''); // Clear input immediately for better UX

    try {
      const result = await sendMessage.mutateAsync({
        matchId: selectedChatMatch.matchId,
        senderId: user.id,
        content: messageText
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Could add toast notification here
    }
  };

  // Handle match selection
  const handleMatchSelect = (match: any) => {
    setSelectedChatMatch(match);

    // Mark messages as read when selecting a match
    if (match && user) {
      markMessagesAsRead.mutate({
        matchId: match.matchId,
        userId: user.id
      });
    }

    // Force scroll to bottom immediately when selecting a match
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedChatMatch(null);
  };

  // Transform matches data for display
  const transformedMatches = matches
    .map((match) => {
      // Safety check for match object
      if (!match || typeof match !== 'object') {
        return null;
      }

      // The useMatches hook already provides otherProfile and otherUserId
      const otherProfile = match.otherProfile;
      const otherUserId = match.otherUserId;

      if (!otherProfile || !otherUserId) {
        return null;
      }

      // Safety check for profile data
      if (!otherProfile.first_name || !otherProfile.last_name) {
        return null;
      }

      return {
        id: match.id,
        matchId: match.id,
        userId: otherUserId,
        name: `${otherProfile.first_name} ${otherProfile.last_name}`,
        avatar:
          otherProfile.photos && otherProfile.photos.length > 0
            ? otherProfile.photos[0]
            : 'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=100',
        lastMessage:
          lastMessages[match.id]?.content || 'You matched! Start chatting',
        time: lastMessages[match.id]?.created_at
          ? formatTime(lastMessages[match.id].created_at)
          : formatTime(match.created_at),
        unread: false // This could be enhanced with actual unread logic
      };
    })
    .filter(Boolean); // Remove any null entries

  // Transform messages for display
  const transformedMessages = chatMessages.map((message) => ({
    id: message.id,
    text: message.content,
    sender: message.sender_id === user?.id ? 'me' : 'them',
    time: new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    created_at: message.created_at
  }));

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-pink-50/20 overflow-hidden">
      {/* Mobile: Show either list or chat, Desktop: Show both */}
      <main className="h-[calc(100vh-112px)] bg-white/95 backdrop-blur-lg overflow-hidden shadow-xl border-t border-gray-200/50">
        {/* Mobile Layout */}
        <div className="lg:hidden h-full overflow-hidden">
          {!selectedChatMatch ? (
            // Mobile: Matches List
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-white via-red-50/30 to-pink-50/30 backdrop-blur-lg">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">Messages</h2>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {matchesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : transformedMatches.length > 0 ? (
                  transformedMatches.map((match) => (
                    <div
                      key={match.id}
                      className={`group p-4 border-b border-gray-100/50 cursor-pointer hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 active:bg-gray-100 transform hover:translate-x-2 ${
                        selectedChatMatch?.id === match.id ? 'bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-l-red-500 shadow-lg' : ''
                      }`}
                      onClick={() => handleMatchSelect(match)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={match.avatar}
                            alt={match.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:border-red-300 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110"
                          />
                          {match.unread && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-semibold truncate ${
                                match.unread ? 'text-gray-900' : 'text-gray-700'
                              }`}
                            >
                              {match.name}
                            </h3>
                            <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                              {match.time}
                            </span>
                          </div>
                          <p
                            className={`text-sm truncate ${
                              match.unread
                                ? 'text-gray-900 font-medium'
                                : 'text-gray-600'
                            }`}
                          >
                            {match.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No matches yet</p>
                    <p className="text-sm">
                      Start liking profiles to get matches!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Mobile: Chat View
            <div className="h-full flex flex-col">
              {/* Mobile Chat Header */}
              <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-white via-red-50/30 to-pink-50/30 backdrop-blur-lg relative overflow-hidden">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-transparent to-pink-100/20 animate-pulse"></div>
                <div className="relative z-10">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToList}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="relative">
                    <img
                      src={selectedChatMatch.avatar}
                      alt={selectedChatMatch.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                    />
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                    {/* Floating Heart Animation */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 text-red-400 opacity-0 animate-bounce">
                      <Heart className="w-full h-full fill-current" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent">
                      {selectedChatMatch.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-green-600 font-medium">Online now</p>
                      <span className="text-xs text-gray-400">• Last seen just now</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="group p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-all duration-300 transform hover:scale-110">
                      <Phone className="h-5 w-5 group-hover:animate-bounce" />
                    </button>
                    <button
                      onClick={() => setShowVideoCall(true)}
                      className="group p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 transform hover:scale-110"
                    >
                      <Video className="h-5 w-5 group-hover:animate-bounce" />
                    </button>
                  </div>
                </div>
              </div>
              </div>

              {/* Mobile Messages Area */}
              <div
                ref={messagesContainerRef}
                className="messages-container flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50"
              >
                {messagesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  </div>
                ) : transformedMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <MessageCircle className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">
                      Start the conversation!
                    </p>
                    <p className="text-sm">Send a message to break the ice</p>
                  </div>
                ) : (
                  <>
                    {transformedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender === 'me' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`group relative max-w-[280px] px-4 py-3 rounded-2xl transform transition-all duration-300 hover:scale-105 ${
                            msg.sender === 'me'
                              ? 'bg-gradient-to-r from-red-600 via-pink-500 to-red-600 text-white rounded-br-md shadow-lg hover:shadow-red-500/50 animate-fadeInRight'
                              : 'bg-white text-gray-900 shadow-md hover:shadow-xl rounded-bl-md border border-gray-100 animate-fadeInLeft'
                          }`}
                        >
                          {/* Message Status Indicator */}
                          {msg.sender === 'me' && (
                            <div className="absolute -right-2 bottom-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                          )}
                          
                          {/* Floating Heart for Received Messages */}
                          {msg.sender !== 'me' && (
                            <div className="absolute -left-2 top-1 w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce">
                              <Heart className="w-full h-full fill-current" />
                            </div>
                          )}
                          <p className="text-sm leading-relaxed relative z-10">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 flex items-center space-x-1 relative z-10 ${
                              msg.sender === 'me'
                                ? 'text-red-100'
                                : 'text-gray-500'
                            }`}
                          >
                            <span>{formatTime(msg.created_at)}</span>
                            {msg.sender === 'me' && (
                              <span className="text-xs opacity-75">✓✓</span>
                            )}
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Invisible div for auto-scroll */}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Mobile Message Input */}
              <div className="p-4 bg-gradient-to-r from-white via-red-50/20 to-pink-50/20 backdrop-blur-lg border-t border-gray-200/50">
                <form onSubmit={handleSendMessage} className="flex space-x-3">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message... 💖"
                    disabled={sendMessage.isPending}
                    className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-red-300 transition-all text-sm shadow-sm hover:shadow-md"
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || sendMessage.isPending}
                    className="group p-3 bg-gradient-to-r from-red-600 via-pink-500 to-red-600 text-white rounded-full hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-110 active:scale-95"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    )}
                  </button>
                </form>

                {/* Match Info */}
                <div className="mt-3">
                  <div className="bg-red-50 rounded-lg p-3 flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      You and {selectedChatMatch.name} liked each other!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full max-w-6xl mx-auto overflow-hidden">
          {/* Desktop: Matches List */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {transformedMatches.map((match) => (
                <div
                  key={match.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100 ${
                    selectedChatMatch?.id === match.id
                      ? 'bg-red-50 border-r-2 border-r-red-600'
                      : ''
                  }`}
                  onClick={() => handleMatchSelect(match)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={match.avatar}
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {match.unread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            match.unread ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {match.name}
                        </h3>
                        <span className="text-sm text-gray-500 ml-2 whitespace-nowrap">
                          {match.time}
                        </span>
                      </div>
                      <p
                        className={`text-sm truncate ${
                          match.unread
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-600'
                        }`}
                      >
                        {match.lastMessage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {transformedMatches.length === 0 && !matchesLoading && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No matches yet</p>
                  <p className="text-sm">
                    Start liking profiles to get matches!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedChatMatch ? (
              <>
                {/* Desktop Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedChatMatch.avatar}
                        alt={selectedChatMatch.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedChatMatch.name}
                        </h3>
                        <p className="text-sm text-green-600">Online now</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowVideoCall(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Video className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className="messages-container flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50"
                >
                  {messagesLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                    </div>
                  ) : transformedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <MessageCircle className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">
                        Start the conversation!
                      </p>
                      <p className="text-sm">Send a message to break the ice</p>
                    </div>
                  ) : (
                    <>
                      {transformedMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === 'me'
                              ? 'justify-end'
                              : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-sm lg:max-w-md px-4 py-2 rounded-2xl ${
                              msg.sender === 'me'
                                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                                : 'bg-white text-gray-900 shadow-sm'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                msg.sender === 'me'
                                  ? 'text-red-100'
                                  : 'text-gray-500'
                              }`}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                      {/* Invisible div for auto-scroll */}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Desktop Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sendMessage.isPending}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!chatMessage.trim() || sendMessage.isPending}
                      className="p-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </form>

                  {/* Match Info */}
                  <div className="mt-3">
                    <div className="bg-red-50 rounded-lg p-3 flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-600">
                        You and {selectedChatMatch.name} liked each other!
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        match={selectedChatMatch || { name: 'Unknown', avatar: '' }}
      />
    </div>
  );
};

export default Matches;
