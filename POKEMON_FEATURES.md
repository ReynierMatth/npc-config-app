# Pokémon API Integration Features

## Overview
The NPC Configuration App now includes comprehensive Pokémon API integration using the [PokéAPI](https://pokeapi.co/) to help you build Pokémon teams for your NPCs.

## New Features

### 1. Form-Based Pokémon Selection 🎯
- **Full Pokémon Dropdown**: Select from all 1010+ Pokémon (Gen 1-9)
- **Level Control**: Set level from 1-100 using slider or number input
- **Individual Move Selection**: Choose up to 4 moves from available movesets
- **Real-time Preview**: See the generated Cobblemon string before adding

### 2. Team Generation Tools ⚡
- **Random Team**: Generate 6 random Pokémon with realistic levels (20-80)
- **Type-based Teams**: Create themed teams (Fire, Water, Grass, Electric, etc.)
- **Quick 3**: Generate smaller teams for testing

### 3. Enhanced UI Components
- **Pokémon Info Display**: Shows artwork, types, stats, and available moves
- **Move Categories**: Includes level-up, TM, and tutor moves
- **Form Validation**: Ensures valid selections before adding
- **Loading States**: Clear feedback during API calls

## How to Use

### Adding Individual Pokémon:
1. Navigate to **Pokemon Party** tab
2. Enable **Battle Configuration** first
3. Click **"Add Pokémon"** button (blue button with search icon)
4. In the form modal:
   - Select Pokémon from dropdown
   - Adjust level (1-100)
   - Choose up to 4 moves
   - Preview the result
   - Click "Add to Team"

### Quick Team Generation:
- **Random Team**: Click "Random Team" for 6 diverse Pokémon
- **Type Teams**: Use "Generate by Type" dropdown
- **Small Teams**: Click "Quick 3" for testing

### Manual Editing:
- Each Pokémon slot has a text input for manual editing
- Click the 🔍 icon next to any slot to use the form selector
- Use "Add Empty Slot" for manual text entry

## Generated Format
The form automatically creates proper Cobblemon format strings:

```
gastrodon level=44 moves=hydro-pump,rain-dance,mud-bomb,recover
pikachu level=50 moves=thunderbolt,quick-attack,thunder-wave,agility
charizard level=65 moves=flamethrower,dragon-claw,air-slash,roost
```

## API Features
- **Caching**: 10-minute response caching for better performance
- **Error Handling**: Graceful fallbacks for failed requests  
- **Move Filtering**: Only shows learnable moves (level-up, TM, tutor)
- **Type Safety**: Full TypeScript support

## Performance
- Lazy loading of Pokémon data
- Efficient move filtering
- Minimal API calls with intelligent caching
- Hot module reloading in development

## Technical Details

### Files Added:
- `src/services/pokemonApi.ts` - API service with caching
- `src/components/PokemonFormSelector.tsx` - Form-based selector
- Enhanced `src/components/NPCPartyBuilder.tsx` - Updated party builder

### Dependencies:
- Uses the free [PokéAPI](https://pokeapi.co/) (no API key required)
- Built with React hooks and TypeScript
- Integrates seamlessly with existing Cobblemon configuration

---

Ready to test at: http://localhost:5173