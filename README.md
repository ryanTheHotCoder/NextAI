# Next AI: Full-Stack RAG-based PDF Q&A Agent

Next AI is a high-performance, full-stack web application designed to provide intelligent, context-aware answers from user-uploaded PDF documents. By combining a Retrieval-Augmented Generation (RAG) pipeline with modern machine learning techniques, Next AI delivers precise answers and semantic document recommendations.

## 🚀 Key Features

*   **RAG-based PDF Q&A:** Leverages **GPT-4o** and **LangChain** to answer complex questions based on the specific content of uploaded documents.
*   **Vector Retrieval:** Uses **OpenAI Embeddings** and **FAISS** (Facebook AI Similarity Search) for high-speed, localized vector storage and similarity search.
*   **Smart Recommendations:** Employs **TensorFlow.js (Universal Sentence Encoder)** to analyze document semantics and recommend similar existing uploads to the user.
*   **Conversational UI:** A polished, interactive interface built with **React** and **Ant Design**, featuring real-time upload progress and semantic match notifications.

## 🛠️ Technical Stack

*   **Frontend:** React, Ant Design, Axios.
*   **Backend:** Node.js, Express, Multer (for file handling).
*   **AI/ML:** 
    *   **LLM:** OpenAI GPT-4o.
    *   **Orchestration:** LangChain.
    *   **Vector Store:** FAISS (via `faiss-node`).
    *   **Similarity Engine:** TensorFlow.js + Universal Sentence Encoder.
*   **PDF Processing:** `pdf-parse`, `PDFLoader`.

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- An OpenAI API Key

### 1. Clone the Repository
```bash
git clone https://github.com/ryanTheHotCoder/NextAI.git
cd NextAI
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Setup the Frontend
```bash
cd ..
npm install
```

### 4. Run the Application
From the root directory:
```bash
npm run dev
```
This will start both the React frontend (port 3000) and the Express server (port 5001) concurrently.

## 🧠 How it Works

1.  **Ingestion:** When a user uploads a PDF, the backend extracts text and uses **TensorFlow.js** to generate a semantic embedding for the entire document.
2.  **Recommendation:** The system compares this embedding against existing files using **Cosine Similarity**, notifying the user of related documents.
3.  **Indexing:** For Q&A, the document is split into chunks and stored in a **FAISS** vector store.
4.  **Retrieval:** When a question is asked, the most relevant chunks are retrieved and passed to **GPT-4o** to generate a grounded, accurate response.

## 📄 License
This project is licensed under the MIT License.
