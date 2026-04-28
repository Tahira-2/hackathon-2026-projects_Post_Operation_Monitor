const STORAGE_KEY = 'burnoutwatch.worker_id';

function defaultSecureStore() {
  try {
    return require('expo-secure-store');
  } catch (error) {
    return null;
  }
}

function createWorkerIdentityStore({ secureStore = defaultSecureStore() } = {}) {
  if (!secureStore) {
    let memoryValue = null;

    return {
      async getWorkerId() {
        return memoryValue;
      },
      async setWorkerId(workerId) {
        memoryValue = workerId;
      },
      async clearWorkerId() {
        memoryValue = null;
      },
    };
  }

  return {
    async getWorkerId() {
      return secureStore.getItemAsync(STORAGE_KEY);
    },

    async setWorkerId(workerId) {
      return secureStore.setItemAsync(STORAGE_KEY, workerId);
    },

    async clearWorkerId() {
      return secureStore.deleteItemAsync(STORAGE_KEY);
    },
  };
}

module.exports = {
  STORAGE_KEY,
  createWorkerIdentityStore,
};
