'use client'
import { useEffect } from 'react';

// Define the Tawk_API interface based on available methods and properties
interface TawkToAPI {
  onLoad?: () => void;
  onStatusChange?: (status: string) => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onChatHidden?: () => void;
  onChatStarted?: () => void;
  onChatEnded?: () => void;
  onPrechatSubmit?: (data: unknown) => void;
  onOfflineSubmit?: (data: unknown) => void;
  minimize?: () => void;
  maximize?: () => void;
  toggle?: () => void;
  popup?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  toggleVisibility?: () => void;
  endChat?: () => void;
  visitor?: {
    name?: string;
    email?: string;
    hash?: string;
  };
}

declare global {
  interface Window {
    Tawk_API?: TawkToAPI;
    Tawk_LoadStart?: Date;
  }
}

const TawkToWidget = () => {
  useEffect(() => {
    // Initialize Tawk_API
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Load the script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/672deb174304e3196adf4649/1ic5lsm4o';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Append the script to the body
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return null;
};

export default TawkToWidget;