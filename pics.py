import os
from PIL import Image

def rename_and_convert_images(folder_path):
    # List and filter image files with common formats
    image_files = [f for f in os.listdir(folder_path) 
                   if os.path.isfile(os.path.join(folder_path, f)) and 
                   f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif'))]

    # Sort images in ascending order
    image_files.sort()

    # Rename and convert images starting from 0
    for index, filename in enumerate(image_files):
        old_path = os.path.join(folder_path, filename)
        new_name = f"{index}.png"
        new_path = os.path.join(folder_path, new_name)

        try:
            # Convert and save image as PNG
            with Image.open(old_path) as img:
                img.convert("RGBA").save(new_path, "PNG")
            print(f"Converted and renamed: {filename} -> {new_name}")

            # Remove the old file if it was in a different format
            if not filename.lower().endswith('.png'):
                os.remove(old_path)
        except Exception as e:
            print(f"Failed to process {filename}: {e}")

# Example usage
rename_and_convert_images(r'C:\Users\Ali\Downloads\pet-shelter\static\pics\pics')
