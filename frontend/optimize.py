import re

with open(r'c:\Users\User\Desktop\EarningPoint\frontend\src\components\EarningPage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
changed_count = 0
for line in lines:
    original_line = line
    if 'animate={{' in line and (('repeat: Infinity' in line) or ('repeat:Infinity' in line)):
        css_class = 'animate-pulse-glow'
        if 'y:' in line or 'translateY' in line:
            css_class = 'animate-float'
        elif 'rotate' in line and 'scale' not in line:
            css_class = 'animate-spin-slow'
        elif 'scale' in line:
            css_class = 'animate-scale-pulse'

        # Append class to className
        if 'className="' in line:
            line = re.sub(r'className="([^"]+)"', r'className="\1 ' + css_class + '"', line)
        else:
            line = line.replace('<motion.div', f'<motion.div className="{css_class}"')

        # Remove animate and transition props
        line = re.sub(r'animate=\{\{[^}]*\}\}', '', line)
        line = re.sub(r'transition=\{\{[^}]*\}\}', '', line)
        
        changed_count += 1
    new_lines.append(line)

with open(r'c:\Users\User\Desktop\EarningPoint\frontend\src\components\EarningPage.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print(f'Successfully updated {changed_count} inline continuous animations.')
