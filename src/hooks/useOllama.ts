import { useState, useEffect, useCallback } from 'react';
import {
  checkOllamaStatus,
  listModels,
  OLLAMA_DEFAULT_MODEL,
  OLLAMA_DEFAULT_URL,
  type OllamaModel,
  type OllamaStatus,
} from '@/services/ollamaService';

export function useOllama() {
  const [status, setStatus] = useState<OllamaStatus>({ connected: false });
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModelState] = useState<string>(
    localStorage.getItem('ollama_model') || OLLAMA_DEFAULT_MODEL,
  );
  const [baseUrl, setBaseUrlState] = useState<string>(
    localStorage.getItem('ollama_url') || OLLAMA_DEFAULT_URL,
  );
  const [isChecking, setIsChecking] = useState(false);

  const refresh = useCallback(async () => {
    setIsChecking(true);
    const s = await checkOllamaStatus();
    setStatus(s);
    if (s.connected) {
      const m = await listModels();
      setModels(m);
    }
    setIsChecking(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  function setSelectedModel(model: string) {
    setSelectedModelState(model);
    localStorage.setItem('ollama_model', model);
  }

  function setBaseUrl(url: string) {
    setBaseUrlState(url);
    localStorage.setItem('ollama_url', url);
  }

  return {
    status,
    models,
    selectedModel,
    setSelectedModel,
    baseUrl,
    setBaseUrl,
    isChecking,
    refresh,
  };
}
