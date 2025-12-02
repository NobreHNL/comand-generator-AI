import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// In the Applet environment, `process.env.API_KEY` is provided.
declare var process: any;

export interface SystemPromptRequest {
  company: string;
  useCase: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  readonly generationResult = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string>('');

  constructor() {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } else {
         this.error.set('API_KEY não encontrada. Configure a variável de ambiente API_KEY para gerar novos prompts.');
      }
    } catch (e) {
      console.error('Falha ao inicializar o GoogleGenAI', e);
      this.error.set('Falha ao inicializar o serviço de IA. Verifique o console para mais detalhes.');
    }
  }

  async generatePrompt(request: SystemPromptRequest): Promise<void> {
    if (!this.ai) {
        this.error.set('O serviço de IA não está inicializado. A API_KEY é necessária.');
        return;
    }

    this.isLoading.set(true);
    this.error.set('');
    this.generationResult.set('');

    const prompt = `
      Você é um especialista em criar prompts de sistema para LLMs que funcionam como assistentes virtuais.
      Sua tarefa é gerar um prompt de sistema completo e eficaz com base nos detalhes fornecidos.
      O prompt de sistema deve ter duas seções principais: "Meta" e "Instruções".
      Seja claro, conciso e direto. O resultado deve ser em Português.

      Detalhes para o assistente virtual:
      - Empresa: ${request.company}
      - Caso de Uso e Regras: ${request.useCase}

      Gere o prompt de sistema no formato Markdown, usando títulos com '###'.
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      this.generationResult.set(response.text);
    } catch (e: any) {
      console.error('Error generating content:', e);
      this.error.set(`Ocorreu um erro ao gerar o comando: ${e.message}`);
    } finally {
      this.isLoading.set(false);
    }
  }
}
