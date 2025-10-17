// FIX: Add required properties to the response schema for more robust validation.
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { GeneratedLogo, LogoPrompt } from '../models/logo.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;
  public error = signal<string | null>(null);

  constructor() {
    // IMPORTANT: This assumes process.env.API_KEY is set in the build environment.
    // Do not hardcode the API key here.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      this.error.set('API Key not found. Please ensure it is configured in your environment.');
      throw new Error('API Key not found.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateLogoPrompts(answers: string[]): Promise<LogoPrompt[]> {
    this.error.set(null);
    const [companyName, businessType, targetAudience, coreValues, desiredStyle] = answers;

    const contents = `
      Company Name: ${companyName}
      Business Type: ${businessType}
      Target Audience: ${targetAudience}
      Core Values: ${coreValues}
      Desired Style: ${desiredStyle}
      
      Based on the information above, generate 4 distinct and highly detailed image generation prompts for a professional company logo. The prompts should be creative and suitable for the 'imagen-3.0-generate-002' model. Each prompt should specify a different design style (e.g., minimalist, modern, abstract, classic).
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: "You are a world-class logo designer with over 20 years of experience specializing in brand identity. Your task is to generate professional, creative, and highly specific image generation prompts for logos based on client requirements. Respond only with the requested JSON.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                prompt: {
                  type: Type.STRING,
                  description: 'A detailed, specific prompt for an AI image generator to create a logo. Include details on style, color, and subject matter.',
                },
                style: {
                  type: Type.STRING,
                  description: 'The primary design style of the logo concept (e.g., Minimalist, Modern, Abstract, Classic).',
                },
              },
              required: ["prompt", "style"]
            },
          },
        },
      });

      const jsonString = response.text.trim();
      const prompts = JSON.parse(jsonString) as LogoPrompt[];
      return prompts;
    } catch (e) {
      console.error('Error generating logo prompts:', e);
      this.error.set('Failed to generate logo concepts. Please try again.');
      return [];
    }
  }
  
  async generateImagesFromPrompts(prompts: LogoPrompt[]): Promise<GeneratedLogo[]> {
    this.error.set(null);
    const generatedLogos: GeneratedLogo[] = [];

    for (const p of prompts) {
      try {
        const response = await this.ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: p.prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
          },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            generatedLogos.push({
                prompt: p.prompt,
                style: p.style,
                base64Image: `data:image/png;base64,${base64ImageBytes}`
            });
        }
      } catch (e) {
        console.error(`Error generating image for prompt: "${p.prompt}"`, e);
        // Continue to next prompt even if one fails
        this.error.set('Some images could not be generated. Results may be incomplete.');
      }
    }
    
    return generatedLogos;
  }

  async refineLogoPrompt(originalPrompt: string, feedback: string): Promise<LogoPrompt | null> {
    this.error.set(null);
    const contents = `
      Original Logo Prompt: "${originalPrompt}"
      
      User Feedback for modification: "${feedback}"
      
      Based on the user feedback, generate a new, single, refined image generation prompt. The new prompt must retain the core concept of the original but incorporate the requested changes. It should be highly detailed and suitable for the 'imagen-3.0-generate-002' model. The new prompt should also have an updated style description.
    `;

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: "You are a world-class logo designer with over 20 years of experience specializing in brand identity. Your task is to refine an existing logo prompt based on user feedback. Respond only with the requested JSON for a single prompt.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              prompt: {
                type: Type.STRING,
                description: 'A detailed, specific prompt for an AI image generator to create a logo, updated with user feedback.',
              },
              style: {
                type: Type.STRING,
                description: 'The primary design style of the refined logo concept (e.g., Minimalist, Modern, Abstract, Classic).',
              },
            },
            required: ["prompt", "style"]
          },
        },
      });

      const jsonString = response.text.trim();
      const refinedPrompt = JSON.parse(jsonString) as LogoPrompt;
      return refinedPrompt;
    } catch (e) {
      console.error('Error refining logo prompt:', e);
      this.error.set('Failed to refine the logo concept. Please try again.');
      return null;
    }
  }
}
