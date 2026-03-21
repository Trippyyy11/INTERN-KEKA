import sys

filepath = r'd:\Miscs\TP\INTERN-KEKA\INTERN KEKA\frontend\src\components\Dashboard.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update handleClickOutside
old_click_handler = '''        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };'''

new_click_handler = '''        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target) && !event.target.closest('#notification-panel')) {
                setShowNotifications(false);
            }
        };'''

content = content.replace(old_click_handler, new_click_handler)

# 2. Move Notification Drawer
# It starts at "{showNotifications && (\n                                <div className=\"panel\""
# and ends right before "</div>\n                        <div ref={profileDropdownRef}"

panel_start = content.find('{showNotifications && (\n                                <div className="panel"')
if panel_start == -1:
    print("Could not find panel start")
    sys.exit(1)

# Find the end of the panel block by looking for the next sibling (profileDropdownRef)
panel_end_marker = '}\n                        </div>\n                        <div ref={profileDropdownRef}'
panel_end = content.find(panel_end_marker, panel_start)

if panel_end == -1:
    print("Could not find panel end")
    sys.exit(1)

# The block to extract is from panel_start to panel_end + 1 (to grab the `}`)
extracted_panel = content[panel_start:panel_end+1]

# Remove the extracted panel from its original location
content = content[:panel_start] + content[panel_end+1:]

# Add id="notification-panel" to the panel div
extracted_panel = extracted_panel.replace('<div className="panel" style={{', '<div id="notification-panel" className="panel" style={{', 1)

# Inject the extracted panel at the end of the return statement before the final closing div
inject_marker = '        </div >\n    );\n}'
inject_idx = content.find(inject_marker)

if inject_idx == -1:
    print("Could not find inject marker")
    sys.exit(1)

new_content = content[:inject_idx] + extracted_panel + '\n' + content[inject_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patch applied successfully")
