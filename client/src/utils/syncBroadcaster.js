/**
 * Pure Milk Bar - Universal Cross-Tab & Same-Tab Real-Time Sync Engine
 * Uses modern BroadcastChannel API with localStorage and CustomEvent fallbacks
 * to guarantee instant (0ms lag) cross-tab and cross-window state propagation.
 */

const CHANNEL_NAME = 'pure_milk_bar_realtime_channel';

// Singleton BroadcastChannel instance
let syncChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (err) {
    console.warn('BroadcastChannel initialization fallback:', err);
  }
}

/**
 * Universal broadcast function to notify ALL open tabs, windows, and local listeners
 * @param {string} eventName - e.g. 'pure_milk_bar_pos_sale_completed', 'pure_milk_bar_milking_updated'
 * @param {object} payload - optional event metadata
 */
export function broadcastSync(eventName, payload = {}) {
  if (typeof window === 'undefined') return;

  const message = {
    event: eventName,
    payload,
    timestamp: Date.now(),
  };

  // 1. Dispatch locally in current window
  try {
    window.dispatchEvent(new CustomEvent(eventName, { detail: payload }));
  } catch (_) {
    window.dispatchEvent(new Event(eventName));
  }

  // 2. Broadcast across all browser tabs via BroadcastChannel
  if (syncChannel) {
    try {
      syncChannel.postMessage(message);
    } catch (e) {
      console.warn('BroadcastChannel postMessage notice:', e);
    }
  }

  // 3. Storage event fallback for older browser tabs
  try {
    localStorage.setItem(
      'pure_milk_bar_sync_event',
      JSON.stringify({ event: eventName, ts: Date.now() })
    );
  } catch (_) {}
}

/**
 * Universal listener registrar that automatically handles cross-tab messages
 * @param {Function} callback - handler invoked whenever any sync event occurs
 * @returns {Function} cleanup unsubscribe function
 */
export function subscribeToSync(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') {
    return () => {};
  }

  // Handle cross-tab messages from BroadcastChannel
  const handleBroadcastMessage = (event) => {
    if (event && event.data && event.data.event) {
      // Also re-dispatch locally so standard window listeners fire
      try {
        window.dispatchEvent(new CustomEvent(event.data.event, { detail: event.data.payload || {} }));
      } catch (_) {
        window.dispatchEvent(new Event(event.data.event));
      }
      callback(event.data.event, event.data.payload);
    }
  };

  if (syncChannel) {
    syncChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Handle storage events from other tabs
  const handleStorageEvent = (event) => {
    if (event.key === 'pure_milk_bar_sync_event' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed && parsed.event) {
          try {
            window.dispatchEvent(new CustomEvent(parsed.event, { detail: {} }));
          } catch (_) {
            window.dispatchEvent(new Event(parsed.event));
          }
          callback(parsed.event, {});
        }
      } catch (_) {}
    }
  };

  window.addEventListener('storage', handleStorageEvent);

  // Return unified cleanup function
  return () => {
    if (syncChannel) {
      syncChannel.removeEventListener('message', handleBroadcastMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export default {
  broadcastSync,
  subscribeToSync,
};
