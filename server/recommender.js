import tf from '@tensorflow/tfjs-node';
import use from '@tensorflow-models/universal-sentence-encoder';
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import fs from 'fs/promises';
import path from 'path';

/**
 * Global variable to cache the TensorFlow.js Universal Sentence Encoder model.
 * Loading the model is an expensive operation, so we only want to do it once.
 */
let model = null;

/**
 * Loads the Universal Sentence Encoder (USE) model if it hasn't been loaded yet.
 * USE is a model that encodes text into high-dimensional vectors (512 dimensions)
 * that can be used for semantic similarity tasks.
 */
async function loadModel() {
  if (!model) {
    model = await use.load();
  }
  return model;
}

/**
 * Extracts text content from a PDF file using LangChain's PDFLoader.
 * @param {string} filePath - Path to the PDF file.
 * @returns {Promise<string>} - The extracted text content.
 */
async function extractTextFromPDF(filePath) {
  try {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    // Join all page content and limit to 5000 characters to prevent memory/performance issues
    // while still providing enough context for the semantic embedding.
    return docs.map(doc => doc.pageContent).join('\n').substring(0, 5000);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return "";
  }
}

/**
 * Calculates the cosine similarity between two numerical vectors.
 * Cosine similarity measures the cosine of the angle between two vectors,
 * representing how similar their directions (and thus their meanings) are.
 * Range: -1 (opposite) to 1 (identical).
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

/**
 * Main function to find similar documents for a newly uploaded PDF.
 * @param {string} newFilePath - Path to the newly uploaded PDF.
 * @returns {Promise<Array>} - Top 3 recommended similar documents with their similarity scores.
 */
export async function getRecommendations(newFilePath) {
  const uploadsDir = path.dirname(newFilePath);
  
  // 1. Get all other PDF files in the uploads directory
  const files = await fs.readdir(uploadsDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf') && path.join(uploadsDir, f) !== newFilePath);

  if (pdfFiles.length === 0) return [];

  // 2. Load the TFJS model and extract text from the new file
  const useModel = await loadModel();
  const newText = await extractTextFromPDF(newFilePath);
  if (!newText.trim()) return [];

  // 3. Extract text from existing PDF files for comparison
  const otherTexts = [];
  const validPdfFiles = [];

  for (const file of pdfFiles) {
    const fullPath = path.join(uploadsDir, file);
    const text = await extractTextFromPDF(fullPath);
    if (text.trim()) {
      otherTexts.push(text);
      validPdfFiles.push(file);
    }
  }

  if (validPdfFiles.length === 0) return [];

  /**
   * 4. Generate Semantic Embeddings
   * The Universal Sentence Encoder converts each block of text into a 512-dimensional vector.
   * Texts with similar meanings will result in vectors that are "close" to each other mathematically.
   */
  const allTexts = [newText, ...otherTexts];
  const embeddings = await useModel.embed(allTexts);
  const embeddingsArray = await embeddings.array();

  const newEmbedding = embeddingsArray[0];
  const similarities = [];

  /**
   * 5. Calculate Similarity
   * Compare the new document's embedding with the embeddings of all other documents.
   */
  for (let i = 0; i < validPdfFiles.length; i++) {
    const sim = cosineSimilarity(newEmbedding, embeddingsArray[i + 1]);
    similarities.push({
      fileName: validPdfFiles[i],
      similarity: sim
    });
  }

  // 6. Sort by highest similarity and return top 3
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, 3);
}
