import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_yt_clickable_thumbnail():
    # Load base thumbnail if exists, else create
    base_path = "media/devpost/paypath-demo-thumbnail.png"
    if os.path.exists(base_path):
        im = Image.open(base_path).convert("RGBA")
    else:
        im = Image.new("RGBA", (1280, 720), (10, 10, 14, 255))
    
    w, h = im.size
    
    # Create overlay for play button and glow
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    cx, cy = w // 2, h // 2
    
    # Outer dark glow / shadow behind play button
    glow_box = [cx - 80, cy - 55, cx + 80, cy + 55]
    for r in range(15, 0, -3):
        alpha = int(40 * (1 - r / 15))
        draw.rounded_rectangle([cx - 65 - r, cy - 45 - r, cx + 65 + r, cy + 45 + r], radius=24 + r, fill=(0, 0, 0, alpha))
    
    # YouTube Red Play Button (Standard YouTube Red: #FF0000 / rgba(255, 0, 0, 240))
    btn_w, btn_h = 110, 74
    btn_box = [cx - btn_w // 2, cy - btn_h // 2, cx + btn_w // 2, cy + btn_h // 2]
    draw.rounded_rectangle(btn_box, radius=20, fill=(255, 0, 0, 235), outline=(255, 255, 255, 180), width=2)
    
    # White Play Triangle in center (pointing right)
    tri_w = 26
    tri_h = 32
    tri_x = cx - 8
    tri_pts = [
        (tri_x, cy - tri_h // 2),
        (tri_x + tri_w, cy),
        (tri_x, cy + tri_h // 2)
    ]
    draw.polygon(tri_pts, fill=(255, 255, 255, 255))
    
    # YouTube badge / pill below or next to button
    try:
        font_pill = ImageFont.truetype("arialbd.ttf", 15)
        font_sub = ImageFont.truetype("arial.ttf", 13)
    except:
        font_pill = font_sub = ImageFont.load_default()
        
    pill_text = "Watch on YouTube  •  2:41 Full HD"
    # Measure text
    bbox = draw.textbbox((0, 0), pill_text, font=font_pill)
    pw = bbox[2] - bbox[0] + 32
    ph = 32
    py = cy + btn_h // 2 + 20
    
    draw.rounded_rectangle([cx - pw // 2, py, cx + pw // 2, py + ph], radius=16, fill=(15, 15, 20, 220), outline=(60, 60, 75, 200), width=1)
    draw.text((cx - (bbox[2] - bbox[0]) // 2, py + 7), pill_text, fill=(255, 255, 255, 240), font=font_pill)

    # Composite
    final_img = Image.alpha_composite(im, overlay).convert("RGB")
    
    out_dir = "media/devpost"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "paypath-demo-thumbnail.png")
    final_img.save(out_path, quality=95)
    print(f"Successfully generated YouTube preview thumbnail at {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    create_yt_clickable_thumbnail()
