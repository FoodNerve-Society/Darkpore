import re

def replace_images():
    with open('lib/cms/food/challenges.ts', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    out_lines = []
    current_context_id = None
    context_type = None
    
    for line in lines:
        m_id = re.search(r"id:\s*'([^']+)'", line)
        if m_id:
            current_context_id = m_id.group(1)
            # Default to subcategory until proven otherwise
            context_type = 'subcategories'
            
        if 'longDesc:' in line:
            context_type = 'challenges'
            
        if 'imageUrl:' in line and current_context_id:
            # Avoid replacing unrelated images if there are any
            new_url = f"'/images/{context_type}/{current_context_id}.webp'"
            line = re.sub(r"imageUrl:\s*'[^']+'", f"imageUrl: {new_url}", line)
            
        out_lines.append(line)
        
    with open('lib/cms/food/challenges.ts', 'w', encoding='utf-8') as f:
        f.writelines(out_lines)

replace_images()
