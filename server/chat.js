import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { FaissStore } from "langchain/vectorstores/faiss";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";

import { PDFLoader } from "langchain/document_loaders/fs/pdf";

// NOTE: change this default filePath to any of your default file name
const chat = async (filePath = "./uploads/dynamodb.pdf", query) => {
  // async is similar to promise, it is a way to handle asynchronous code
  // step 1:
  const loader = new PDFLoader(filePath);

  const data = await loader.load(); // loader.load() is a promise, so we need to use await to wait for the promise to resolve

  // step 2:
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500, //  (in terms of number of characters)
    chunkOverlap: 0,
  });

  const splitDocs = await textSplitter.splitDocuments(data);

  // step 3

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  // embeddings is a class that is used to convert text into vectors
  const vectorStore = await FaissStore.fromDocuments(
    splitDocs,
    embeddings
  );
  // try {
  //     const vectorStore = await FaissStore.fromDocuments(
  //         splitDocs,
  //         embeddings
  //     );
  // } catch (error) {
  //     console.log(error);
  // }

  // step 4: retrieval

  // const relevantDocs = await vectorStore.similaritySearch(
  // "What is task decomposition?"
  // );

  // step 5: qa w/ customzie the prompt
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });

  const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.

{context}
Question: {question}
Helpful Answer:`;

  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    prompt: PromptTemplate.fromTemplate(template),
    // returnSourceDocuments: true,
  });

  const response = await chain.call({
    query,
  });

  return response;
};

export default chat;
