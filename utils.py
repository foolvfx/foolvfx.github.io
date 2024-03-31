import json

def load_json(filename: str) -> dict:
    with open(filename, 'r') as f:
        return json.load(f)

def write_json(filename: str, obj: dict) -> None:
    jsn = json.dumps(obj, indent='\t')
    with open(filename, 'w') as f:
        f.write(jsn)