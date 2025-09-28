const configContainer = document.getElementById('config-container');
const configSection = document.getElementById('config');
const field = document.getElementById('field');
const fragment = document.createDocumentFragment()
const startGameButton = document.getElementById('start');
const startAgainButton = document.getElementById('start-again-container');

let selectedMode = {};

// Field config
const fieldConfig = [
    { rows: 5, columns: 5 },
    { rows: 6, columns: 6 },
    { rows: 7, columns: 7 },
].map(item => ({
    id: `${item.rows} x ${item.columns}`,
    ...item,
    label: `${item.rows} x ${item.columns}`,
}));

// Elephant config
const elephantConfig = [
    { quantity: 10 },
    { quantity: 13 },
    { quantity: 15 },
].map(item => ({
    id: `${item.quantity}`,
    ...item,
    label: `${item.quantity}`,
}));

// Create configuration options
const createConfigButtons = (configs, container, key) => {
    // Title of configuration section
    const title = document.createElement("div")
    title.className = `${key}-title`;
    title.textContent = key.charAt(0).toUpperCase() + key.slice(1);

    // Configuration section
    const buttonContainer = document.createElement("div");
    buttonContainer.className = `${key}-container`;

    // Each option of the field or elephant
    configs.forEach(option => {
        const configButton = document.createElement('input');
        configButton.id = option.id;
        configButton.type = "radio";
        configButton.name = key;

        configButton.addEventListener('click', () => {
            selectedMode[key] = option;
        });

        const label = document.createElement("label");
        label.htmlFor = configButton.id;
        label.textContent = option.label;

        buttonContainer.append(configButton, label);
    });

    container.append(title, buttonContainer);
}

createConfigButtons(fieldConfig, configSection, "field");
createConfigButtons(elephantConfig, configSection, "elephant");

// Start game after clicking "Start"
startGameButton.addEventListener("click", () => {
    if(Object.keys(selectedMode).length === 2) {
        startGame();
    } else {
        alert("Please select a game config");
    }
});

const startGame = () => {
    // Reset previous game's field
    field.innerHTML = "";
    
    // Hide game config screen
    configContainer.classList.add("hidden");

    // Show field
    field.classList.add("show");

    // Get columns and rows from field config
    let columns = selectedMode.field.columns;
    let rows = selectedMode.field.rows;
    field.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    field.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    //  Generate field
    let grid = Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => {
          const cell = document.createElement("div");
          cell.className = "field-cell";
          fragment.appendChild(cell);
          return cell;
      })
    );
    field.appendChild(fragment);
    
    // Recursion-based random coordinate generator
    const getRandomFreeCoordinate = (rows, columns, heroCoordinates, occupiedCells) => {
        const x = Math.floor(Math.random() * columns + 1);
        const y = Math.floor(Math.random() * rows + 1);
        const key = `${x},${y}`;
        
        // Check if coordinate is occupied OR same as hero's coordinate
        if (occupiedCells.has(key) || (x === heroCoordinates.x && y === heroCoordinates.y)) {
            return getRandomFreeCoordinate(rows, columns, heroCoordinates, occupiedCells);
        }
        
        occupiedCells.add(key);
        return { x, y };
    };
    
    // Cells that already has elephant or hero
    const occupiedCells = new Set();
    
    // Create hero
    const hero = document.createElement("img");
    hero.src = "war.png";
    hero.className = "hero";
    hero.classList.add("show");

    // Hero initial placement using the same recursive function
    const heroCoordinates = getRandomFreeCoordinate(
      rows,
      columns,
      { x: null, y: null },
      occupiedCells,
    );
    grid[heroCoordinates.y - 1][heroCoordinates.x - 1].appendChild(hero);

    // Eaten elephants quantity
    let eatenElephants = 0;
    
    // Create elephants
    const elephantsQuantity = selectedMode.elephant.quantity;
    for (let i = 0; i < elephantsQuantity; i++) {
        const { x, y } = getRandomFreeCoordinate(rows, columns, heroCoordinates, occupiedCells);
        
        // Create elephant
        const elephant = document.createElement("img");
        elephant.src = "elephant.png";
        elephant.className = "elephant";
        elephant.classList.add("show");
        
        // Add elephant to free cell
        grid[y - 1][x - 1].appendChild(elephant);
    }

    // Events that running on each keydown
    window.addEventListener("keyup", (event) => {
        const { x, y } = heroCoordinates;

        // Remove hero from current cell
        grid[y - 1][x - 1].removeChild(hero);

        // Update hero's coordinates
        if (event.key === "ArrowRight" && x < columns) {
            heroCoordinates.x++;
        } else if (event.key === "ArrowLeft" && x > 1) {
            heroCoordinates.x--;
        } else if (event.key === "ArrowUp" && y > 1) {
            heroCoordinates.y--;
        } else if (event.key === "ArrowDown" && y < rows) {
            heroCoordinates.y++;
        }

        // Add hero to new cell
        grid[heroCoordinates.y - 1][heroCoordinates.x - 1].appendChild(hero);

        // Check if cell on which one comes hero contains elephant
        const currentElephant = grid[heroCoordinates.y - 1][heroCoordinates.x - 1].querySelector(".elephant")
        if (currentElephant) {
            currentElephant.remove();

            // Increment eaten elephants quantity
            eatenElephants++;
        }

        // Check if all elephants are eaten
        if (eatenElephants === elephantsQuantity) {
            setTimeout(() => {
                alert("Success!");
                startAgainButton.classList.add("show");
                
                // Restart the game
                startAgainButton.addEventListener("click", () => {
                    startAgainButton.classList.remove("show");
                    field.classList.remove("show");
                    configContainer.classList.remove("hidden");
                    
                    // reset game state
                    eatenElephants = 0;
                    selectedMode = {};
                    
                    // uncheck all config buttons
                    document.querySelectorAll('input[type="radio"]').forEach(input => {
                        input.checked = false;
                    });
                })
            }, 100);
        }
    });
}
