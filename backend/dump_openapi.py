import json
from app.main import app

openapi_schema = app.openapi()
with open("openapi_generated.json", "w") as f:
    json.dump(openapi_schema, f, indent=2)
