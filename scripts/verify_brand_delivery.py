import urllib.request
import re
import sys

BASE_URL = "http://localhost:3000"

print("=== 1. Checking Homepage HTML Metadata ===")
try:
    with urllib.request.urlopen(BASE_URL) as response:
        status = response.status
        html = response.read().decode('utf-8')
        print(f"Homepage HTTP Status: {status}")
except Exception as e:
    print(f"Failed to fetch homepage: {e}")
    sys.exit(1)

# Check Title & Description
title_match = re.search(r'<title>(.*?)</title>', html)
print(f"Title: {title_match.group(1) if title_match else 'MISSING'}")

desc_match = re.search(r'<meta name="description" content="(.*?)"', html)
print(f"Description: {desc_match.group(1) if desc_match else 'MISSING'}")

# Check Icons
print("\n=== Icon Link Tags ===")
icon_tags = re.findall(r'<link[^>]+(?:icon|apple)[^>]+>', html)
for tag in icon_tags:
    print(f"  {tag}")

# Check Open Graph & Twitter
print("\n=== Open Graph & Twitter Meta Tags ===")
og_tags = re.findall(r'<meta[^>]+(?:og:|twitter:)[^>]+>', html)
for tag in og_tags:
    print(f"  {tag}")

# Test individual asset responses
assets_to_test = [
    "/favicon.ico",
    "/favicon.svg",
    "/icon.png",
    "/icon-16.png",
    "/icon-32.png",
    "/icon-192.png",
    "/apple-touch-icon.png",
    "/brand/paypath-devpost-thumbnail.png",
    "/brand/paypath-social-preview.png",
    "/brand/paypath-mark.svg",
    "/brand/paypath-logo.svg",
    "/brand/paypath-wordmark.svg",
]

print("\n=== 2. Checking Static Asset Delivery ===")
all_passed = True
for asset in assets_to_test:
    url = f"{BASE_URL}{asset}"
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req) as resp:
            content_type = resp.headers.get("Content-Type", "unknown")
            content_length = resp.headers.get("Content-Length", "unknown")
            print(f"[OK] {asset} -> HTTP {resp.status} ({content_type}, {content_length} bytes)")
    except Exception as e:
        print(f"[FAIL] {asset} -> Error: {e}")
        all_passed = False

if all_passed:
    print("\n[ALL ASSET CHECKS PASSED]")
else:
    print("\n[SOME ASSETS FAILED]")
    sys.exit(1)
