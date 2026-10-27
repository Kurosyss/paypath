from PIL import Image, ImageDraw, ImageFont
import urllib.request
import os

user_img_path = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\312c0b5a-ad6a-48cb-ad81-1e5465099a61\.user_uploaded\media_1793126149788.png"

def get_base_frame():
    yt_frame_path = "media/devpost/yt_frame_1080.jpg"
    if not os.path.exists(yt_frame_path):
        url = "https://img.youtube.com/vi/LPS2AAMqVgk/maxresdefault.jpg"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(yt_frame_path, "wb") as f:
            f.write(resp.read())
    return Image.open(yt_frame_path).convert("RGBA")

def build_authentic_youtube_embed_card():
    # 1. Base 1080p frame (1920x1080)
    base = get_base_frame()
    w, h = base.size # 1920, 1080

    # 2. Add realistic top and bottom vignette (YouTube standard)
    vignette = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    
    # Top gradient for title
    for y in range(160):
        alpha = int(190 * (1 - y / 160) ** 1.3)
        vdraw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
        
    # Bottom gradient for controls
    for y in range(h - 130, h):
        progress = (y - (h - 130)) / 130
        alpha = int(180 * progress ** 1.3)
        vdraw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))
        
    base = Image.alpha_composite(base, vignette)

    # 3. Extract channel avatar from user's image
    user_img = Image.open(user_img_path).convert("RGBA")
    # In user_img (597x332), avatar is at approx x: 34, y: 16, w: 48, h: 48
    avatar_crop = user_img.crop((34, 16, 82, 64))
    # Resize avatar to 76x76 for 1080p
    avatar = avatar_crop.resize((76, 76), Image.Resampling.LANCZOS)
    
    # Make avatar circular
    mask = Image.new("L", (76, 76), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.ellipse((0, 0, 76, 76), fill=255)
    
    # Paste avatar
    av_x, av_y = 60, 40
    base.paste(avatar, (av_x, av_y), mask)

    # 4. Title & Channel name
    draw = ImageDraw.Draw(base)
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 34)
        font_sub = ImageFont.truetype("arial.ttf", 24)
    except:
        font_title = font_sub = ImageFont.load_default()

    draw.text((av_x + 96, av_y + 4), "PayPath — AI-Powered Payment Reliability & Autonomous Repair Demo", fill=(255, 255, 255), font=font_title)
    draw.text((av_x + 96, av_y + 44), "Kuro-sys", fill=(210, 210, 210), font=font_sub)

    # 5. Extract genuine YouTube Red Play Button from user's image
    # In user_img (597x332), play button is at approx center: x: 254 to 338, y: 130 to 188
    btn_crop = user_img.crop((254, 131, 338, 187))
    btn_resized = btn_crop.resize((150, 100), Image.Resampling.LANCZOS)
    btn_x = (w - 150) // 2
    btn_y = (h - 100) // 2
    base.paste(btn_resized, (btn_x, btn_y), btn_resized)

    # 6. Extract Bottom Left Icons (Share + Watch Later)
    bottom_left_crop = user_img.crop((50, 260, 146, 300))
    bl_w, bl_h = bottom_left_crop.size
    bl_resized = bottom_left_crop.resize((int(bl_w * 1.5), int(bl_h * 1.5)), Image.Resampling.LANCZOS)
    base.paste(bl_resized, (60, h - 80), bl_resized)

    # 7. Extract Bottom Right 'Watch on YouTube' badge
    bottom_right_crop = user_img.crop((320, 260, 526, 300))
    br_w, br_h = bottom_right_crop.size
    br_resized = bottom_right_crop.resize((int(br_w * 1.5), int(br_h * 1.5)), Image.Resampling.LANCZOS)
    base.paste(br_resized, (w - br_resized.width - 60, h - 80), br_resized)

    # Convert to RGB and save
    out_img = base.convert("RGB")
    out_path = "media/devpost/paypath-demo-thumbnail.png"
    out_img.save(out_path, quality=95)
    out_img.save("public/brand/paypath-demo-thumbnail.png", quality=95)
    print(f"Generated authentic YouTube player card at: {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    build_authentic_youtube_embed_card()
