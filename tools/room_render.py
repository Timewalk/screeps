#!/usr/bin/env python3
"""
Screeps Room Renderer
Fetches room terrain from Screeps API and renders it using matplotlib.
"""

import requests
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import ListedColormap
import argparse
import json
import os

# Terrain types
PLAIN = 0
WALL = 1
SWAMP = 2

# Colors
COLORS = {
    PLAIN: '#2b2b2b',    # dark gray
    WALL: '#111111',     # black
    SWAMP: '#3d4c29',    # swamp green
}

def load_credentials():
    """Load Screeps credentials from .screeps.json"""
    cred_paths = [
        os.path.join(os.path.dirname(__file__), '..', '.screeps.json'),
        os.path.expanduser('~/.screeps.json'),
    ]
    for path in cred_paths:
        if os.path.exists(path):
            with open(path) as f:
                return json.load(f)
    return None

def fetch_terrain(room: str, shard: str = 'shard3') -> str:
    """Fetch terrain data from Screeps API."""
    url = f'https://screeps.com/api/game/room-terrain?room={room}&shard={shard}&encoded=false'
    response = requests.get(url)
    data = response.json()

    if data.get('ok') != 1:
        raise Exception(f"API error: {data}")

    return data['terrain'][0]['terrain']

def fetch_room_objects(room: str, shard: str = 'shard3') -> list:
    """Fetch room objects (structures, construction sites) from Screeps API."""
    creds = load_credentials()
    if not creds or 'token' not in creds:
        print("Warning: No credentials found, cannot fetch room objects")
        return []

    url = f'https://screeps.com/api/game/room-objects?room={room}&shard={shard}'
    headers = {'X-Token': creds['token']}
    response = requests.get(url, headers=headers)
    data = response.json()

    if data.get('ok') != 1:
        print(f"Warning: Could not fetch room objects: {data}")
        return []

    return data.get('objects', [])

def parse_terrain(terrain_str: str) -> np.ndarray:
    """Parse terrain string into 50x50 numpy array."""
    grid = np.zeros((50, 50), dtype=int)
    for i, char in enumerate(terrain_str):
        x = i % 50
        y = i // 50
        grid[y, x] = int(char)
    return grid

def render_room(room: str, shard: str = 'shard3',
                structures: dict = None, save_path: str = None,
                fetch_objects: bool = False):
    """Render room terrain with optional structures overlay."""

    # Fetch and parse terrain
    print(f"Fetching terrain for {room} on {shard}...")
    terrain_str = fetch_terrain(room, shard)
    grid = parse_terrain(terrain_str)

    # Fetch room objects if requested
    room_objects = []
    if fetch_objects:
        print(f"Fetching room objects...")
        room_objects = fetch_room_objects(room, shard)

    # Create figure
    fig, ax = plt.subplots(1, 1, figsize=(12, 12))

    # Create colormap
    cmap = ListedColormap([COLORS[PLAIN], COLORS[WALL], COLORS[SWAMP]])

    # Plot terrain
    ax.imshow(grid, cmap=cmap, origin='upper', extent=[0, 50, 50, 0])

    # Add structures if provided
    if structures:
        # Spawn - red circle
        if 'spawn' in structures:
            s = structures['spawn']
            ax.plot(s['x'] + 0.5, s['y'] + 0.5, 'o', color='#f04040',
                   markersize=15, label='Spawn')
            ax.annotate('Spawn', (s['x'] + 0.5, s['y'] - 0.5),
                       color='white', fontsize=8, ha='center')

        # Controller - white diamond
        if 'controller' in structures:
            c = structures['controller']
            ax.plot(c['x'] + 0.5, c['y'] + 0.5, 'D', color='#ffffff',
                   markersize=12, label='Controller')
            ax.annotate('Controller', (c['x'] + 0.5, c['y'] - 0.5),
                       color='white', fontsize=8, ha='center')

        # Sources - yellow circles
        if 'sources' in structures:
            for i, src in enumerate(structures['sources']):
                ax.plot(src['x'] + 0.5, src['y'] + 0.5, 'o', color='#ffff00',
                       markersize=12, label='Source' if i == 0 else '')
                ax.annotate(f"Source", (src['x'] + 0.5, src['y'] - 0.5),
                           color='yellow', fontsize=8, ha='center')

        # Roads from JSON - gray dots
        if 'roads' in structures and structures['roads']:
            for road in structures['roads']:
                if isinstance(road, list):
                    ax.plot(road[0] + 0.5, road[1] + 0.5, 's',
                           color='#808080', markersize=4)

    # Render room objects from API
    if room_objects:
        for obj in room_objects:
            obj_type = obj.get('type')
            x = obj.get('x', 0)
            y = obj.get('y', 0)

            if obj_type == 'road':
                ax.plot(x + 0.5, y + 0.5, 's', color='#808080', markersize=6)
            elif obj_type == 'constructionSite':
                struct_type = obj.get('structureType', '')
                if struct_type == 'road':
                    ax.plot(x + 0.5, y + 0.5, 's', color='#808080',
                           markersize=6, alpha=0.5, markeredgecolor='white', markeredgewidth=1)
                elif struct_type == 'extension':
                    ax.plot(x + 0.5, y + 0.5, 'o', color='#ffaa00',
                           markersize=8, alpha=0.5, markeredgecolor='white', markeredgewidth=1)
                elif struct_type == 'container':
                    ax.plot(x + 0.5, y + 0.5, 's', color='#aa8844',
                           markersize=8, alpha=0.5, markeredgecolor='white', markeredgewidth=1)
                else:
                    ax.plot(x + 0.5, y + 0.5, 'x', color='#ffffff',
                           markersize=6, alpha=0.5)
            elif obj_type == 'extension':
                ax.plot(x + 0.5, y + 0.5, 'o', color='#ffaa00', markersize=8)
            elif obj_type == 'container':
                ax.plot(x + 0.5, y + 0.5, 's', color='#aa8844', markersize=8)
            elif obj_type == 'creep':
                ax.plot(x + 0.5, y + 0.5, 'o', color='#00ff00', markersize=10,
                       markeredgecolor='white', markeredgewidth=1)
                name = obj.get('name', '')
                if name:
                    ax.annotate(name, (x + 0.5, y - 0.3), color='lime',
                               fontsize=7, ha='center')

    # Grid lines
    ax.set_xticks(range(0, 51, 5))
    ax.set_yticks(range(0, 51, 5))
    ax.grid(True, alpha=0.3, color='white', linewidth=0.5)

    # Minor ticks for each tile
    ax.set_xticks(range(50), minor=True)
    ax.set_yticks(range(50), minor=True)
    ax.grid(True, which='minor', alpha=0.1, color='white', linewidth=0.2)

    # Labels
    ax.set_xlabel('X', color='white')
    ax.set_ylabel('Y', color='white')
    ax.set_title(f'Room {room} ({shard})', color='white', fontsize=14)

    # Style
    ax.set_facecolor('#1a1a1a')
    fig.patch.set_facecolor('#1a1a1a')
    ax.tick_params(colors='white')

    # Legend
    legend_elements = [
        mpatches.Patch(facecolor=COLORS[PLAIN], label='Plain'),
        mpatches.Patch(facecolor=COLORS[WALL], label='Wall'),
        mpatches.Patch(facecolor=COLORS[SWAMP], label='Swamp'),
    ]
    ax.legend(handles=legend_elements, loc='upper right',
             facecolor='#333333', labelcolor='white')

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, facecolor='#1a1a1a')
        print(f"Saved to {save_path}")
    else:
        plt.show()

def main():
    parser = argparse.ArgumentParser(description='Render Screeps room terrain')
    parser.add_argument('room', help='Room name (e.g., E48S56)')
    parser.add_argument('--shard', default='shard3', help='Shard name')
    parser.add_argument('--json', help='Path to room JSON with structures')
    parser.add_argument('--save', help='Save image to path')
    parser.add_argument('--fetch', action='store_true',
                       help='Fetch room objects from API (requires .screeps.json)')

    args = parser.parse_args()

    structures = None
    if args.json:
        with open(args.json) as f:
            structures = json.load(f)

    render_room(args.room, args.shard, structures, args.save, args.fetch)

if __name__ == '__main__':
    main()
