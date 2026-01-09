#!/usr/bin/env python3
"""
Render a Screeps room JSON file as ASCII or image.

Usage:
    python render_room.py room.E49S55.json
    python render_room.py room.E49S55.json --png output.png
"""

import json
import sys
import argparse

# Characters for rendering
CHARS = {
    'plain': '.',
    'wall': '█',
    'swamp': '~',
    'spawn': 'S',
    'source': '⚡',
    'controller': 'C',
    'mineral': 'M',
    'creep': '@',
}

# ANSI colors
COLORS = {
    'plain': '\033[90m',      # dark gray
    'wall': '\033[37m',       # white
    'swamp': '\033[32m',      # green
    'spawn': '\033[93m',      # yellow
    'source': '\033[93m',     # yellow
    'controller': '\033[96m', # cyan
    'mineral': '\033[95m',    # magenta
    'creep': '\033[91m',      # red
    'reset': '\033[0m',
}


def load_room(filepath):
    with open(filepath, 'r') as f:
        return json.load(f)


def create_grid(data):
    """Create a 50x50 grid with terrain and objects."""
    grid = [['plain' for _ in range(50)] for _ in range(50)]
    labels = [[None for _ in range(50)] for _ in range(50)]

    # Add walls
    for x, y in data.get('walls', []):
        grid[y][x] = 'wall'

    # Add swamps
    for x, y in data.get('swamps', []):
        grid[y][x] = 'swamp'

    # Add structures
    for struct in data.get('structures', []):
        x, y = struct['x'], struct['y']
        if struct['type'] == 'spawn':
            grid[y][x] = 'spawn'
            labels[y][x] = struct.get('id', '')[:4]
        elif struct['type'] == 'controller':
            grid[y][x] = 'controller'

    # Add sources
    for i, source in enumerate(data.get('sources', [])):
        x, y = source['x'], source['y']
        grid[y][x] = 'source'
        labels[y][x] = f'S{i}'

    # Add controller (if not in structures)
    ctrl = data.get('controller')
    if ctrl and grid[ctrl['y']][ctrl['x']] == 'plain':
        grid[ctrl['y']][ctrl['x']] = 'controller'
        labels[ctrl['y']][ctrl['x']] = f"L{ctrl.get('level', '?')}"

    # Add mineral
    mineral = data.get('mineral')
    if mineral:
        grid[mineral['y']][mineral['x']] = 'mineral'
        labels[mineral['y']][mineral['x']] = mineral.get('type', 'M')

    # Add creeps
    for creep in data.get('creeps', []):
        x, y = creep['x'], creep['y']
        grid[y][x] = 'creep'
        labels[y][x] = creep['name'][:1]

    return grid, labels


def render_ascii(grid, labels, color=True, square=True):
    """Render grid as ASCII with optional ANSI colors."""
    lines = []

    # Use double-width for square pixels in terminal
    space = ' ' if square else ''

    # Header with x coordinates
    if square:
        header = '     ' + ''.join(f'{x:<2d}' if x % 5 == 0 else '  ' for x in range(50))
    else:
        header = '    ' + ''.join(f'{x:1d}' if x % 10 == 0 else ' ' for x in range(50))
    lines.append(header)

    for y in range(50):
        row = f'{y:2d}  '
        for x in range(50):
            cell_type = grid[y][x]
            char = CHARS[cell_type]

            if color:
                row += COLORS[cell_type] + char + space + COLORS['reset']
            else:
                row += char + space

        lines.append(row)

    return '\n'.join(lines)


def render_legend(data):
    """Render a legend with key positions."""
    lines = ['\n=== LEGEND ===']
    lines.append(f"Room: {data.get('room', 'unknown')}")

    # Spawn
    spawn = data.get('spawn')
    if spawn:
        lines.append(f"Spawn: ({spawn['x']}, {spawn['y']})")

    # Sources
    for i, src in enumerate(data.get('sources', [])):
        lines.append(f"Source {i}: ({src['x']}, {src['y']}) id={src['id'][:8]}...")

    # Controller
    ctrl = data.get('controller')
    if ctrl:
        lines.append(f"Controller: ({ctrl['x']}, {ctrl['y']}) L{ctrl.get('level', '?')}")

    # Mineral
    mineral = data.get('mineral')
    if mineral:
        lines.append(f"Mineral: ({mineral['x']}, {mineral['y']}) {mineral.get('type', '?')}")

    # Creeps
    creeps = data.get('creeps', [])
    if creeps:
        lines.append(f"Creeps: {len(creeps)}")
        for c in creeps:
            lines.append(f"  {c['name']}: ({c['x']}, {c['y']}) {c.get('role', '')}")

    return '\n'.join(lines)


def save_png(grid, labels, data, filepath):
    """Save grid as PNG image using matplotlib."""
    try:
        import matplotlib.pyplot as plt
        import matplotlib.patches as mpatches
        import numpy as np
    except ImportError:
        print("Error: matplotlib required for PNG output. Install with: pip install matplotlib")
        sys.exit(1)

    # Create color map
    color_map = {
        'plain': [0.2, 0.2, 0.2],
        'wall': [0.1, 0.1, 0.1],
        'swamp': [0.2, 0.4, 0.2],
        'spawn': [1.0, 0.8, 0.0],
        'source': [1.0, 1.0, 0.0],
        'controller': [0.0, 0.8, 1.0],
        'mineral': [0.8, 0.2, 0.8],
        'creep': [1.0, 0.2, 0.2],
    }

    img = np.zeros((50, 50, 3))
    for y in range(50):
        for x in range(50):
            img[y][x] = color_map[grid[y][x]]

    fig, ax = plt.subplots(figsize=(12, 12))
    ax.imshow(img, interpolation='nearest')
    ax.set_title(f"Room {data.get('room', 'unknown')}")
    ax.set_xlabel('X')
    ax.set_ylabel('Y')

    # Add grid
    ax.set_xticks(range(0, 50, 5))
    ax.set_yticks(range(0, 50, 5))
    ax.grid(True, alpha=0.3)

    # Add labels for key objects
    for src in data.get('sources', []):
        ax.annotate('⚡', (src['x'], src['y']), color='white', ha='center', va='center', fontsize=12)

    spawn = data.get('spawn')
    if spawn:
        ax.annotate('S', (spawn['x'], spawn['y']), color='black', ha='center', va='center', fontsize=10, fontweight='bold')

    ctrl = data.get('controller')
    if ctrl:
        ax.annotate('C', (ctrl['x'], ctrl['y']), color='white', ha='center', va='center', fontsize=10, fontweight='bold')

    plt.savefig(filepath, dpi=150, bbox_inches='tight')
    print(f"Saved to {filepath}")


def main():
    parser = argparse.ArgumentParser(description='Render Screeps room JSON')
    parser.add_argument('file', help='Room JSON file')
    parser.add_argument('--png', help='Save as PNG image')
    parser.add_argument('--no-color', action='store_true', help='Disable ANSI colors')
    parser.add_argument('--compact', action='store_true', help='Compact ASCII (not square)')
    args = parser.parse_args()

    data = load_room(args.file)
    grid, labels = create_grid(data)

    if args.png:
        save_png(grid, labels, data, args.png)
    else:
        print(render_ascii(grid, labels, color=not args.no_color, square=not args.compact))
        print(render_legend(data))


if __name__ == '__main__':
    main()
