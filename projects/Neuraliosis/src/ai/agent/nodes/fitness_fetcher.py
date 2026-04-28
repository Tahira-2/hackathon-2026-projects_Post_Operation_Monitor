from agent.state import HealthState
from fitness.mock_provider import get_fitness_data
import logging

logger = logging.getLogger(__name__)

def fitness_fetcher(state: HealthState) -> dict:
    data = get_fitness_data()
    return {"fitness_data": data}
