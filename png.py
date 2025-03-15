import os
from PIL import Image

def convert_images_to_png(folder_path):
    # Create a directory for converted images
    output_folder = os.path.join(folder_path, 'converted_png')
    os.makedirs(output_folder, exist_ok=True)

    # Supported image formats
    supported_formats = ('.jpg', '.jpeg', '.bmp', '.gif', '.tiff', '.webp')

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(supported_formats):
            try:
                img_path = os.path.join(folder_path, filename)
                with Image.open(img_path) as img:
                    # Convert to RGB if necessary
                    if img.mode in ("RGBA", "P", "L"):
                        img = img.convert("RGB")
                    png_filename = os.path.splitext(filename)[0] + '.png'
                    png_path = os.path.join(output_folder, png_filename)
                    img.save(png_path, 'PNG')
                    print(f"Converted {filename} to {png_filename}")
            except Exception as e:
                print(f"Failed to convert {filename}: {e}")

    print("Conversion completed.")

folder = r'C:\Users\Ali\Downloads\pet-shelter\static\pics'
convert_images_to_png(folder)
