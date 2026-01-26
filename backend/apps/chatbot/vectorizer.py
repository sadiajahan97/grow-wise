# import os
# from langchain_community.document_loaders import PyPDFLoader, UnstructuredWordDocumentLoader, TextLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
# from langchain_chroma import Chroma

# # Initialize Embeddings
# embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

# # Persistent ChromaDB setup
# CHROMA_PATH = os.path.join(os.getcwd(), "chroma_db")

# def get_vector_store():
#     """Returns the persistent vector store instance."""
#     return Chroma(
#         persist_directory=CHROMA_PATH,
#         embedding_function=embeddings,
#         collection_name="chat_docs"
#     )

# def vectorize_file(file_path: str, thread_id: str):
#     """Loads a file, chunks it, and adds it to the vector store with metadata."""
#     # 1. Determine Loader
#     if file_path.endswith(".pdf"):
#         loader = PyPDFLoader(file_path)
#     elif file_path.endswith((".doc", ".docx")):
#         loader = UnstructuredWordDocumentLoader(file_path)
#     else:
#         loader = TextLoader(file_path)

#     # 2. Load and Split
#     docs = loader.load()
#     splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
#     chunks = splitter.split_documents(docs)

#     # 3. Add Metadata for filtering (Critical for Production)
#     for chunk in chunks:
#         chunk.metadata["thread_id"] = str(thread_id)

#     # 4. Save to Chroma
#     vector_store = get_vector_store()
#     vector_store.add_documents(chunks)
#     return True