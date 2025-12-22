import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from the local .env file
load_dotenv()

# Retrieve Supabase credentials from environment variables
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_SERVICE_KEY")

# Validate that critical configuration variables are present
if not url or not key:
    raise ValueError("CRITICAL ERROR: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from environment configuration.")

# Initialize the Supabase client with the provided URL and Service Key.
# The Service Key is used here to bypass Row Level Security (RLS) for administrative tasks
# such as embedding generation and document indexing.
supabase: Client = create_client(url, key)

if __name__ == "__main__":
    print("Supabase client initialized successfully.")