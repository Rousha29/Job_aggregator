let syncRunning = false;

export const isSyncRunning = () => syncRunning;

export const startSync = () => {
      if (syncRunning) return false;
      syncRunning = true;
      return true;
};

export const endSync = () => {
      syncRunning = false;
};
