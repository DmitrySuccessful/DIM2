# Doodle Jump Clone

A fun and engaging clone of the classic Doodle Jump game, built with JavaScript and HTML5 Canvas.

## Features

- Smooth platform jumping mechanics
- Multiple platform types:
  - Normal platforms (brown)
  - Moving platforms (blue)
  - Breakable platforms (orange)
- Power-ups:
  - Springs (pink) - Higher jump
  - Stars (yellow) - Temporary invincibility
- Particle effects
- Local high score tracking
- Increasing difficulty as you climb higher
- Responsive controls

## How to Play

1. Open `src/game.html` in your web browser
2. Use the left (←) and right (→) arrow keys to move
3. Jump on platforms to climb higher
4. Collect power-ups for special abilities
5. Try to get the highest score possible!
6. Press SPACE to restart when game is over

## Platform Types

- **Brown Platforms**: Regular, stable platforms
- **Blue Platforms**: Move left and right
- **Orange Platforms**: Break after one jump

## Power-ups

- **Spring (↑)**: Gives you an extra high jump
- **Star (★)**: Makes you temporarily invincible (golden color)

## Running the Game

You can run the game using any local web server. For example:

```bash
# Using Python's built-in server
python -m http.server 8000

# Then open in your browser:
# http://localhost:8000/src/game.html
```

## Development

The game is built using vanilla JavaScript with ES6+ features and HTML5 Canvas. The code is structured into several modules:

- `doodleJump.js`: Main game logic and classes
- `particles.js`: Particle system for visual effects

### Code Structure

- `Player`: Handles player movement, physics, and power-ups
- `Platform`: Different platform types and behaviors
- `PowerUp`: Power-up items and their effects
- `ParticleSystem`: Visual effects for jumps and interactions
- `Game`: Main game loop and state management

## Future Improvements

- Add sound effects and background music
- Implement different character skins
- Add more power-up types
- Create different game modes
- Add mobile touch controls
- Implement online leaderboard

## License

MIT License - feel free to use and modify! 