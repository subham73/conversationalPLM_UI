import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

// import { openai } from '@ai-sdk/openai';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
// import { isTestEnvironment } from '../constants';

// export const myProvider = isTestEnvironment
//   ? customProvider({
//       languageModels: {
//         'chat-model': chatModel,
//         'chat-model-reasoning': reasoningModel,
//         'title-model': titleModel,
//         'artifact-model': artifactModel,
//       },
//     })
//   : customProvider({
//     languageModels: {
//       // ✅ Replace X.AI model with GPT-4o-mini
//       'chat-model': openai('gpt-4o-mini'),
//       'chat-model-reasoning': wrapLanguageModel({
//         model: openai('gpt-4o-mini'),
//         middleware: extractReasoningMiddleware({ tagName: 'think' }),
//       }),
//       'title-model': openai('gpt-4o-mini'),
//       'artifact-model': openai('gpt-4o-mini'),
//     },
//     imageModels: {
//       // GPT-4o supports vision too
//       'small-model': openai.imageModel('gpt-4o-mini'),
//     },
//   });


import { fastapiProvider } from './fastapi-provider';
import { isTestEnvironment } from '../constants';

// Export 'myProvider' to match existing imports in your app
export const myProvider = isTestEnvironment ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    }) : {
  languageModel: (modelId: string = "fastapi-chat") => fastapiProvider.languageModel(modelId),
};