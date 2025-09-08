import React from 'react';
import { X, Heart, MessageCircle, Star, UserPlus, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, buttonRef }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadNotifications = async () => {
      if (!user || !isOpen) return;

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error loading notifications:', error);
        } else {
          const transformedNotifications = data.map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            time: formatTime(notification.created_at),
            unread: !notification.read,
            icon: getIconForType(notification.type),
            color: getColorForType(notification.type)
          }));
          setNotifications(transformedNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user, isOpen]);

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'match': return Heart;
      case 'like': return Star;
      case 'message': return MessageCircle;
      default: return Bell;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'match': return 'text-red-600 bg-red-50';
      case 'like': return 'text-yellow-600 bg-yellow-50';
      case 'message': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleNotificationClick = async (notification: any) => {
    // Mark notification as read
    if (notification.unread) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);

        if (!error) {
          setNotifications(prev => 
            prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
          );
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Handle navigation based on notification type
    if (notification.type === 'match') {
      onClose();
      window.location.href = '/matches';
    } else if (notification.type === 'message') {
      onClose();
      window.location.href = '/matches';
    } else if (notification.type === 'like') {
      onClose();
      window.location.href = '/likes';
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) {
        console.error('Error marking notifications as read:', error);
      } else {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  if (!isOpen) return null;

  // Calculate position relative to the button
  const getDropdownStyle = () => {
    if (!buttonRef?.current) return {};
    
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      position: 'fixed' as const,
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 50
    };
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Dropdown */}
      <div 
        className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl w-72 sm:w-80 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto border border-gray-200/50 transform transition-all duration-500 hover:scale-[1.02] relative overflow-hidden"
        style={getDropdownStyle()}
      >
        {/* Sparkle Effects */}
        <div className="absolute top-5 right-5 w-1 h-1 bg-purple-300 rounded-full animate-pulse"></div>
        
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100/80 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-all duration-300 transform hover:scale-110 group"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : notifications.length > 0 ? notifications.map((notification) => {
            const IconComponent = notification.icon;
            return (
              <div
                key={notification.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] transform cursor-pointer ${
                  notification.unread 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg hover:shadow-blue-500/20' 
                    : 'bg-white border-gray-200 hover:shadow-lg'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className={`p-2 rounded-full ${notification.color} shadow-lg`}>
                    <IconComponent className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xs sm:text-sm font-bold ${
                        notification.unread ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="font-bold text-gray-700 mb-2">No notifications yet</p>
              <p className="text-sm bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                ✨ We'll notify you when something happens!
              </p>
            </div>
          )}
        </div>

        {notifications.some(n => n.unread) && (
          <div className="p-3 sm:p-4 border-t border-gray-100/80">
            <button 
              onClick={handleMarkAllAsRead}
              className="w-full text-center text-xs sm:text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50"
            >
              ✓ Mark all as read
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsModal;