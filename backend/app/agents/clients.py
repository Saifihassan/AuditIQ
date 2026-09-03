import os
from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel
from dotenv import load_dotenv
from app.agents.providers import PROVIDER_REGISTRY

load_dotenv()

bluesmind_client = AsyncOpenAI(
    base_url=os.getenv("BLUESMIND_BASE_URL"),
    api_key=os.getenv("BLUESMIND_API_KEY"),
)

general_compute_client = AsyncOpenAI(
    base_url=os.getenv("GENERALCOMPUTE_BASE_URL"),
    api_key=os.getenv("GENERALCOMPUTE_API_KEY"),
)


bluesmind=OpenAIChatCompletionsModel(model="gpt-5.3-codex",openai_client=bluesmind_client)
general_compute=OpenAIChatCompletionsModel(model="minimax-m2.7",openai_client=general_compute_client)

nararouter_client = AsyncOpenAI(
    base_url=os.getenv("NARAROUTER_BASE_URL"),
    api_key=os.getenv("NARAROUTER_API_KEY"),
)
nararouter=OpenAIChatCompletionsModel(model="laguna-s-2.1",openai_client=nararouter_client)

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
groq = OpenAIChatCompletionsModel(model="qwen/qwen3.8-27b", openai_client=groq_client)

literouter_client = AsyncOpenAI(
    base_url=os.getenv("LITEROUTER_BASE_URL"),
    api_key=os.getenv("LITEROUTER_API_KEY"),
)
literouter = OpenAIChatCompletionsModel(model="glm-5.3-flash-", openai_client=literouter_client)

def create_user_model(api_key: str, provider: str, model_id: str) -> OpenAIChatCompletionsModel:
    """Create a model client on-the-fly using the user's own API key."""
    config = PROVIDER_REGISTRY.get(provider)
    if not config:
        raise ValueError(f"Provider {provider} not found in registry.")
    client = AsyncOpenAI(base_url=config["base_url"], api_key=api_key)
    return OpenAIChatCompletionsModel(model=model_id, openai_client=client)
