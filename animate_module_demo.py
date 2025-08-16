#!/usr/bin/env python3
"""
Module Animation Generator
Creates animated sequences from a single eurorack module image
"""

from PIL import Image, ImageDraw, ImageEnhance
import numpy as np
import os
import subprocess

def create_led_animation(base_image_path, led_positions, output_prefix):
    """
    Create blinking LED animation
    led_positions: list of (x, y, radius, color) tuples
    """
    base = Image.open(base_image_path).convert("RGBA")
    frames = []
    
    # Create 7 frames with different LED states
    led_states = [
        [],  # All off
        [0],  # First LED on
        [0, 1],  # First two on
        [0, 1, 2],  # Three on
        [1, 2],  # Middle ones
        [2],  # Last one
        []  # All off again
    ]
    
    for frame_num, active_leds in enumerate(led_states):
        frame = base.copy()
        draw = ImageDraw.Draw(frame)
        
        for i, (x, y, radius, color) in enumerate(led_positions):
            if i in active_leds:
                # Draw glowing LED
                for glow_radius in range(radius*3, radius, -2):
                    alpha = int(255 * (radius / glow_radius))
                    glow_color = (*color, alpha)
                    draw.ellipse([x-glow_radius, y-glow_radius, 
                                 x+glow_radius, y+glow_radius], 
                                fill=glow_color)
                # Bright center
                draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                           fill=(*color, 255))
            else:
                # Draw dim LED
                dim_color = tuple(c//4 for c in color)
                draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                           fill=(*dim_color, 200))
        
        frames.append(frame)
        frame.save(f"{output_prefix}_frame_{frame_num+1}.png")
    
    return frames

def create_knob_animation(base_image_path, knob_positions, output_prefix):
    """
    Create rotating knob animation
    knob_positions: list of (center_x, center_y, radius, indicator_length) tuples
    """
    base = Image.open(base_image_path).convert("RGBA")
    frames = []
    
    # 7 frames of rotation
    angles = [0, 30, 60, 90, 120, 150, 180]
    
    for frame_num, angle in enumerate(angles):
        frame = base.copy()
        draw = ImageDraw.Draw(frame)
        
        for x, y, radius, indicator_len in knob_positions:
            # Calculate indicator line position
            import math
            angle_rad = math.radians(angle - 90)  # Start from top
            end_x = x + indicator_len * math.cos(angle_rad)
            end_y = y + indicator_len * math.sin(angle_rad)
            
            # Draw indicator line
            draw.line([x, y, end_x, end_y], fill=(255, 255, 255, 255), width=3)
            draw.line([x, y, end_x, end_y], fill=(0, 0, 0, 255), width=2)
        
        frames.append(frame)
        frame.save(f"{output_prefix}_frame_{frame_num+1}.png")
    
    return frames

def create_button_animation(base_image_path, button_positions, output_prefix):
    """
    Create button press animation
    button_positions: list of (x, y, width, height) rectangles
    """
    base = Image.open(base_image_path).convert("RGBA")
    frames = []
    
    # Sequence: unpressed, press 1, press 2, both, release 2, release 1, unpressed
    button_states = [
        [],
        [0],
        [1],
        [0, 1],
        [1],
        [0],
        []
    ]
    
    for frame_num, pressed_buttons in enumerate(button_states):
        frame = base.copy()
        overlay = Image.new('RGBA', frame.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        for i, (x, y, w, h) in enumerate(button_positions):
            if i in pressed_buttons:
                # Draw pressed state (darker)
                draw.rectangle([x, y, x+w, y+h], fill=(0, 0, 0, 80))
            else:
                # Draw unpressed state (slight highlight)
                draw.rectangle([x, y, x+w, y+h], fill=(255, 255, 255, 20))
        
        frame = Image.alpha_composite(frame, overlay)
        frames.append(frame)
        frame.save(f"{output_prefix}_frame_{frame_num+1}.png")
    
    return frames

def frames_to_webp(frame_pattern, output_file, fps=10):
    """Convert frames to animated WebP"""
    cmd = [
        'ffmpeg', '-y',
        '-framerate', str(fps),
        '-i', frame_pattern,
        '-lossless', '0',
        '-q:v', '90',
        '-loop', '0',
        output_file
    ]
    subprocess.run(cmd, check=True)
    print(f"✅ Created animated WebP: {output_file}")

# Example usage
if __name__ == "__main__":
    print("🎬 Module Animation Generator")
    print("This is a demo showing what's possible!")
    print("\nExample animations we can create:")
    print("1. Blinking LEDs")
    print("2. Rotating knobs")
    print("3. Button presses")
    print("4. Screen/display changes")
    print("5. VU meters animating")
    print("6. Patch cable connections appearing")
    print("\nJust provide your PNG and describe what should animate!"