"use client";

import { NotificationData, MatchRequest } from "@/types/charm-caster";
import { motion } from "framer-motion";
import Image from "next/image";

interface NotificationsFrameProps {
  notifications: NotificationData[];
  matchRequests: MatchRequest[];
  onMarkAsRead: (notificationId: string) => void;
  onRespondToRequest: (requestId: string, status: 'accepted' | 'declined') => void;
  onClose: () => void;
}

export const NotificationsFrame = ({
  notifications,
  matchRequests,
  onMarkAsRead,
  onRespondToRequest,
  onClose
}: NotificationsFrameProps) => {
  const unreadNotifications = notifications.filter(n => !n.read);
  const pendingRequests = matchRequests.filter(r => r.status === 'pending');

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md mx-auto border border-pink-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🔔</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <span className="text-gray-600">✕</span>
        </button>
      </div>

      {/* Match Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Match Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-4 border border-pink-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Image
                    src={request.fromProfile.pfp_url || '/images/icon.png'}
                    alt={request.fromProfile.display_name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {request.fromProfile.display_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{request.fromProfile.username}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(request.createdAt)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  💕 Sent you a match request
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => onRespondToRequest(request.id, 'accepted')}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-4 rounded-xl font-medium text-sm hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Accept ❤️
                  </button>
                  <button
                    onClick={() => onRespondToRequest(request.id, 'declined')}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium text-sm hover:bg-gray-300 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
          Recent Activity ({notifications.length})
        </h3>
        
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-400 text-2xl">🔔</span>
            </div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl p-4 border cursor-pointer transition-all ${
                  !notification.read 
                    ? 'bg-gradient-to-r from-pink-50 to-red-50 border-pink-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
                onClick={() => !notification.read && onMarkAsRead(notification.id)}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={notification.fromProfile.pfp_url || '/images/icon.png'}
                    alt={notification.fromProfile.display_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {pendingRequests.length === 0 && notifications.length === 0 && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-pink-500 text-3xl">💕</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">All caught up!</h3>
          <p className="text-gray-500 text-sm">
            You&apos;ll see new notifications and match requests here
          </p>
        </div>
      )}
    </motion.div>
  );
};
