'use client';

import React, { useState, useContext } from 'react';
import FriendshipManager from '@/components/FriendshipManager';
import MessagingSystem from '@/components/MessagingSystem';
import { UserContext } from '@/contexts/UserContext';
import { Users, MessageSquare } from 'lucide-react';

export default function FriendsPage() {
  const [activeView, setActiveView] = useState<'friends' | 'messages'>('friends');
  const { getCurrentUser } = useContext(UserContext);
  
  const currentUser = getCurrentUser();
  
  // Redirect if user is not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">يجب تسجيل الدخول أولاً</h2>
          <p className="text-gray-600">يرجى تسجيل الدخول للوصول إلى نظام الصداقة والمراسلة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">مركز الصداقة والمراسلة</h1>
          
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            <button
              onClick={() => setActiveView('friends')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                activeView === 'friends'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 ml-2" />
              إدارة الصداقات
            </button>
            <button
              onClick={() => setActiveView('messages')}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors ${
                activeView === 'messages'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="w-5 h-5 ml-2" />
              الرسائل
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {activeView === 'friends' ? (
            <FriendshipManager />
          ) : (
            <div className="h-[calc(100vh-200px)]">
              <MessagingSystem />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
