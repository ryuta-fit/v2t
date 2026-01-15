import { GoogleGenAI } from "@google/genai";
import { blobToBase64 } from "../utils/audioHelpers";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Transcribes audio data using the specified Gemini model.
 * @param audioBlob The audio file or recording as a Blob.
 * @param mimeType The MIME type of the audio.
 * @param modelName The model to use ('gemini-3-flash-preview' or 'gemini-3-pro-preview').
 */
export const transcribeAudio = async (
  audioBlob: Blob, 
  mimeType: string, 
  modelName: string = 'gemini-3-flash-preview'
): Promise<string> => {
  try {
    const base64Data = await blobToBase64(audioBlob);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `
            以下の音声データを日本語で高精度に文字起こししてください。
            
            要件:
            1. 話者が複数いると思われる場合は、可能であれば改行して区別してください。
            2. 「えー」「あー」などの意味のないフィラー（言い淀み）は削除し、自然な文章に整えてください。
            3. 専門用語や固有名詞は文脈から推測して正しく記述してください。
            4. 出力は文字起こしされたテキストのみを含めてください。前置きや挨拶は不要です。
            `
          }
        ]
      },
      config: {
        temperature: 0.3,
      }
    });

    return response.text || "文字起こし結果が空でした。";
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("文字起こし中にエラーが発生しました。もう一度お試しください。");
  }
};