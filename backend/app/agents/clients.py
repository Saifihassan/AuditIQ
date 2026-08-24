import os
from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel
from dotenv import load_dotenv

load_dotenv()

bluesmind_client = AsyncOpenAI(
    base_url=os.getenv("BLUESMIND_BASE_URL"),
    api_key=os.getenv("BLUESMIND_API_KEY"),
)

general_compute_client = AsyncOpenAI(
    base_url=os.getenv("GENERALCOMPUTE_BASE_URL"),
    api_key=os.getenv("GENERALCOMPUTE_API_KEY"),
)


bluesmind=OpenAIChatCompletionsModel(model="gpt-5.5",openai_client=bluesmind_client)
general_compute=OpenAIChatCompletionsModel(model="minimax-m2.7",openai_client=general_compute_client)

nararouter_client = AsyncOpenAI(
    base_url=os.getenv("NARAROUTER_BASE_URL"),
    api_key=os.getenv("NARAROUTER_API_KEY"),
)
nararouter=OpenAIChatCompletionsModel(model="mistral-large",openai_client=nararouter_client)