// Ollama local AI service — connects to http://localhost:11434 by default

export const OLLAMA_DEFAULT_URL = 'http://localhost:11434';
export const OLLAMA_DEFAULT_MODEL = 'llama3';

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface OllamaChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaStatus {
  connected: boolean;
  version?: string;
  error?: string;
}

function getBaseUrl(): string {
  return localStorage.getItem('ollama_url') || OLLAMA_DEFAULT_URL;
}

function getModel(): string {
  return localStorage.getItem('ollama_model') || OLLAMA_DEFAULT_MODEL;
}

export async function checkOllamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/version`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { connected: false, error: 'Serviço indisponível' };
    const data = await res.json();
    return { connected: true, version: data.version };
  } catch {
    return { connected: false, error: 'Ollama não encontrado. Instale e inicie o Ollama.' };
  }
}

export async function listModels(): Promise<OllamaModel[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.models || [];
  } catch {
    return [];
  }
}

export async function* streamChat(
  messages: OllamaChatMessage[],
  model?: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const res = await fetch(`${getBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || getModel(),
      messages,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama erro ${res.status}: ${err}`);
  }

  if (!res.body) throw new Error('Sem corpo na resposta do Ollama');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value, { stream: true }).split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        if (json.message?.content) yield json.message.content;
        if (json.done) return;
      } catch {
        // partial JSON chunk — skip
      }
    }
  }
}

export async function generateSQL(prompt: string, model?: string): Promise<string> {
  const systemPrompt = `Você é um especialista em SQL. Gere APENAS código SQL puro e otimizado sem explicações extras.
Retorne somente o bloco SQL dentro de \`\`\`sql ... \`\`\`.
O SQL deve ser seguro (somente SELECT, WITH) e compatível com PostgreSQL, MySQL, SQL Server e Oracle quando possível.`;

  const res = await fetch(`${getBaseUrl()}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || getModel(),
      system: systemPrompt,
      prompt,
      stream: false,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama erro ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.response || '';
}
