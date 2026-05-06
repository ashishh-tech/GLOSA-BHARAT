from PIL import Image, ImageDraw, ImageFont
import os

def create_pro_diag():
    # Setup
    width, height = 1600, 1000
    bg_color = (15, 23, 42) # Deep Slate/Navy
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Professional Palette
    colors = {
        "perception": (59, 130, 246), # Blue-500
        "logic": (16, 185, 129),      # Emerald-500
        "telemetry": (245, 158, 11),  # Amber-500
        "interface": (139, 92, 246),  # Violet-500
        "text": (248, 250, 252),
        "subtext": (148, 163, 184),
        "card_bg": (30, 41, 59)
    }
    
    # Fonts
    try:
        title_font = ImageFont.truetype("arial.ttf", 48)
        header_font = ImageFont.truetype("arial.ttf", 32)
        body_font = ImageFont.truetype("arial.ttf", 22)
        stack_font = ImageFont.truetype("arial.ttf", 18)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        stack_font = ImageFont.load_default()

    # Title
    draw.text((width//2, 70), "GLOSA-BHARAT SYSTEM ARCHITECTURE", fill=colors["text"], anchor="mm", font=title_font)
    draw.text((width//2, 120), "A Comprehensive Ecosystem for Real-time Smart Mobility", fill=colors["subtext"], anchor="mm", font=body_font)

    # Layout Config
    card_w, card_h = 320, 500
    start_x = 100
    gap = 60
    y_pos = 250

    stages = [
        {
            "id": "INGESTION",
            "title": "Perception Layer",
            "subtitle": "Edge Intelligence",
            "color": colors["perception"],
            "points": ["Live CCTV Stream", "YOLOv8 Object ID", "Queue Count Logic"],
            "stack": "Python | OpenCV | FastAI"
        },
        {
            "id": "COMPUTE",
            "title": "Advisory Engine",
            "subtitle": "The Strategy Brain",
            "color": colors["logic"],
            "points": ["Signal State Sync", "Velocity Optimization", "Wait-time Analytics"],
            "stack": "FastAPI | GLOSA Algorithm"
        },
        {
            "id": "TELEMETRY",
            "title": "Data Pipeline",
            "subtitle": "Real-time Sync",
            "color": colors["telemetry"],
            "points": ["Secured API Gateway", "Socket.io Streams", "V2I Protocol Sync"],
            "stack": "Node.js | Socket.io | JWT"
        },
        {
            "id": "DISPLAY",
            "title": "Universal UI",
            "subtitle": "The Control Room",
            "color": colors["interface"],
            "points": ["GIS Map (Leaflet)", "Driver Heads-up Feed", "Admin Metrics Panel"],
            "stack": "React | Tailwind | Framer"
        }
    ]

    for i, stage in enumerate(stages):
        x = start_x + (card_w + gap) * i
        
        # Shadow effect
        draw.rectangle([x+5, y_pos+5, x+card_w+5, y_pos+card_h+5], fill=(0,0,0,100))
        
        # Main Card
        draw.rectangle([x, y_pos, x+card_w, y_pos+card_h], fill=colors["card_bg"], outline=stage["color"], width=2)
        
        # Header Bar
        draw.rectangle([x, y_pos, x+card_w, y_pos+80], fill=stage["color"])
        draw.text((x + card_w//2, y_pos + 40), stage["title"], fill=colors["text"], anchor="mm", font=header_font)
        
        # Subtitle
        draw.text((x + 20, y_pos + 110), stage["subtitle"], fill=stage["color"], font=body_font)
        
        # Bullet Points
        current_y = y_pos + 170
        for point in stage["points"]:
            draw.text((x + 20, current_y), f"• {point}", fill=colors["text"], font=body_font)
            current_y += 45
            
        # Tech Stack Divider
        draw.line([x+20, y_pos+card_h-80, x+card_w-20, y_pos+card_h-80], fill=colors["subtext"], width=1)
        
        # Tech Stack Text
        draw.text((x + card_w//2, y_pos+card_h-45), stage["stack"], fill=colors["subtext"], anchor="mm", font=stack_font)

        # Draw connecting arrows between cards
        if i < len(stages) - 1:
            arrow_x = x + card_w + 10
            arrow_y = y_pos + card_h//2
            draw.line([arrow_x, arrow_y, arrow_x + gap - 20, arrow_y], fill=colors["subtext"], width=3)
            # Arrow head
            draw.polygon([
                (arrow_x + gap - 20, arrow_y - 10),
                (arrow_x + gap - 20, arrow_y + 10),
                (arrow_x + gap - 5, arrow_y)
            ], fill=colors["subtext"])

    # Footer
    draw.text((width//2, height - 70), "BUILT FOR AATMANIRBHAR BHARAT | HACKATHON EDITION 2026", fill=colors["subtext"], anchor="mm", font=body_font)

    img.save('GLOSA_System_Architecture_Pro.png')
    print("Professional Architecture Diagram generated successfully!")

if __name__ == "__main__":
    create_pro_diag()
