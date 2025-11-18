import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);

  // Actions
  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  const setError = (error: string | null) => {
    errorMessage.value = error;
  };

  return {
    isLoading,
    errorMessage,
    setLoading,
    setError,
  };
});
