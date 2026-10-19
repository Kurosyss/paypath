#!/usr/bin/env python3
"""
PayPath — Master Brand Asset Generator (Product-Driven Reset)
Visual Concept: The Payment Lifecycle Engine
- Mark: Concept 2 — The Bifurcated Route (Divergence & Interception)
  A transaction path traversing lifecycle stages; duplicate route arrested by
  an authoritative stop barrier, authoritative route reaching settled state.
- Artwork: The 4-Stage Payment Lifecycle
  ORDER -> BUYER APPROVAL -> CAPTURE -> RECONCILIATION
  With duplicate event intercepted at concurrency gate and authoritative settlement verified.
"""

import os
import shutil
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BRAND_DIR = os.path.join(ROOT_DIR, "public", "brand")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
APP_DIR = os.path.join(ROOT_DIR, "src", "app")
ART_DIR = os.environ.get("PAYPATH_ART_DIR")

os.makedirs(BRAND_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(APP_DIR, exist_ok=True)
if ART_DIR:
    os.makedirs(ART_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# 1. Master SVG Definitions (Concept 2: The Bifurcated Route)
# ---------------------------------------------------------------------------

SVG_MARK_PATH = 'd="M 8 28 H 20 L 32 14 H 54 V 24 H 46 V 22 H 33.5 L 24 32 L 33.5 42 H 41 V 50 H 32 L 20 36 H 8 Z"'
SVG_BARRIER_RECT = '<rect x="46" y="36" width="5" height="18" rx="1.5"'

SVG_MARK_ADAPTIVE = f"""<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- PayPath Bifurcated Route: Lifecycle divergence & authoritative settlement -->
  <path {SVG_MARK_PATH} fill="currentColor"/>
  <!-- Interception Barrier: Arrests duplicate / unsafe transaction path -->
  {SVG_BARRIER_RECT} fill="currentColor"/>
</svg>"""

SVG_MARK_DARK = f"""<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#0A0A0A"/>
  <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" stroke="#262626"/>
  <path {SVG_MARK_PATH} fill="#FFFFFF"/>
  {SVG_BARRIER_RECT} fill="#FFFFFF"/>
</svg>"""

SVG_MARK_LIGHT = f"""<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="14" fill="#FFFFFF"/>
  <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" stroke="#E5E5E5"/>
  <path {SVG_MARK_PATH} fill="#000000"/>
  {SVG_BARRIER_RECT} fill="#000000"/>
</svg>"""

SVG_FAVICON_ADAPTIVE = f"""<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style>
    @media (prefers-color-scheme: dark) {{
      .bg {{ fill: #080808; }}
      .border {{ stroke: #262626; }}
      .mark {{ fill: #FFFFFF; }}
    }}
    @media (prefers-color-scheme: light) {{
      .bg {{ fill: #FFFFFF; }}
      .border {{ stroke: #E5E5E5; }}
      .mark {{ fill: #000000; }}
    }}
  </style>
  <rect width="32" height="32" rx="7" class="bg"/>
  <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" class="border"/>
  <g transform="translate(0, 0) scale(0.5)">
    <path {SVG_MARK_PATH} class="mark"/>
    {SVG_BARRIER_RECT} class="mark"/>
  </g>
</svg>"""

SVG_LOGO_ADAPTIVE = f"""<svg width="250" height="48" viewBox="0 0 250 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(0, 4) scale(0.625)">
    <path {SVG_MARK_PATH} fill="currentColor"/>
    {SVG_BARRIER_RECT} fill="currentColor"/>
  </g>
  <text x="48" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Geist', 'Segoe UI', Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="-0.03em" fill="currentColor">PayPath</text>
  <rect x="150" y="16" width="92" height="18" rx="3" fill="#141414" stroke="#262626"/>
  <text x="155" y="29" font-family="'Geist Mono', Consolas, monospace" font-size="8" font-weight="600" letter-spacing="0.05em" fill="#888888">RELIABILITY LAB</text>
</svg>"""

SVG_WORDMARK = """<svg width="150" height="36" viewBox="0 0 150 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Geist', 'Segoe UI', Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="-0.04em" fill="currentColor">PayPath</text>
</svg>"""

def build_svg_assets():
    files = {
        "paypath-mark.svg": SVG_MARK_ADAPTIVE,
        "paypath-mark-dark.svg": SVG_MARK_DARK,
        "paypath-mark-light.svg": SVG_MARK_LIGHT,
        "paypath-logo.svg": SVG_LOGO_ADAPTIVE,
        "paypath-logo-dark.svg": SVG_LOGO_ADAPTIVE.replace("currentColor", "#FFFFFF"),
        "paypath-logo-light.svg": SVG_LOGO_ADAPTIVE.replace("currentColor", "#000000"),
        "paypath-wordmark.svg": SVG_WORDMARK,
        "favicon.svg": SVG_FAVICON_ADAPTIVE,
    }
    for name, content in files.items():
        with open(os.path.join(BRAND_DIR, name), "w", encoding="utf-8") as f:
            f.write(content)
        if name == "favicon.svg":
            with open(os.path.join(PUBLIC_DIR, name), "w", encoding="utf-8") as f:
                f.write(content)
            with open(os.path.join(APP_DIR, name), "w", encoding="utf-8") as f:
                f.write(content)
    print("[OK] Master vector SVG brand assets generated.")

# ---------------------------------------------------------------------------
# 2. Raster Application Icons & Multi-Resolution Favicon
# ---------------------------------------------------------------------------

def draw_concept2_mark(draw, box, fg_color):
    bx, by, bw, bh = box
    s = bw / 64.0
    
    # Forked polygon (single unified path)
    poly = [
        (bx + 8 * s, by + 28 * s),
        (bx + 20 * s, by + 28 * s),
        (bx + 32 * s, by + 14 * s),
        (bx + 54 * s, by + 14 * s),
        (bx + 54 * s, by + 24 * s),
        (bx + 46 * s, by + 24 * s),
        (bx + 46 * s, by + 22 * s),
        (bx + 33.5 * s, by + 22 * s),
        (bx + 24 * s, by + 32 * s),
        (bx + 33.5 * s, by + 42 * s),
        (bx + 41 * s, by + 42 * s),
        (bx + 41 * s, by + 50 * s),
        (bx + 32 * s, by + 50 * s),
        (bx + 20 * s, by + 36 * s),
        (bx + 8 * s, by + 36 * s),
    ]
    draw.polygon(poly, fill=fg_color)
    
    # Interception Barrier (Vertical stop guard)
    draw.rounded_rectangle([bx + 46 * s, by + 36 * s, bx + 51 * s, by + 54 * s], radius=1.5 * s, fill=fg_color)

def generate_raster_icon(size, bg_dark=True):
    ss = 4
    canvas = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    
    r = int(size * ss * 0.22)
    bg_col = (10, 10, 10, 255) if bg_dark else (255, 255, 255, 255)
    border_col = (38, 38, 38, 255) if bg_dark else (225, 225, 225, 255)
    fg_col = (250, 250, 250, 255) if bg_dark else (0, 0, 0, 255)
    
    draw.rounded_rectangle([0, 0, size * ss, size * ss], radius=r, fill=bg_col)
    draw.rounded_rectangle([0, 0, size * ss, size * ss], radius=r, outline=border_col, width=int(1.5 * ss))
    
    pad = int(size * ss * 0.16)
    box = (pad, pad, size * ss - pad * 2, size * ss - pad * 2)
    draw_concept2_mark(draw, box, fg_col)
    
    return canvas.resize((size, size), Image.Resampling.LANCZOS)

def build_icon_assets():
    img_512 = generate_raster_icon(512)
    img_192 = generate_raster_icon(192)
    img_180 = generate_raster_icon(180)
    img_48  = generate_raster_icon(48)
    img_32  = generate_raster_icon(32)
    img_16  = generate_raster_icon(16)
    
    img_512.save(os.path.join(BRAND_DIR, "paypath-icon-512.png"), "PNG")
    img_512.save(os.path.join(PUBLIC_DIR, "icon.png"), "PNG")
    img_512.save(os.path.join(APP_DIR, "icon.png"), "PNG")
    
    img_192.save(os.path.join(BRAND_DIR, "paypath-icon-192.png"), "PNG")
    img_192.save(os.path.join(PUBLIC_DIR, "icon-192.png"), "PNG")
    
    img_180.save(os.path.join(BRAND_DIR, "apple-touch-icon.png"), "PNG")
    img_180.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")
    img_180.save(os.path.join(APP_DIR, "apple-icon.png"), "PNG")
    
    img_32.save(os.path.join(PUBLIC_DIR, "icon-32.png"), "PNG")
    img_16.save(os.path.join(PUBLIC_DIR, "icon-16.png"), "PNG")
    
    for dest in [
        os.path.join(PUBLIC_DIR, "favicon.ico"),
        os.path.join(APP_DIR, "favicon.ico"),
        os.path.join(BRAND_DIR, "favicon.ico"),
    ]:
        img_48.save(dest, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
        
    print("[OK] Raster icons and multi-resolution favicon.ico generated.")

# ---------------------------------------------------------------------------
# 3. Typography and Helpers
# ---------------------------------------------------------------------------

def get_fonts(ss):
    try:
        f_brand = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", int(30 * ss))
        f_badge = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", int(10 * ss))
        f_h1 = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", int(38 * ss))
        f_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", int(15 * ss))
        f_node_num = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", int(11 * ss))
        f_node_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", int(15 * ss))
        f_node_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", int(11 * ss))
        f_badge_bold = ImageFont.truetype(r"C:\Windows\Fonts\consolab.ttf", int(10 * ss))
        f_footer = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", int(10.5 * ss))
        return {
            "brand": f_brand, "badge": f_badge, "h1": f_h1, "sub": f_sub,
            "node_num": f_node_num, "node_title": f_node_title, "node_sub": f_node_sub,
            "badge_bold": f_badge_bold, "footer": f_footer
        }
    except Exception as e:
        print(f"Font loading fallback: {e}")
        d = ImageFont.load_default()
        return {k: d for k in ["brand", "badge", "h1", "sub", "node_num", "node_title", "node_sub", "badge_bold", "footer"]}

def draw_lifecycle_hero(draw, left_x, top_y, width, height, ss, fonts, is_social=False):
    stage_gap = width / 3.0
    x_order = left_x + 30 * ss
    x_approval = left_x + 30 * ss + stage_gap * 0.95
    x_capture = left_x + 30 * ss + stage_gap * 1.95
    x_reconciled = left_x + 30 * ss + width - 70 * ss
    
    y_main = top_y + (130 * ss if not is_social else 95 * ss)
    y_invalid = y_main + (115 * ss if not is_social else 95 * ss)
    
    # Horizontal subtle guide rail extending across
    draw.line([(left_x, y_main), (x_reconciled + 45 * ss, y_main)], fill=(28, 28, 28), width=int(1.5 * ss))
    
    # Stage 1 -> Stage 2 Authoritative Path
    draw.line([(x_order, y_main), (x_approval, y_main)], fill=(225, 225, 225), width=int(3.5 * ss))
    
    # Stage 2 -> Stage 3 Authoritative Path
    draw.line([(x_approval, y_main), (x_capture, y_main)], fill=(225, 225, 225), width=int(3.5 * ss))
    
    # Stage 3 -> Stage 4 Authoritative Path
    draw.line([(x_capture, y_main), (x_reconciled, y_main)], fill=(255, 255, 255), width=int(4 * ss))
    
    # Stage 3: The Intercepted Duplicate Route
    x_diverge_start = x_capture + 65 * ss
    x_diverge_turn = x_diverge_start + 50 * ss
    x_barrier = x_diverge_turn + 55 * ss
    x_path_end = x_barrier - 14 * ss
    
    draw.line([(x_diverge_start, y_main), (x_diverge_turn, y_invalid)], fill=(120, 120, 120), width=int(3 * ss))
    draw.line([(x_diverge_turn, y_invalid), (x_path_end, y_invalid)], fill=(120, 120, 120), width=int(3 * ss))
    
    # Small dot at bifurcation point
    draw.ellipse([x_diverge_start - 3.5 * ss, y_main - 3.5 * ss, x_diverge_start + 3.5 * ss, y_main + 3.5 * ss], fill=(190, 190, 190))
    
    # Interception Barrier (Solid vertical stop block)
    b_w = 9 * ss
    b_h = 52 * ss
    draw.rounded_rectangle(
        [x_barrier, y_invalid - b_h / 2, x_barrier + b_w, y_invalid + b_h / 2],
        radius=2.5 * ss,
        fill=(245, 245, 245),
        outline=(255, 255, 255),
        width=int(1 * ss)
    )
    
    # Intercepted Label Pill
    pill_text = "INTERCEPTED // DUPLICATE DETECTED"
    pill_w = draw.textlength(pill_text, font=fonts["badge_bold"])
    pill_box = [x_barrier + b_w + 14 * ss, y_invalid - 13 * ss, x_barrier + b_w + 24 * ss + pill_w, y_invalid + 13 * ss]
    draw.rounded_rectangle(pill_box, radius=4 * ss, fill=(16, 16, 16), outline=(60, 60, 60), width=int(1 * ss))
    draw.text((x_barrier + b_w + 19 * ss, y_invalid - 6 * ss), pill_text, font=fonts["badge_bold"], fill=(235, 235, 235))
    
    # Sub-annotation under pill
    draw.text((x_barrier + b_w + 19 * ss, y_invalid + 18 * ss), "Concurrent capture arrested · Zero double-charge", font=fonts["node_sub"], fill=(140, 140, 140))
    
    # Node Indicators for the 4 Stages
    stages = [
        (x_order, y_main, "STAGE 01", "ORDER", "Payload validated\nIdempotent intent tokenized", True),
        (x_approval, y_main, "STAGE 02", "BUYER APPROVAL", "PayPal Sandbox authorization\nPayerID token issued", True),
        (x_capture, y_main, "STAGE 03", "CAPTURE", "Concurrency mutex gate\nAtomic server execution", True),
        (x_reconciled, y_main, "STAGE 04", "RECONCILIATION", "Monotonic state locked\nImmutable audit ledger", True),
    ]
    
    for sx, sy, num, title, desc, active in stages:
        tick_w = 60 * ss
        draw.line([(sx - tick_w / 2, sy - 68 * ss), (sx + tick_w / 2, sy - 68 * ss)], fill=(38, 38, 38), width=int(1 * ss))
        
        # Outer ring
        draw.ellipse([sx - 16 * ss, sy - 16 * ss, sx + 16 * ss, sy + 16 * ss], fill=(8, 8, 8), outline=(130, 130, 130), width=int(1.5 * ss))
        # Inner core
        draw.ellipse([sx - 8 * ss, sy - 8 * ss, sx + 8 * ss, sy + 8 * ss], fill=(255, 255, 255) if active else (80, 80, 80))
        
        # Text above node (centered on sx)
        num_w = draw.textlength(num, font=fonts["node_num"])
        draw.text((sx - num_w / 2, sy - 62 * ss), num, font=fonts["node_num"], fill=(135, 135, 135))
        
        title_w = draw.textlength(title, font=fonts["node_title"])
        draw.text((sx - title_w / 2, sy - 44 * ss), title, font=fonts["node_title"], fill=(255, 255, 255))
        
        # Text below node (centered on sx)
        lines = desc.split("\n")
        l1_w = draw.textlength(lines[0], font=fonts["node_sub"])
        draw.text((sx - l1_w / 2, sy + 28 * ss), lines[0], font=fonts["node_sub"], fill=(180, 180, 180))
        if len(lines) > 1:
            l2_w = draw.textlength(lines[1], font=fonts["node_sub"])
            draw.text((sx - l2_w / 2, sy + 44 * ss), lines[1], font=fonts["node_sub"], fill=(125, 125, 125))
            
    # Final settlement lock badge at Stage 04
    ver_box = [x_reconciled + 24 * ss, y_main - 13 * ss, x_reconciled + 106 * ss, y_main + 13 * ss]
    draw.rounded_rectangle(ver_box, radius=3 * ss, fill=(245, 245, 245))
    draw.text((x_reconciled + 33 * ss, y_main - 6 * ss), "VERIFIED", font=fonts["badge_bold"], fill=(0, 0, 0))

# ---------------------------------------------------------------------------
# 4. Devpost Project Thumbnail (1200x800, 3:2 landscape)
# ---------------------------------------------------------------------------

def build_devpost_thumbnail():
    W, H = 1200, 800
    ss = 2
    sw, sh = W * ss, H * ss
    img = Image.new("RGB", (sw, sh), (7, 7, 7))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts(ss)
    
    left_x = 72 * ss
    top_y = 52 * ss
    
    # 1. Header Bar
    mark_box = (left_x, top_y, 36 * ss, 36 * ss)
    draw_concept2_mark(draw, mark_box, (255, 255, 255))
    
    draw.text((left_x + 48 * ss, top_y + 2 * ss), "PayPath", font=fonts["brand"], fill=(255, 255, 255))
    
    # Lab Badge
    lab_text = "PAYMENT RELIABILITY LAB"
    pill_x = left_x + 205 * ss
    pill_y = top_y + 8 * ss
    draw.rounded_rectangle([pill_x, pill_y, pill_x + 190 * ss, pill_y + 24 * ss], radius=4 * ss, fill=(18, 18, 18), outline=(48, 48, 48), width=int(1 * ss))
    draw.text((pill_x + 12 * ss, pill_y + 5 * ss), lab_text, font=fonts["badge_bold"], fill=(160, 160, 160))
    
    # PayPal Integration Tag
    int_text = "PAYPAL ORDERS V2 RELIABILITY TEST SUITE"
    int_w = draw.textlength(int_text, font=fonts["badge"])
    draw.text((sw - left_x - int_w, top_y + 11 * ss), int_text, font=fonts["badge"], fill=(130, 130, 130))
    
    # Divider
    draw.line([(left_x, top_y + 52 * ss), (sw - left_x, top_y + 52 * ss)], fill=(24, 24, 24), width=int(1 * ss))
    
    # 2. Main Editorial Headline
    head_y = top_y + 78 * ss
    draw.text((left_x, head_y), "Payment lifecycle testing & idempotency verification.", font=fonts["h1"], fill=(255, 255, 255))
    draw.text((left_x, head_y + 50 * ss), "Intercepts duplicate captures, unsafe retries, and state drift before settlement.", font=fonts["sub"], fill=(160, 160, 160))
    
    # 3. Lifecycle Visual Hero
    hero_top = head_y + 115 * ss
    hero_w = sw - left_x * 2 - 120 * ss
    draw_lifecycle_hero(draw, left_x, hero_top, hero_w, 300 * ss, ss, fonts, is_social=False)
    
    # 4. Editorial Bottom Status Bar
    bot_y = sh - 56 * ss
    draw.line([(left_x, bot_y - 20 * ss), (sw - left_x, bot_y - 20 * ss)], fill=(24, 24, 24), width=int(1 * ss))
    
    draw.text((left_x, bot_y), "LIFECYCLE: 4/4 STAGES DETERMINISTIC", font=fonts["footer"], fill=(140, 140, 140))
    draw.text((left_x + 280 * ss, bot_y), "RACE CONDITIONS: INTERCEPTED", font=fonts["footer"], fill=(140, 140, 140))
    draw.text((left_x + 560 * ss, bot_y), "DOUBLE-CAPTURE RISK: 0.00%", font=fonts["footer"], fill=(140, 140, 140))
    
    r_text = "MONOTONIC SETTLEMENT GUARANTEED"
    r_w = draw.textlength(r_text, font=fonts["footer"])
    draw.text((sw - left_x - r_w, bot_y), r_text, font=fonts["footer"], fill=(220, 220, 220))
    
    final_img = img.resize((W, H), Image.Resampling.LANCZOS)
    out_path = os.path.join(BRAND_DIR, "paypath-devpost-thumbnail.png")
    final_img.save(out_path, "PNG", optimize=True)
    if ART_DIR:
        shutil.copyfile(out_path, os.path.join(ART_DIR, "paypath-devpost-thumbnail.png"))
        small_img = final_img.resize((300, 200), Image.Resampling.LANCZOS)
        small_img.save(os.path.join(ART_DIR, "preview_devpost_thumbnail_gallery_size.png"), "PNG", optimize=True)

    
    print(f"[OK] Devpost Thumbnail generated at: {out_path} ({W}x{H})")

# ---------------------------------------------------------------------------
# 5. Social Preview Banner (1200x630, 1.91:1 landscape)
# ---------------------------------------------------------------------------

def build_social_preview():
    W, H = 1200, 630
    ss = 2
    sw, sh = W * ss, H * ss
    img = Image.new("RGB", (sw, sh), (7, 7, 7))
    draw = ImageDraw.Draw(img)
    fonts = get_fonts(ss)
    
    left_x = 64 * ss
    top_y = 44 * ss
    
    # 1. Header Bar
    mark_box = (left_x, top_y, 32 * ss, 32 * ss)
    draw_concept2_mark(draw, mark_box, (255, 255, 255))
    
    draw.text((left_x + 44 * ss, top_y + 1 * ss), "PayPath", font=fonts["brand"], fill=(255, 255, 255))
    
    # Lab Badge
    lab_text = "PAYMENT RELIABILITY LAB"
    pill_x = left_x + 195 * ss
    pill_y = top_y + 6 * ss
    draw.rounded_rectangle([pill_x, pill_y, pill_x + 185 * ss, pill_y + 22 * ss], radius=4 * ss, fill=(18, 18, 18), outline=(48, 48, 48), width=int(1 * ss))
    draw.text((pill_x + 12 * ss, pill_y + 4 * ss), lab_text, font=fonts["badge_bold"], fill=(160, 160, 160))
    
    # Right Meta
    meta_text = "PAYPAL ORDERS V2 RELIABILITY LAB"
    meta_w = draw.textlength(meta_text, font=fonts["badge"])
    draw.text((sw - left_x - meta_w, top_y + 9 * ss), meta_text, font=fonts["badge"], fill=(120, 120, 120))
    
    # Divider
    draw.line([(left_x, top_y + 46 * ss), (sw - left_x, top_y + 46 * ss)], fill=(24, 24, 24), width=int(1 * ss))
    
    # 2. Main Headline
    head_y = top_y + 66 * ss
    draw.text((left_x, head_y), "Payment lifecycle testing & idempotency verification.", font=fonts["h1"], fill=(255, 255, 255))
    draw.text((left_x, head_y + 46 * ss), "Deterministic validation for PayPal integrations: Order -> Approval -> Capture -> Reconciliation", font=fonts["sub"], fill=(160, 160, 160))
    
    # 3. Lifecycle Visual Hero (Widened for 1.91:1)
    hero_top = head_y + 90 * ss
    hero_w = sw - left_x * 2 - 120 * ss
    draw_lifecycle_hero(draw, left_x, hero_top, hero_w, 240 * ss, ss, fonts, is_social=True)
    
    # 4. Editorial Bottom Status Bar
    bot_y = sh - 46 * ss
    draw.line([(left_x, bot_y - 16 * ss), (sw - left_x, bot_y - 16 * ss)], fill=(24, 24, 24), width=int(1 * ss))
    
    draw.text((left_x, bot_y), "DETERMINISTIC 4-STAGE LIFECYCLE", font=fonts["footer"], fill=(130, 130, 130))
    draw.text((left_x + 280 * ss, bot_y), "CONCURRENCY MUTEX LOCK", font=fonts["footer"], fill=(130, 130, 130))
    draw.text((left_x + 540 * ss, bot_y), "ZERO DOUBLE-CHARGE RISK", font=fonts["footer"], fill=(130, 130, 130))
    
    r_text = "MONOTONIC RECONCILIATION"
    r_w = draw.textlength(r_text, font=fonts["footer"])
    draw.text((sw - left_x - r_w, bot_y), r_text, font=fonts["footer"], fill=(200, 200, 200))
    
    final_img = img.resize((W, H), Image.Resampling.LANCZOS)
    out_path = os.path.join(BRAND_DIR, "paypath-social-preview.png")
    final_img.save(out_path, "PNG", optimize=True)
    if ART_DIR:
        shutil.copyfile(out_path, os.path.join(ART_DIR, "paypath-social-preview.png"))

    print(f"[OK] Social Preview generated at: {out_path} ({W}x{H})")

if __name__ == "__main__":
    print("=== Generating PayPath Brand Assets (Product-Driven Lifecycle Reset) ===")
    build_svg_assets()
    build_icon_assets()
    build_devpost_thumbnail()
    build_social_preview()
    print("=== Brand Asset Generation Complete ===")
