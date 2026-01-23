export const notificationStorage = {
  saveState: (state) => {
    try {
      localStorage.setItem('notification_state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving notification state:', error);
    }
  },

  loadState: () => {
    try {
      const saved = localStorage.getItem('notification_state');
      return saved ? JSON.parse(saved) : {
        shown: false,
        skippedCount: 0,
        dismissedCount: 0,
        lastShown: null
      };
    } catch (error) {
      console.error('Error loading notification state:', error);
      return {
        shown: false,
        skippedCount: 0,
        dismissedCount: 0,
        lastShown: null
      };
    }
  },

  shouldShowPopup: () => {
    const state = notificationStorage.loadState();
    const now = new Date();
    
    if (state.lastShown) {
      const lastShownDate = new Date(state.lastShown);
      const isSameDay = lastShownDate.toDateString() === now.toDateString();
      if (isSameDay) return false;
    }

    if (state.skippedCount >= 3) return false;
    if (state.dismissedCount >= 2) return false;

    return true;
  },

  markAsShown: () => {
    const state = notificationStorage.loadState();
    state.shown = true;
    state.lastShown = new Date().toISOString();
    notificationStorage.saveState(state);
  },

  incrementSkipCount: () => {
    const state = notificationStorage.loadState();
    state.skippedCount = (state.skippedCount || 0) + 1;
    notificationStorage.saveState(state);
    return state.skippedCount;
  },

  incrementDismissCount: () => {
    const state = notificationStorage.loadState();
    state.dismissedCount = (state.dismissedCount || 0) + 1;
    notificationStorage.saveState(state);
    return state.dismissedCount;
  },

  resetAll: () => {
    notificationStorage.saveState({
      shown: false,
      skippedCount: 0,
      dismissedCount: 0,
      lastShown: null
    });
  }
};