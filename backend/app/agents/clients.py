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


bluesmind=OpenAIChatCompletionsModel(model="kimi-k2.5",openai_client=bluesmind_client)
general_compute=OpenAIChatCompletionsModel(model="minimax-m2.7",openai_client=general_compute_client)

nararouter_client = AsyncOpenAI(
    base_url=os.getenv("NARAROUTER_BASE_URL"),
    api_key=os.getenv("NARAROUTER_API_KEY"),
)
nararouter=OpenAIChatCompletionsModel(model="deepseek-v4-flash",openai_client=nararouter_client)

gemini_client = AsyncOpenAI(
    base_url=os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/openai/"),
    api_key=os.getenv("GEMINI_API_KEY"),
)
gemini = OpenAIChatCompletionsModel(model="gemini-2.5-flash", openai_client=gemini_client)

conduit_client = AsyncOpenAI(
    base_url=os.getenv("CONDUIT_BASE_URL"),
    api_key=os.getenv("CONDUIT_API_KEY"),
)
conduit = OpenAIChatCompletionsModel(model="gpt-5.6", openai_client=conduit_client)

groq_client = AsyncOpenAI(
    base_url=os.getenv("GROQ_BASE_URL"),
    api_key=os.getenv("GROQ_API_KEY"),
)
groq = OpenAIChatCompletionsModel(model="openai/gpt-oss-120b", openai_client=groq_client)

literouter_client = AsyncOpenAI(
    base_url=os.getenv("LITEROUTER_BASE_URL"),
    api_key=os.getenv("LITEROUTER_API_KEY"),
)
literouter = OpenAIChatCompletionsModel(model="glm-5.3-flash-", openai_client=literouter_client)
