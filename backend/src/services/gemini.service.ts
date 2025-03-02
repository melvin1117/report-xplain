import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    // Initialize the Gemini API client with your API key.
    // Consider using environment variables for enhanced security.
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  async processPDFBuffer(pdfBuffer: Buffer, query: string): Promise<any> {
    try {
      console.log('✅ PDF loaded successfully from buffer');

      // Get the Gemini Model
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
      console.log('📡 Sending request to Gemini API...');

      // Send request to Gemini API
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: query }, // User's query
              { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } }, // PDF File as base64
            ],
          },
        ],
      });

      // Extract the response text
      const response = await result.response;
      let textOutput = await response.text();
      console.log('📄 Raw Gemini Response (before cleaning):\n', textOutput);

      // Clean up the response text by removing markdown formatting, comments, trailing commas, and control characters
      textOutput = textOutput.replace(/^```json|```$/g, '').trim();
      textOutput = textOutput.replace(/\/\/.*/g, '');
      textOutput = textOutput
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      textOutput = textOutput.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

      // Attempt to parse the JSON output
      try {
        const parsedOutput = JSON.parse(textOutput);
        console.log('✅ Gemini response parsed successfully');
        return parsedOutput;
      } catch (error) {
        console.error('❌ JSON Parsing Failed. Returning raw output.');
        // Return raw output for debugging if parsing fails
        return { error: 'JSON Parsing Failed', rawOutput: textOutput };
      }
    } catch (error) {
      console.error('❌ Error processing PDF:', error.message);
      throw error;
    }
  }
}
