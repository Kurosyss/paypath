import re
import os

files_to_check = [
    "README.md",
    "scripts/generate_readme_yt_card.py"
]

patterns = [
    (r"(?i)AIza[0-9A-Za-z-_]{35}", "Google GenAI API Key"),
    (r"(?i)ghp_[0-9a-zA-Z]{36}", "GitHub Personal Access Token"),
    (r"(?i)paypal[_\s-]*(?:secret|key|token)[ =:\'\"]+([A-Za-z0-9_-]{20,})", "PayPal Secret/Token"),
    (r"(?i)bearer\s+[A-Za-z0-9_\-\.]{25,}", "Bearer Token"),
    (r"(?i)(?:api[_-]?key|client[_-]?secret)[ =:\'\"]+([A-Za-z0-9_-]{20,})", "Generic API Key/Secret")
]

whitelist_words = [
    "your_paypal", "your_gemini", "client_secret_here", "client_id_here",
    "api_key_here", "placeholder", "example", "orders/v2", "localhost"
]

found_secrets = []

for fpath in files_to_check:
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        lines = f.readlines()
    for idx, line in enumerate(lines, 1):
        for pat, desc in patterns:
            for match in re.finditer(pat, line):
                matched_str = match.group(0)
                # Check whitelist
                if any(w in matched_str.lower() for w in whitelist_words):
                    continue
                found_secrets.append((fpath, idx, desc, matched_str[:25] + "..."))

if found_secrets:
    print(f"[FAIL] Potential secrets found ({len(found_secrets)}):")
    for item in found_secrets:
        print(f"  {item[0]}:{item[1]} - {item[2]} ({item[3]})")
else:
    print("[PASS] Zero secrets or sensitive API credentials found in scanned files!")
