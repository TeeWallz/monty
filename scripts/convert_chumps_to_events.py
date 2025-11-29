
chump_dir = "/workspaces/monty/src/content/chumps"
event_dir = "/workspaces/monty/src/content/events"

# chump schema
# ---
# name: Tour Bus
# slug: tour-bus
# date: 2016-02-22
# thanks:
# url: https://web.archive.org/web/20160222023507/http://www.abc.net.au/news/2016-02-22/passengers-rescued-after-bus-crashes-into-melbourne-overpass/7188800
# image: /images/chumps/2016-02-22.jpg
# ---

# event schema
# ---
# title: Test Chump
# date: 2025-11-03
# event_type: Chump
# slug: yeet
# thanks: temp
# media:
#   - caption: main img
#     ismain: true
#     image: /2025-05-09.png
#     body: |-
#       ```
#       This is some
#       <code>
#       ```
#   - caption: Second img
#     ismain: false
#     image: /2025-06-30-1.png
#     body: yee
# ---
# # This is a body

# haha

import os
import shutil
import yaml
from datetime import datetime

def convert_chumps_to_events():
    for filename in os.listdir(chump_dir):
        if filename.endswith(".md"):
            chump_path = os.path.join(chump_dir, filename)
            with open(chump_path, 'r') as file:
                content = file.read()
                print(content)
            
            # Split frontmatter and body
            if content.startswith('---'):
                parts = content.split('---', 2)
                frontmatter = parts[1]
                body = parts[2].strip()
                
                # Parse frontmatter
                data = yaml.safe_load(frontmatter)
                
                # Create new event frontmatter
                print(data.get('date'))
                event_data = {
                    'title': data.get('name', 'Untitled Event'),
                    'date': data.get('date'),
                    'event_type': 'Chump',
                    'slug': data.get('date').strftime('%Y-%m-%d') + '_' + data.get('slug', filename[:-3]),
                    'thanks': '' if data.get('thanks', '') is None else data.get('thanks', ''),
                    'media': []
                }
                
                if 'image' in data:
                    event_data['media'].append({
                        'caption': '',
                        'ismain': True,
                        'image': data['image'],
                        'body': data['url']
                    })
                
                # Create new event content
                new_frontmatter = yaml.dump(event_data, sort_keys=False)
                new_content = f"---\n{new_frontmatter}---\n{body}\n"
                
                # Write to new event file
                event_filename = f"{data.get('date')}-{data.get('slug', filename[:-3])}.md"
                event_path = os.path.join(event_dir, event_filename)
                with open(event_path, 'w') as new_file:
                    new_file.write(new_content)
                
                print(f"Converted {filename} to {event_filename}")
convert_chumps_to_events()