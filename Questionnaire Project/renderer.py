import os
import subprocess

def render_mermaid_to_png(mermaid_code: str, output_dir: str, diagram_index: int) -> str:
    """
    Saves the given mermaid code to a .mmd file and renders it to a PNG.

    Args:
        mermaid_code (str): The Mermaid.js code block
        output_dir (str): Directory to store output files
        diagram_index (int): Diagram number to generate filenames

    Returns:
        str: Path to the generated PNG file, or None if failed
    """
    try:
        os.makedirs(output_dir, exist_ok=True)

        mmd_path = os.path.join(output_dir, f"diagram_{diagram_index}.mmd")
        png_path = os.path.join(output_dir, f"diagram_{diagram_index}.png")

        # 👇 Use full path to mmdc.cmd (update if installed elsewhere)
        mmdc_executable = r"C:\Users\BF493ZC\AppData\Roaming\npm\mmdc.cmd"

        with open(mmd_path, "w", encoding="utf-8") as f:
            f.write(mermaid_code)

        subprocess.run([
            mmdc_executable,
            "-i", mmd_path,
            "-o", png_path,
            "--puppeteerConfigFile", "puppeteer-config.json"
        ], check=True)

        return png_path

    except Exception as e:
        print(f"⚠️ Failed to render Mermaid diagram {diagram_index}: {e}")
        return None
