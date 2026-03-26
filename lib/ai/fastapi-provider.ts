import {
  LanguageModelV2,
  LanguageModelV2CallOptions,
  LanguageModelV2Content,
  LanguageModelV2FinishReason,
  LanguageModelV2StreamPart,
  LanguageModelV2Usage,
  LanguageModelV2CallWarning,
} from '@ai-sdk/provider';
import { v4 as uuidv4 } from 'uuid';

class FastAPIChatLanguageModel implements LanguageModelV2 {
  specificationVersion: "v2" = "v2";
  provider = "fastapi";
  modelId: string;
  supportedUrls = {};

  constructor(modelId = "fastapi-chat", public endpoint = "http://localhost:8000/api/chat") {
    this.modelId = modelId;
  }


  private toBackendMessages(prompt: any[]): any[] {
  return prompt.map((msg, idx) => {
    let parts;
    if (Array.isArray(msg.content)) {
      // User or assistant role, content is an array of {type, text}
      parts = msg.content.map((part: any) => ({
        type: part.type,
        text: typeof part.text === 'string'
          ? part.text
          : (Array.isArray(part.text)
              ? part.text.map((p: any) => (typeof p === "string" ? p : p.text)).join(" ")
              : ""
            )
      }));
    } else if (typeof msg.content === "string") {
      // System role, content is a string
      parts = [{ type: "text", text: msg.content }];
    } else {
      // Fallback: empty part
      parts = [{ type: "text", text: "" }];
    }
    return {
      id: msg.id ?? String(idx),
      role: msg.role,
      parts,
    };
  });
    }

  async doStream(options: LanguageModelV2CallOptions) {
    const payload = {
      messages: this.toBackendMessages(options.prompt),
      ...options,
    };

    console.log(JSON.stringify(payload, null, 2));

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
      body: JSON.stringify(payload),
      signal: options.abortSignal,
    });

    if (!response.body) throw new Error('No stream received from FastAPI backend');

    const stream = new ReadableStream<LanguageModelV2StreamPart>({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let events = buffer.split('\n\n');
            buffer = events.pop() ?? '';
            for (const event of events) {
              if (event.startsWith('data: ')) {
                const payloadStr = event.slice(6).trim();
                if (payloadStr === '[DONE]') {
                  controller.close();
                  return;
                }
                try {
                  const obj = JSON.parse(payloadStr);
                  switch (obj.type) {
                    case 'stream-start':
                      controller.enqueue({ type: 'stream-start', warnings: [] });
                      break;
                    case 'text-start':
                      controller.enqueue({ type: 'text-start', id: obj.id ?? uuidv4() });
                      break;
                    case 'text-delta':
                      controller.enqueue({
                        type: 'text-delta',
                        id: obj.id ?? uuidv4(),
                        delta: obj.delta ?? '',
                      });
                      break;
                    case 'text-end':
                      controller.enqueue({ type: 'text-end', id: obj.id ?? uuidv4() });
                      break;
                  }
                } catch {
                  // ignore malformed JSON
                }
              }
            }
          }
        } finally {
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
      }
    });

    return {stream,};
  }

  async doGenerate(
    options: LanguageModelV2CallOptions
    ): Promise<{
    content: LanguageModelV2Content[];
    finishReason: LanguageModelV2FinishReason;
    usage: LanguageModelV2Usage;
    providerMetadata?: any;
    request?: any;
    response?: any;
    warnings: LanguageModelV2CallWarning[];
    }> {
        const nonStreamingEndpoint = "http://localhost:8000/api/chat-sync";
        const payload = {
            messages: this.toBackendMessages(options.prompt),
            ...options,
            stream: false,
        };

        const response = await fetch(nonStreamingEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: options.abortSignal,
        });

        if (!response.ok) throw new Error(`Backend returned status ${response.status}`);

        const result = await response.json();

        const content: LanguageModelV2Content[] = [
            { type: 'text', text: result.text ?? '' },
        ];

        return {
            content,
            finishReason: 'stop',
            usage: {
            inputTokens: undefined,
            outputTokens: undefined,
            totalTokens: undefined,
            },
            warnings: [],

            // Optionally add these for debugging or custom use:
            // providerMetadata: {},    
            // request: { body: payload },
            // response: { status: response.status }
        };
    }
//   async doGenerate(options: LanguageModelV2CallOptions): Promise<never> {
//     throw new Error('Non-streaming completion is not supported. Use streaming.');
//   }
}

export const fastapiProvider = {
  languageModel: (modelId: string = 'fastapi-chat') => new FastAPIChatLanguageModel(modelId),
};
