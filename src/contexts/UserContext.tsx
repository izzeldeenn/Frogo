'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGamification } from './GamificationContext';
import { getDeviceId, getDeviceInfo } from '@/utils/deviceId';

interface DeviceUser {
  deviceId: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  studyTime: number; // in seconds
  createdAt: string;
  lastActive: string;
}

interface UserContextType {
  users: DeviceUser[];
  getCurrentDeviceUser: () => DeviceUser | null;
  updateDeviceUserName: (name: string) => void;
  updateDeviceUserAvatar: (avatar: string) => void;
  updateDeviceStudyTime: (additionalTime: number) => void;
  getAllDeviceUsers: () => DeviceUser[];
  setTimerActive: (isActive: boolean) => void;
  isTimerActive: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { addCoins } = useGamification();
  const [users, setUsers] = useState<DeviceUser[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    // Get device ID and load users
    const deviceId = getDeviceId();
    setCurrentDeviceId(deviceId);
    
    // Load users from localStorage
    const savedUsers = localStorage.getItem('fahman_hub_device_users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);
        
        // Check if current device exists, if not create it
        const existingDevice = parsedUsers.find((user: DeviceUser) => user.deviceId === deviceId);
        if (!existingDevice) {
          createDeviceUser(deviceId);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        createDeviceUser(deviceId);
      }
    } else {
      createDeviceUser(deviceId);
    }
  }, []);

  useEffect(() => {
    // Save users to localStorage whenever they change
    localStorage.setItem('fahman_hub_device_users', JSON.stringify(users));
  }, [users]);

  const createDeviceUser = (deviceId: string) => {
    const deviceInfo = getDeviceInfo();
    const newUser: DeviceUser = {
      deviceId,
      name: `جهاز ${deviceId.slice(-6)}`,
      score: 0,
      rank: users.length + 1,
      studyTime: 0,
      createdAt: deviceInfo.createdAt,
      lastActive: new Date().toISOString()
    };
    setUsers(prev => {
      const updated = [...prev, newUser];
      // Sort and update ranks
      updated.sort((a, b) => b.score - a.score);
      updated.forEach((user, index) => {
        user.rank = index + 1;
      });
      return updated;
    });
  };

  const updateDeviceUserName = (name: string) => {
    if (!currentDeviceId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.deviceId === currentDeviceId) {
          return { ...user, name, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
  };

  const updateDeviceUserAvatar = (avatar: string) => {
    if (!currentDeviceId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.deviceId === currentDeviceId) {
          return { ...user, avatar, lastActive: new Date().toISOString() };
        }
        return user;
      });
      return newUsers;
    });
  };

  const updateDeviceStudyTime = (additionalTime: number) => {
    if (!currentDeviceId) return;
    
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(user => {
        if (user.deviceId === currentDeviceId) {
          const pointsEarned = Math.floor(additionalTime / 10); // 1 point per 10 seconds
          addCoins(pointsEarned); // Add coins to gamification system
          return {
            ...user,
            studyTime: user.studyTime + additionalTime,
            score: user.score + pointsEarned,
            lastActive: new Date().toISOString()
          };
        }
        return user;
      });

      // Sort by score and update ranks
      newUsers.sort((a, b) => b.score - a.score);
      newUsers.forEach((user, index) => {
        user.rank = index + 1;
      });

      return newUsers;
    });
  };

  const getCurrentDeviceUser = (): DeviceUser | null => {
    if (!currentDeviceId) return null;
    return users.find(user => user.deviceId === currentDeviceId) || null;
  };

  const getAllDeviceUsers = (): DeviceUser[] => {
    return users.sort((a, b) => b.score - a.score);
  };

  const setTimerActive = (isActive: boolean) => {
    setIsTimerRunning(isActive);
  };

  const isTimerActive = (): boolean => {
    return isTimerRunning;
  };

  return (
    <UserContext.Provider value={{
      users,
      getCurrentDeviceUser,
      updateDeviceUserName,
      updateDeviceUserAvatar,
      updateDeviceStudyTime,
      getAllDeviceUsers,
      setTimerActive,
      isTimerActive
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
