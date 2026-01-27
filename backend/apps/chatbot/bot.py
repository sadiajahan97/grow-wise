import os
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import Tool
from langchain_google_community import GoogleSearchAPIWrapper

from psycopg_pool import ConnectionPool
from psycopg.rows import dict_row
from dotenv import load_dotenv

load_dotenv()

# Define the state
class State(TypedDict):
    messages: Annotated[list, add_messages]

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_search={
        "dynamic_retrieval_config": {
            "mode": "MODE_DYNAMIC",
            "dynamic_threshold": 0.3
        }
    },
    google_api_key=os.getenv("GEMINI_API_KEY"))

def chatbot_node(state: State):
    return {"messages": [llm.invoke(state["messages"])]}


# # Initialize Google Search tool
# search = GoogleSearchAPIWrapper()
# search_tool = Tool(
#     name="google_search",
#     description="Search Google for recent results.",
#     func=search.run,
# )


# search_tool = {
#     "google_search_retrieval": {
#         "dynamic_retrieval_config": {
#             "mode": "MODE_DYNAMIC", 
#             "dynamic_threshold": 0.3,
#         }
#     } 
# }

# # Bind LLM with tools
# llm_with_tools = llm.bind_tools([search_tool])

# def chatbot_node(state: State):
#     return {"messages": [llm_with_tools.invoke(state["messages"])]}


# Use this configuration to avoid Pydantic Enum errors
# dynamic_retrieval_tool = {
#     "google_search": {
#         "dynamic_retrieval_config": {
#             "mode": "MODE_DYNAMIC",  # Use a STRING here, not the Enum object
#             "dynamic_threshold": 0.3
#         }
#     }
# }

# # Pass directly in the invoke call
# def chatbot_node(state: dict):
#     response = llm.invoke(
#         state["messages"],
#         tools=[dynamic_retrieval_tool]
#     )
#     return {"messages": [response]}

# Setup the graph
workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot_node)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)

# DB connection string from your existing Django environment
DB_URI = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

# Create a connection pool with the required row_factory
pool = ConnectionPool(
    conninfo=DB_URI, 
    max_size=20, 
    kwargs={"autocommit": True, "row_factory": dict_row}
)

# Initialize checkpointer and compile graph
checkpointer = PostgresSaver(pool)

# NOTE: Run this once during deployment to create tables
# checkpointer.setup() 

graph = workflow.compile(checkpointer=checkpointer)