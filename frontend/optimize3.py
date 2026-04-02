import re

with open(r'c:\Users\User\Desktop\EarningPoint\frontend\src\components\EarningPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to find <motion.div ... repeat: Infinity ...> and replace it
# Since the tag could span multiple lines, we can use a callback function

def replacer(match):
    text = match.group(0)
    
    # We only replace if repeat: Infinity is in the block
    if 'repeat: Infinity' not in text and 'repeat:Infinity' not in text:
        return text

    # Determine class
    css_class = 'animate-pulse-glow'
    if 'y:' in text or 'translateY' in text:
        css_class = 'animate-float'
    elif 'rotate:' in text and 'scale:' not in text:
        css_class = 'animate-spin-slow'
    elif 'scale:' in text:
        css_class = 'animate-scale-pulse'

    # Remove animate={{...}} and transition={{...}}
    text = re.sub(r'\s*animate=\{\{.*?\}\}', '', text, flags=re.DOTALL)
    text = re.sub(r'\s*transition=\{\{.*?\}\}', '', text, flags=re.DOTALL)
    
    # Inject css class into className
    if 'className="' in text:
        text = re.sub(r'className="([^"]+)"', r'className="\1 ' + css_class + '"', text)
    else:
        # Add className right after motion.div
        text = text.replace('<motion.div', f'<motion.div className="{css_class}"', 1)

    return text

# Find all <motion.div> (or other motion tags if applicable) up to the closing >
new_content, count = re.subn(r'<motion\.div[^>]+>', replacer, content)

with open(r'c:\Users\User\Desktop\EarningPoint\frontend\src\components\EarningPage.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully processed {count} motion.div tags with new multi-line parsing.")
