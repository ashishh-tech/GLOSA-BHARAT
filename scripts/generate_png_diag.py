from PIL import Image, ImageDraw, ImageFont
import os

def create_diag():
    # Setup
    width, height = 1400, 900
    bg_color = (15, 23, 42) # Dark Navy
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Layer Definitions
    layers = [
        {"name": "LAYER 1: PERCEPTION", "tech": "Python, OpenCV, YOLOv8", "color": (19, 136, 8)},   # Green
        {"name": "LAYER 2: ORCHESTRATION", "tech": "Node.js, Express, Axios", "color": (0, 0, 128)}, # Navy
        {"name": "LAYER 3: ANALYTICAL", "tech": "GLOSA Algorithm, Predictor", "color": (255, 153, 51)}, # Saffron
        {"name": "LAYER 4: INTERACTION", "tech": "React, Leaflet, WebSockets", "color": (37, 99, 235)} # Blue
    ]
    
    box_w, box_h = 1000, 140
    start_x = (width - box_w) // 2
    padding = 60
    
    # Fonts
    try:
        title_font = ImageFont.truetype("arial.ttf", 40)
        main_font = ImageFont.truetype("arial.ttf", 32)
        tech_font = ImageFont.truetype("arial.ttf", 24)
    except:
        title_font = ImageFont.load_default()
        main_font = ImageFont.load_default()
        tech_font = ImageFont.load_default()

    # Title
    draw.text((width//2, 50), "GLOSA-BHARAT SYSTEM ARCHITECTURE", fill=(255, 255, 255), anchor="mm", font=title_font)
    
    current_y = 150
    for i, layer in enumerate(layers):
        # Draw Box
        rect_coords = [start_x, current_y, start_x + box_w, current_y + box_h]
        draw.rectangle(rect_coords, fill=layer['color'], outline=(255, 255, 255), width=2)
        
        # Draw Text
        draw.text((start_x + 40, current_y + 35), layer['name'], fill=(255, 255, 255), font=main_font)
        draw.text((start_x + 40, current_y + 85), f"Tech: {layer['tech']}", fill=(255, 255, 255), font=tech_font)
        
        # Draw Arrow
        if i < len(layers) - 1:
            arrow_start = (width // 2, current_y + box_h)
            arrow_end = (width // 2, current_y + box_h + padding)
            draw.line([arrow_start, (arrow_start[0], arrow_end[1])], fill=(255, 255, 255), width=5)
            # Simple arrow head
            draw.polygon([
                (width//2 - 20, arrow_end[1] - 10),
                (width//2 + 20, arrow_end[1] - 10),
                (width//2, arrow_end[1] + 10)
            ], fill=(255, 255, 255))

        current_y += box_h + padding

    # Info footer
    draw.text((width//2, height - 40), "Generated for Aatmanirbhar Bharat AI Seminar 2026", fill=(200, 200, 200), anchor="mm", font=tech_font)

    img.save('GLOSA_Architecture_Diagram.png')
    print("PNG Diagram generated successfully!")

if __name__ == "__main__":
    create_diag()
