#!/usr/bin/env python3
"""
Screeps Economy Calculator

Pulls live room data and calculates energy production vs consumption.
Uses static game constants + live creep/structure data.
"""

import requests
import json
import os
import argparse
from collections import defaultdict

# === GAME CONSTANTS ===

# Body part costs
BODY_COSTS = {
    'work': 100,
    'carry': 50,
    'move': 50,
    'attack': 80,
    'ranged_attack': 150,
    'heal': 250,
    'tough': 10,
    'claim': 600,
}

# Creep lifespan
CREEP_LIFESPAN = 1500  # ticks

# Energy rates per WORK part per tick
WORK_RATES = {
    'harvest': 2,      # produces 2 energy/tick
    'upgrade': 1,      # consumes 1 energy/tick
    'build': 5,        # consumes 5 energy/tick
    'repair': 1,       # consumes 1 energy/tick (repairs 100 hits)
    'dismantle': -0.25,  # returns 0.25 energy/tick
}

# Structure decay rates (hits lost per tick)
# Repair cost: 1 energy = 100 hits
STRUCTURE_DECAY = {
    'road_plain': 100 / 1000,      # 0.1 hits/tick
    'road_swamp': 500 / 1000,      # 0.5 hits/tick
    'container_owned': 5000 / 500,  # 10 hits/tick
    'container_unowned': 5000 / 100,  # 50 hits/tick
    'rampart': 300 / 100,          # 3 hits/tick (varies by RCL but this is base)
}

# Source constants
SOURCE_ENERGY = 3000
SOURCE_REGEN = 300  # ticks
MAX_HARVEST_PER_SOURCE = SOURCE_ENERGY / SOURCE_REGEN  # 10 energy/tick


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


def fetch_room_objects(room: str, shard: str = 'shard3') -> list:
    """Fetch room objects from Screeps API."""
    creds = load_credentials()
    if not creds or 'token' not in creds:
        raise Exception("No credentials found")

    url = f'https://screeps.com/api/game/room-objects?room={room}&shard={shard}'
    headers = {'X-Token': creds['token']}
    response = requests.get(url, headers=headers)
    data = response.json()

    if data.get('ok') != 1:
        raise Exception(f"API error: {data}")

    return data.get('objects', [])


def fetch_terrain(room: str, shard: str = 'shard3') -> str:
    """Fetch terrain data for road calculations."""
    url = f'https://screeps.com/api/game/room-terrain?room={room}&shard={shard}&encoded=false'
    response = requests.get(url)
    data = response.json()
    if data.get('ok') != 1:
        raise Exception(f"API error: {data}")
    return data['terrain'][0]['terrain']


def get_terrain_at(terrain: str, x: int, y: int) -> int:
    """Get terrain type at position. 0=plain, 1=wall, 2=swamp"""
    return int(terrain[y * 50 + x])


def analyze_creep(creep: dict) -> dict:
    """Analyze a creep's economy impact."""
    body = creep.get('body', [])
    name = creep.get('name', 'Unknown')

    # Count body parts
    parts = defaultdict(int)
    for part in body:
        parts[part['type']] += 1

    # Calculate spawn cost
    spawn_cost = sum(BODY_COSTS.get(p['type'], 0) for p in body)

    # Amortized cost per tick
    cost_per_tick = spawn_cost / CREEP_LIFESPAN

    # Determine role from action log or name patterns
    action_log = creep.get('actionLog', {})
    role = 'unknown'
    energy_rate = 0

    # Check what the creep is doing
    if action_log.get('harvest'):
        role = 'harvester'
        energy_rate = parts['work'] * WORK_RATES['harvest']  # produces
    elif action_log.get('upgradeController'):
        role = 'upgrader'
        energy_rate = -parts['work'] * WORK_RATES['upgrade']  # consumes
    elif action_log.get('build'):
        role = 'builder'
        energy_rate = -parts['work'] * WORK_RATES['build']  # consumes
    elif action_log.get('repair'):
        role = 'repairer'
        energy_rate = -parts['work'] * WORK_RATES['repair']  # consumes
    else:
        # Guess from name patterns
        name_lower = name.lower()
        if name_lower[0] in ['h'] and parts['work'] >= 3:  # Hugo, Hank, etc
            role = 'harvester'
            energy_rate = parts['work'] * WORK_RATES['harvest']
        elif name_lower[0] in ['t']:  # Tucker, Travis, etc (hauler)
            role = 'hauler'
            energy_rate = 0
        elif name_lower[0] in ['u']:  # Uma, Ulric, etc
            role = 'upgrader'
            energy_rate = -parts['work'] * WORK_RATES['upgrade']
        elif name_lower[0] in ['b']:  # Bob, Benny, etc
            role = 'builder'
            energy_rate = -parts['work'] * WORK_RATES['build']

    return {
        'name': name,
        'role': role,
        'parts': dict(parts),
        'spawn_cost': spawn_cost,
        'cost_per_tick': cost_per_tick,
        'energy_rate': energy_rate,  # positive = produces, negative = consumes
        'work_parts': parts['work'],
    }


def analyze_structure(obj: dict, terrain: str = None) -> dict:
    """Analyze a structure's maintenance cost."""
    struct_type = obj.get('type') or obj.get('structureType')
    x, y = obj.get('x', 0), obj.get('y', 0)

    decay_rate = 0  # hits per tick

    if struct_type == 'road':
        # Check terrain for swamp vs plain
        if terrain:
            t = get_terrain_at(terrain, x, y)
            if t == 2:  # swamp
                decay_rate = STRUCTURE_DECAY['road_swamp']
            else:
                decay_rate = STRUCTURE_DECAY['road_plain']
        else:
            decay_rate = STRUCTURE_DECAY['road_plain']

    elif struct_type == 'container':
        decay_rate = STRUCTURE_DECAY['container_owned']

    elif struct_type == 'rampart':
        decay_rate = STRUCTURE_DECAY['rampart']

    # Convert hits/tick to energy/tick (1 energy = 100 hits repair)
    energy_cost = decay_rate / 100

    return {
        'type': struct_type,
        'x': x,
        'y': y,
        'decay_rate': decay_rate,
        'energy_per_tick': energy_cost,
    }


def run_calculator(room: str, shard: str = 'shard3', verbose: bool = False):
    """Run the economy calculator for a room."""

    print(f"\n{'='*60}")
    print(f"  SCREEPS ECONOMY CALCULATOR")
    print(f"  Room: {room} ({shard})")
    print(f"{'='*60}\n")

    # Fetch data
    print("Fetching room data...")
    objects = fetch_room_objects(room, shard)
    terrain = fetch_terrain(room, shard)

    # Categorize objects
    creeps = [o for o in objects if o['type'] == 'creep']
    sources = [o for o in objects if o['type'] == 'source']
    structures = [o for o in objects if o['type'] in
                  ['road', 'container', 'rampart', 'extension', 'spawn', 'tower']]

    # === PRODUCTION ===
    print(f"\n--- ENERGY PRODUCTION ---")
    num_sources = len(sources)
    max_production = num_sources * MAX_HARVEST_PER_SOURCE
    print(f"Sources: {num_sources}")
    print(f"Max harvest rate: {max_production:.1f} energy/tick")

    # === CREEP ANALYSIS ===
    print(f"\n--- CREEPS ({len(creeps)}) ---")

    total_spawn_overhead = 0
    total_production = 0
    total_consumption = 0  # Only counts steady-state consumption (upgraders)

    creep_data = []
    for creep in creeps:
        analysis = analyze_creep(creep)
        creep_data.append(analysis)
        total_spawn_overhead += analysis['cost_per_tick']

        if analysis['energy_rate'] > 0:
            total_production += analysis['energy_rate']
        elif analysis['role'] == 'upgrader':
            # Only count upgraders as steady-state consumption
            # Builders are one-time costs, not ongoing drain
            total_consumption += abs(analysis['energy_rate'])

    # Group by role
    by_role = defaultdict(list)
    for c in creep_data:
        by_role[c['role']].append(c)

    for role, creeps_in_role in sorted(by_role.items()):
        work_parts = sum(c['work_parts'] for c in creeps_in_role)
        spawn_cost = sum(c['cost_per_tick'] for c in creeps_in_role)
        energy_rate = sum(c['energy_rate'] for c in creeps_in_role)

        rate_str = f"+{energy_rate:.1f}" if energy_rate > 0 else f"{energy_rate:.1f}"

        if verbose:
            print(f"\n  {role.upper()}S ({len(creeps_in_role)}):")
            for c in creeps_in_role:
                parts_str = ', '.join(f"{v}{k[0].upper()}" for k, v in c['parts'].items())
                print(f"    {c['name']}: [{parts_str}] = {c['spawn_cost']} energy")
            print(f"    Total: {work_parts}W, spawn overhead: {spawn_cost:.2f}/tick, energy: {rate_str}/tick")
        else:
            print(f"  {role.upper():12} x{len(creeps_in_role):2}  |  {work_parts:2}W  |  spawn: {spawn_cost:.2f}/tick  |  energy: {rate_str}/tick")

    print(f"\n  {'TOTAL':12}      |      |  spawn: {total_spawn_overhead:.2f}/tick")

    # === STRUCTURE MAINTENANCE ===
    print(f"\n--- STRUCTURE MAINTENANCE ---")

    total_maintenance = 0
    struct_counts = defaultdict(int)
    struct_costs = defaultdict(float)

    for obj in structures:
        analysis = analyze_structure(obj, terrain)
        struct_counts[analysis['type']] += 1
        struct_costs[analysis['type']] += analysis['energy_per_tick']
        total_maintenance += analysis['energy_per_tick']

    for stype in sorted(struct_counts.keys()):
        count = struct_counts[stype]
        cost = struct_costs[stype]
        print(f"  {stype:12} x{count:2}  |  decay: {cost:.3f} energy/tick")

    print(f"\n  {'TOTAL':12}      |  decay: {total_maintenance:.3f} energy/tick")

    # === SUMMARY ===
    print(f"\n{'='*60}")
    print(f"  ECONOMY SUMMARY")
    print(f"{'='*60}")

    print(f"\n  INCOME:")
    print(f"    Max harvest:        +{max_production:.1f} energy/tick")

    print(f"\n  OVERHEAD:")
    print(f"    Creep spawning:     -{total_spawn_overhead:.2f} energy/tick")
    print(f"    Structure decay:    -{total_maintenance:.3f} energy/tick")

    available = max_production - total_spawn_overhead - total_maintenance
    print(f"\n  AVAILABLE FOR WORK:")
    print(f"    {available:.1f} energy/tick")

    # Calculate steady-state creep cost (excluding builders)
    steady_state_spawn = sum(
        c['cost_per_tick'] for c in creep_data if c['role'] != 'builder'
    )

    surplus = available - total_consumption

    print(f"\n  ENERGY ALLOCATION:")
    print(f"    {'Category':<24} {'Rate':>10} {'% of Income':>12}")
    print(f"    {'-'*24} {'-'*10} {'-'*12}")

    # Structure maintenance
    struct_pct = (total_maintenance / max_production) * 100
    print(f"    {'Structure maintenance':<24} {total_maintenance:>9.2f}/t {struct_pct:>10.1f}%")

    # Creep spawning (no builders)
    spawn_pct = (steady_state_spawn / max_production) * 100
    print(f"    {'Creep spawning':<24} {steady_state_spawn:>9.2f}/t {spawn_pct:>10.1f}%")

    # Upgrading
    upgrade_pct = (total_consumption / max_production) * 100
    print(f"    {'Controller upgrading':<24} {total_consumption:>9.1f}/t {upgrade_pct:>10.1f}%")

    # Surplus
    surplus_pct = (surplus / max_production) * 100
    if surplus > 0:
        print(f"    {'Surplus (piling up)':<24} {surplus:>9.1f}/t {surplus_pct:>10.1f}%")
    else:
        print(f"    {'Deficit (starving)':<24} {surplus:>9.1f}/t {surplus_pct:>10.1f}%")

    print(f"    {'-'*24} {'-'*10} {'-'*12}")
    print(f"    {'TOTAL':<24} {max_production:>9.1f}/t {'100.0':>10}%")

    print(f"\n{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description='Screeps Economy Calculator')
    parser.add_argument('room', nargs='?', default='E42S48', help='Room name')
    parser.add_argument('--shard', default='shard3', help='Shard name')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')

    args = parser.parse_args()
    run_calculator(args.room, args.shard, args.verbose)


if __name__ == '__main__':
    main()
