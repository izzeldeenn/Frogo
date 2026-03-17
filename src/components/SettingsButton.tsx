'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useGamification } from '@/contexts/GamificationContext';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthModal } from '@/components/AuthModal';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { dailyActivityDB } from '@/lib/dailyActivity';
import { ActivityContribution } from '@/lib/dailyActivity';
import { useCustomThemeClasses } from '@/hooks/useCustomThemeClasses';

// Generate 250 avatars dynamically
const AVATARS = Array.from({ length: 250 }, (_, i) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=avatar${i + 1}`
);

export function SettingsButton() {
  const { theme } = useTheme();
  const { coins, level, experience } = useGamification();
  const { getCurrentUser, updateUserName, updateUserAvatar, isLoggedIn } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const customTheme = useCustomThemeClasses();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [activityData, setActivityData] = useState<{ contributions: ActivityContribution[] }>({ contributions: [] });
  const [avatarPage, setAvatarPage] = useState(1);
  const [avatarSearch, setAvatarSearch] = useState('');
  const avatarsPerPage = 20;

  const currentUser = getCurrentUser();

  // Filter and paginate avatars
  const filteredAvatars = avatarSearch 
    ? AVATARS.filter((_, index) => 
        (index + 1).toString().includes(avatarSearch)
      )
    : AVATARS;

  const totalPages = Math.ceil(filteredAvatars.length / avatarsPerPage);
  const startIndex = (avatarPage - 1) * avatarsPerPage;
  const endIndex = startIndex + avatarsPerPage;
  const currentAvatars = filteredAvatars.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setAvatarPage(1);
  }, [avatarSearch]);

  // Fetch user activity data
  useEffect(() => {
    const fetchActivityData = async () => {
      if (currentUser?.id) {
        try {
          const contributions = await dailyActivityDB.getUserActivityContributions(currentUser.id);
          setActivityData({ contributions });
        } catch (error) {
          console.error('Failed to fetch activity data:', error);
          setActivityData({ contributions: [] });
        }
      }
    };

    fetchActivityData();
  }, [currentUser?.id]);

  const handleSaveSettings = () => {
    if (username.trim()) {
      updateUserName(username.trim());
    }
    if (customAvatarUrl) {
      updateUserAvatar(customAvatarUrl);
    } else if (selectedAvatar) {
      updateUserAvatar(selectedAvatar);
    }
    setShowSettings(false);
  };

  const handleLoadSettings = () => {
    if (currentUser) {
      setUsername(currentUser.username || '');
      // Check if avatar is a URL (starts with http) or from preset avatars
      if (currentUser.avatar?.startsWith('http')) {
        setCustomAvatarUrl(currentUser.avatar);
        setSelectedAvatar('');
      } else {
        setSelectedAvatar(currentUser.avatar || AVATARS[0]);
        setCustomAvatarUrl('');
      }
    }
    setShowSettings(true);
  };

  return (
    <>
      <button
        onClick={handleLoadSettings}
        className="p-2 rounded-xl transition-all duration-200 hover:scale-110"
        style={{
          backgroundColor: customTheme.colors.surface,
          color: customTheme.colors.text
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.primary;
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = customTheme.colors.surface;
          e.currentTarget.style.color = customTheme.colors.text;
        }}
      >
        ⚙️
      </button>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
            theme === 'light' ? 'bg-white' : 'bg-gray-900'
          }`}
          style={{ border: `2px solid ${customTheme.colors.border}` }}
        >
            <div 
              className="p-6 border-b"
              style={{
                background: `linear-gradient(to right, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                borderColor: customTheme.colors.border
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-2xl font-bold ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>
                  {t.settings}
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: customTheme.colors.text
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = customTheme.colors.primary;
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = customTheme.colors.text;
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.username}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t.enterUsername}
                      className="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg"
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderColor: customTheme.colors.border,
                        color: customTheme.colors.text
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.primary;
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#000000';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.border;
                        e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                      }}
                    />
                  </div>

                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.appearance}
                    </label>
                    <div 
                      className="p-4 rounded-2xl"
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderColor: customTheme.colors.border,
                        border: `2px solid ${customTheme.colors.border}`
                      }}
                    >
                      <ThemeToggle />
                    </div>
                  </div>

                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.language}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                      className="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg"
                      style={{
                        backgroundColor: customTheme.colors.surface,
                        borderColor: customTheme.colors.border,
                        color: customTheme.colors.text
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.primary;
                        e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#000000';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = customTheme.colors.border;
                        e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                      }}
                    >
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  {/* Authentication Section */}
                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      الحساب
                    </label>
                    <div className="space-y-3">
                      {isLoggedIn ? (
                        <div className="p-4 rounded-2xl"
                             style={{ backgroundColor: customTheme.colors.surface + '30' }}>
                          <div className={`text-sm font-medium mb-2 ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            مسجل الدخول كـ:
                          </div>
                          <div className={`font-semibold ${
                            theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                          }`}>
                            {currentUser?.username || 'مستخدم'}
                          </div>
                          <div className={`text-sm ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {currentUser?.email || 'user@example.com'}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl"
                             style={{ backgroundColor: customTheme.colors.surface + '30' }}>
                          <div className={`text-sm ${
                            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            أنت تستخدم حساب ضيف
                          </div>
                          <div className={`text-xs mt-1 ${
                            theme === 'light' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            قم بترقية الحساب للحفاظ على بياناتك ومزامنتها
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3">
                        {!isLoggedIn ? (
                          <button
                            onClick={() => setShowAuthModal(true)}
                            className="px-4 py-3 rounded-xl font-medium transition-all text-sm"
                            style={{
                              background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                              color: '#ffffff',
                              border: `2px solid ${customTheme.colors.primary}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.accent}, ${customTheme.colors.primary})`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`;
                            }}
                          >
                            تسجيل الدخول
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowAccountSwitcher(true)}
                            className="px-4 py-3 rounded-xl font-medium transition-all text-sm"
                            style={{
                              backgroundColor: customTheme.colors.surface,
                              color: customTheme.colors.text,
                              border: `2px solid ${customTheme.colors.border}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = customTheme.colors.border;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                            }}
                          >
                            تبديل الحساب
                          </button>
                        )}
                        
                        {!isLoggedIn && (
                          <button
                            onClick={() => {
                              setShowAuthModal(true);
                              // This will be handled in AuthModal to show registration form
                            }}
                            className="px-4 py-3 rounded-xl font-medium transition-all text-sm"
                            style={{
                              backgroundColor: customTheme.colors.surface,
                              color: customTheme.colors.text,
                              border: `2px solid ${customTheme.colors.border}`
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = customTheme.colors.border;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                            }}
                          >
                            ترقية الحساب
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block mb-3 text-lg font-semibold ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {t.avatar}
                    </label>
                    
                    {/* Custom Avatar URL Input */}
                    <div className="mb-4">
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => {
                          setCustomAvatarUrl(e.target.value);
                          setSelectedAvatar(''); // Clear preset selection when custom URL is entered
                        }}
                        placeholder="أدخل رابط الصورة..."
                        className="w-full px-4 py-3 rounded-2xl focus:outline-none transition-all text-lg"
                        style={{
                          backgroundColor: customTheme.colors.surface,
                          borderColor: customTheme.colors.border,
                          color: customTheme.colors.text
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = customTheme.colors.primary;
                          e.currentTarget.style.backgroundColor = theme === 'light' ? '#ffffff' : '#000000';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = customTheme.colors.border;
                          e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                        }}
                      />
                      {customAvatarUrl && (
                        <div className="mt-2 flex justify-center">
                          <img 
                            src={customAvatarUrl} 
                            alt="Custom avatar preview"
                            className="w-16 h-16 rounded-full object-cover border-2"
                            style={{ borderColor: customTheme.colors.primary }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Preset Avatar Grid */}
                    <div className="text-sm text-gray-500 mb-2">أو اختر من الصور الجاهزة:</div>
                    
                    {/* Search Input */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={avatarSearch}
                        onChange={(e) => setAvatarSearch(e.target.value)}
                        placeholder="ابحث بالرقم (1-250)..."
                        className="w-full px-4 py-2 rounded-xl focus:outline-none transition-all"
                        style={{
                          backgroundColor: customTheme.colors.surface,
                          borderColor: customTheme.colors.border,
                          color: customTheme.colors.text
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = customTheme.colors.primary;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = customTheme.colors.border;
                        }}
                      />
                    </div>

                    {/* Avatar Grid */}
                    <div className="grid grid-cols-5 gap-2 mb-4 max-h-64 overflow-y-auto p-2 rounded-xl"
                         style={{ backgroundColor: customTheme.colors.surface + '20' }}>
                      {currentAvatars.map((avatar, index) => {
                        const originalIndex = avatarSearch 
                          ? AVATARS.indexOf(avatar) + 1
                          : startIndex + index + 1;
                        return (
                          <button
                            key={avatar}
                            onClick={() => {
                              setSelectedAvatar(avatar);
                              setCustomAvatarUrl('');
                            }}
                            className="aspect-square rounded-xl overflow-hidden transition-all duration-200 hover:scale-110 relative group"
                            style={{
                              border: `3px solid ${selectedAvatar === avatar ? customTheme.colors.primary : customTheme.colors.border}`,
                              boxShadow: selectedAvatar === avatar ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                            title={`Avatar ${originalIndex}`}
                          >
                            <img 
                              src={avatar} 
                              alt={`Avatar ${originalIndex}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {originalIndex}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between text-sm">
                        <button
                          onClick={() => setAvatarPage(Math.max(1, avatarPage - 1))}
                          disabled={avatarPage === 1}
                          className="px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                          style={{
                            backgroundColor: avatarPage === 1 ? customTheme.colors.border : customTheme.colors.primary,
                            color: avatarPage === 1 ? customTheme.colors.text : '#ffffff'
                          }}
                        >
                          السابق
                        </button>
                        
                        <span className="font-medium" style={{ color: customTheme.colors.text }}>
                          صفحة {avatarPage} من {totalPages}
                        </span>
                        
                        <button
                          onClick={() => setAvatarPage(Math.min(totalPages, avatarPage + 1))}
                          disabled={avatarPage === totalPages}
                          className="px-3 py-1 rounded-lg transition-all disabled:opacity-50"
                          style={{
                            backgroundColor: avatarPage === totalPages ? customTheme.colors.border : customTheme.colors.primary,
                            color: avatarPage === totalPages ? customTheme.colors.text : '#ffffff'
                          }}
                        >
                          التالي
                        </button>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2 text-center">
                      {filteredAvatars.length} من {AVATARS.length} صورة متاحة
                    </div>
                  </div>
                </div>
              </div>
              <div 
                className="mt-8 p-6 rounded-3xl"
                style={{
                  background: `linear-gradient(to bottom right, ${customTheme.colors.surface}, ${customTheme.colors.background})`,
                  border: `2px solid ${customTheme.colors.border}`
                }}
              >
                <h4 className={`font-bold text-xl mb-6 text-center ${
                  theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                }`}>{t.statistics}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.secondary}, ${customTheme.colors.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{coins}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🪙 {t.coins}</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{level}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🎯 {t.level}</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{experience}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>⚡ {t.experience}</div>
                  </div>
                  <div 
                    className="p-4 rounded-2xl text-center"
                    style={{
                      backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <div 
                      className="text-3xl font-bold mb-2"
                      style={{
                        background: `linear-gradient(to right, ${customTheme.colors.secondary}, ${customTheme.colors.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >{currentUser?.rank || 1}</div>
                    <div className={`text-sm font-medium ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                    }`}>🏆 {t.rank}</div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="p-6 border-t flex justify-end space-x-3 space-x-reverse"
              style={{
                borderColor: customTheme.colors.border,
                backgroundColor: customTheme.colors.surface
              }}
            >
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-200 text-lg"
                style={{
                  backgroundColor: customTheme.colors.surface,
                  color: customTheme.colors.text,
                  border: `2px solid ${customTheme.colors.border}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = customTheme.colors.surface;
                }}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-200 text-lg"
                style={{
                  background: `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`,
                  color: '#ffffff',
                  border: `2px solid ${customTheme.colors.primary}`,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.accent}, ${customTheme.colors.primary})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, ${customTheme.colors.primary}, ${customTheme.colors.secondary})`;
                }}
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <AccountSwitcher 
        isOpen={showAccountSwitcher} 
        onClose={() => setShowAccountSwitcher(false)} 
      />
    </>
  );
}
