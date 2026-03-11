'use client';

// Generate or retrieve a unique device ID
export function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server-device';
  }

  // Check if device ID already exists in localStorage
  let deviceId = localStorage.getItem('fahman_hub_device_id');
  
  if (!deviceId) {
    // Generate a new unique device ID
    deviceId = generateDeviceId();
    localStorage.setItem('fahman_hub_device_id', deviceId);
  }
  
  return deviceId;
}

function generateDeviceId(): string {
  // Create a unique ID using timestamp and random string
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 15);
  return `device_${timestamp}_${randomString}`;
}

// Get device info for identification
export function getDeviceInfo(): {
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
  createdAt: string;
} {
  if (typeof window === 'undefined') {
    return {
      deviceId: 'server-device',
      userAgent: 'server',
      platform: 'server',
      language: 'ar',
      createdAt: new Date().toISOString()
    };
  }

  const deviceId = getDeviceId();
  
  // Check if device info exists
  let deviceInfo = localStorage.getItem('fahman_hub_device_info');
  
  if (deviceInfo) {
    return JSON.parse(deviceInfo);
  }
  
  // Create new device info
  const info = {
    deviceId,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language || 'ar',
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem('fahman_hub_device_info', JSON.stringify(info));
  
  return info;
}
