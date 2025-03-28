#!/usr/bin/env python3
import sys
import re
import os
import shutil
from datetime import datetime
from pathlib import Path
import frontmatter
import argparse

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def convert_image_to_captioned(match):
    """Convert Obsidian image syntax to CaptionedImage component"""
    alt_text = match.group(1) or ''
    image_path = match.group(2)
    caption = alt_text or image_path.split('/')[-1].split('.')[0]

    # Convert to CaptionedImage component
    return f'<CaptionedImage\n  src={{import("../assets/blog/{image_path}")}}\n  alt="{alt_text}"\n  caption="{caption}"\n/>'

def process_markdown(content):
    """Process markdown content and convert to MDX format"""
    # Convert Obsidian image syntax to CaptionedImage component
    content = re.sub(r'!\[(.*?)\]\((.*?)\)', convert_image_to_captioned, content)
    return content

def main():
    parser = argparse.ArgumentParser(description='Convert Obsidian markdown to MDX blog post')
    parser.add_argument('input_file', help='Path to the Obsidian markdown file')
    parser.add_argument('--copy-images', action='store_true', help='Copy images to assets directory')
    args = parser.parse_args()

    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f"Error: File {input_path} does not exist")
        sys.exit(1)

    # Read and parse the markdown file
    post = frontmatter.load(input_path)

    # Ensure required frontmatter exists
    if 'title' not in post.metadata:
        print("Error: Post must have a title in frontmatter")
        sys.exit(1)

    # Create slug from title if not provided
    slug = post.metadata.get('slug', slugify(post.metadata['title']))

    # Set default metadata
    post.metadata.setdefault('pubDate', datetime.now().strftime('%Y-%m-%d'))
    post.metadata.setdefault('description', '')
    post.metadata.setdefault('draft', True)

    # Process content
    processed_content = process_markdown(post.content)

    # Prepare output paths
    output_dir = Path('src/content/post')
    output_file = output_dir / f"{slug}.mdx"

    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)

    # Write the MDX file
    with open(output_file, 'w') as f:
        f.write('---\n')
        for key, value in post.metadata.items():
            f.write(f'{key}: {value}\n')
        f.write('---\n\n')
        f.write('import { CaptionedImage } from "../components/CaptionedImage.astro";\n\n')
        f.write(processed_content)

    print(f"Created MDX file: {output_file}")

    # Copy images if requested
    if args.copy_images:
        # Find all image references in the content
        image_paths = re.findall(r'!\[.*?\]\((.*?)\)', post.content)
        assets_dir = Path('src/assets/blog')
        assets_dir.mkdir(parents=True, exist_ok=True)

        for img_path in image_paths:
            src_img = input_path.parent / img_path
            if src_img.exists():
                dst_img = assets_dir / img_path
                dst_img.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_img, dst_img)
                print(f"Copied image: {img_path}")
            else:
                print(f"Warning: Image not found: {src_img}")

if __name__ == '__main__':
    main()
