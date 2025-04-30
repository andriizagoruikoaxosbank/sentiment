#!/usr/bin/env python3

import re
import sys
from pathlib import Path

# The pattern to match the API key (sk-proj-...)
api_key_pattern = re.compile(r"sk-proj-[a-zA-Z0-9_-]+")

# Process a single file
def process_file(filename, data):
    # Only process route.ts files
    if filename.endswith("route.ts"):
        # Replace the API key with a placeholder
        replaced_data = api_key_pattern.sub("'process.env.OPENAI_API_KEY || \"\"'", data.decode("utf-8"))
        return replaced_data.encode("utf-8")
    return data

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: {} <filename>".format(sys.argv[0]))
        sys.exit(1)

    filename = sys.argv[1]
    if not Path(filename).exists():
        sys.exit(0)

    with open(filename, "rb") as f:
        data = f.read()

    new_data = process_file(filename, data)
    
    with open(filename, "wb") as f:
        f.write(new_data) 