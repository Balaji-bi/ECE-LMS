import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with API key from environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

// List available models
async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

// Simple test of the Gemini API
async function testGemini() {
  try {
    // Try different model names
    const modelNames = ["gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];
    
    for (const modelName of modelNames) {
      console.log(`Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, what's your name?");
        console.log(`SUCCESS with ${modelName}: ${result.response.text()}`);
      } catch (error) {
        console.error(`FAILED with ${modelName}:`, error.message);
      }
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run both functions
async function main() {
  await listModels();
  await testGemini();
}

main().catch(console.error);