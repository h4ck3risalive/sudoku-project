document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('sudoku-grid');
    const validateButton = document.getElementById('validate-button');
    const resetButton = document.getElementById('reset-button');
    const newGameButton = document.getElementById('new-game-button');
    const solutionButton = document.getElementById('solution-button');

    let currentPuzzle = []; // Stores the initial puzzle state for reset
    let sudokuBoard = []; // Will hold the current state (user input + initial)
    let solution = []; // Will hold the complete solution

    // --- Helper Functions --- //
    // Fisher-Yates (Knuth) Shuffle
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Generates a random permutation of numbers 1-9
    function generateNumberMapping() {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(numbers);
        const mapping = {};
        for (let i = 0; i < 9; i++) {
            mapping[i + 1] = numbers[i];
        }
        return mapping;
    }

    // Creates a deep copy of a 2D array (board)
    function deepCopyBoard(board) {
        return JSON.parse(JSON.stringify(board));
    }

    // --- Sudoku Generation Logic --- //
    function generateSudoku() {
        // Start with a base solved board (can be any valid solved Sudoku)
        const baseSolution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ];

        let newSolution = deepCopyBoard(baseSolution);

        // 1. Remap numbers
        const mapping = generateNumberMapping();
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                newSolution[r][c] = mapping[newSolution[r][c]];
            }
        }

        // 2. Shuffle rows within bands (0-2, 3-5, 6-8)
        for (let band = 0; band < 3; band++) {
            const rows = [band * 3, band * 3 + 1, band * 3 + 2];
            shuffleArray(rows);
            const bandCopy = [newSolution[rows[0]], newSolution[rows[1]], newSolution[rows[2]]];
            newSolution[rows[0]] = bandCopy[0];
            newSolution[rows[1]] = bandCopy[1];
            newSolution[rows[2]] = bandCopy[2];
        }

        // 3. Shuffle columns within bands (0-2, 3-5, 6-8)
        for (let band = 0; band < 3; band++) {
            const cols = [band * 3, band * 3 + 1, band * 3 + 2];
            shuffleArray(cols);
            for (let r = 0; r < 9; r++) {
                const bandCopy = [newSolution[r][cols[0]], newSolution[r][cols[1]], newSolution[r][cols[2]]];
                newSolution[r][cols[0]] = bandCopy[0];
                newSolution[r][cols[1]] = bandCopy[1];
                newSolution[r][cols[2]] = bandCopy[2];
            }
        }

        // 4. Shuffle row bands (bands are [0,1,2], [3,4,5], [6,7,8])
        const rowBands = [0, 1, 2];
        shuffleArray(rowBands);
        const solutionCopy = deepCopyBoard(newSolution);
        for(let band = 0; band < 3; band++) {
            const sourceBandIndex = rowBands[band];
            for (let i = 0; i < 3; i++) {
                 newSolution[band * 3 + i] = solutionCopy[sourceBandIndex * 3 + i];
            }
        }

        // 5. Shuffle column bands
        const colBands = [0, 1, 2];
        shuffleArray(colBands);
        const solutionCopy2 = deepCopyBoard(newSolution);
         for(let band = 0; band < 3; band++) {
            const sourceBandIndex = colBands[band];
            for (let i = 0; i < 3; i++) {
                const targetCol = band * 3 + i;
                const sourceCol = sourceBandIndex * 3 + i;
                for(let r = 0; r < 9; r++) {
                    newSolution[r][targetCol] = solutionCopy2[r][sourceCol];
                }
            }
        }

        // Store the fully generated solution
        solution = newSolution; // Solution is now the transformed board

        // Create the puzzle board by removing cells
        sudokuBoard = deepCopyBoard(solution);
        let cellsToRemove = 45; // Adjust for difficulty (e.g., 40-55)
        let attempts = 0;
        const maxAttempts = cellsToRemove * 2; // Prevent infinite loops

        while (cellsToRemove > 0 && attempts < maxAttempts) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            attempts++;
            if (sudokuBoard[r][c] !== 0) {
                sudokuBoard[r][c] = 0;
                cellsToRemove--;
            }
        }

        console.log("Generated NEW Sudoku Board (0 represents empty cells):");
        console.log(sudokuBoard);
        // console.log("Solution:"); // Optional: log solution for debugging
        // console.log(solution);
    }

    // --- Grid Creation Logic --- //
    function createGrid(boardToDisplay) {
        gridContainer.innerHTML = ''; // Clear previous grid
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                const value = boardToDisplay[r][c];

                if (value !== 0) {
                    // Check if this cell was part of the original puzzle
                    if (currentPuzzle[r][c] !== 0 && currentPuzzle[r][c] === value) {
                        // Original pre-filled cell
                        cell.textContent = value;
                        cell.classList.add('prefilled');
                    } else if (currentPuzzle[r][c] === 0 && value !== 0) {
                        // Cell filled by the user OR by 'Show Solution'
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.min = '1';
                        input.max = '9';
                        input.value = value; // Set the value (from user or solution)
                        input.addEventListener('input', handleInput);
                        // If showing solution, make input read-only? Or just display text?
                        // For now, keep it editable, but color it differently?
                        cell.appendChild(input);
                        if(boardToDisplay === solution) { // If we are showing the solution board
                             input.style.color = 'green'; // Indicate solved cell
                             input.readOnly = true; // Prevent editing the solution shown
                        }
                    } else {
                         // Empty cell in the original puzzle, still empty
                        const input = document.createElement('input');
                        input.type = 'number';
                        input.min = '1';
                        input.max = '9';
                        input.addEventListener('input', handleInput);
                        cell.appendChild(input);
                    }
                } else {
                     // Empty cell (value is 0)
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '1';
                    input.max = '9';
                    input.addEventListener('input', handleInput);
                    cell.appendChild(input);
                }
                gridContainer.appendChild(cell);
            }
        }
    }

    // --- Input Handling --- //
    function handleInput(event) {
        const input = event.target;
        const value = input.value;

        // Basic validation: Allow only single digits 1-9
        if (value.length > 1) {
            input.value = value.slice(0, 1);
        }
        if (value !== '' && (parseInt(value) < 1 || parseInt(value) > 9)) {
            input.value = ''; // Clear invalid input
        }
        // TODO: Add immediate validation feedback if desired
    }

    // --- Button Action Logic --- //

    function resetGame() {
        console.log("Resetting game...");
        // Recreate the grid using the initially generated puzzle
        sudokuBoard = JSON.parse(JSON.stringify(currentPuzzle)); // Restore from initial puzzle
        createGrid(sudokuBoard);
        // Clear any previous validation highlights
        clearHighlights();
    }

    function newGame() {
        console.log("Starting new game...");
        generateSudoku(); // Generate new board and solution
        // Deep copy the generated board to store the initial state for reset
        currentPuzzle = JSON.parse(JSON.stringify(sudokuBoard));
        createGrid(sudokuBoard);
        clearHighlights();
    }

    function showSolution() {
        console.log("Showing solution...");
        // Recreate the grid using the solution array
        createGrid(solution);
        // Optionally disable validation button? Or just show the solved state.
    }

    // Helper to clear validation highlights
    function clearHighlights() {
        const highlightedCells = gridContainer.querySelectorAll('.sudoku-cell[style*="background-color: red"]');
        highlightedCells.forEach(cell => {
            cell.style.backgroundColor = ''; // Reset background color
        });
    }

    // --- Validation Logic --- //
    function validateSolution() {
        console.log("Validating solution...");
        clearHighlights(); // Clear previous highlights first
        let isValid = true;
        const userBoard = getCurrentBoardState();

        // 1. Check if all cells are filled (basic check)
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (userBoard[r][c] === 0 || userBoard[r][c] === '') {
                    // alert('Please fill all cells before validating.');
                    // isValid = false; // Or just check against the solution
                    // break;
                }
            }
            // if (!isValid) break;
        }

        // 2. Check against the known solution
        // In a real generator, you'd need more complex validation (rows, cols, squares)
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                // Compare user input or prefilled number with the solution
                const cellValue = userBoard[r][c];
                if (cellValue !== solution[r][c]) {
                    console.error(`Mismatch at [${r},${c}]: Expected ${solution[r][c]}, Got ${cellValue}`);
                    isValid = false;
                    // Optionally highlight the incorrect cell
                    const cellElement = gridContainer.querySelector(`[data-row='${r}'][data-col='${c}']`);
                    if (cellElement) {
                        // Highlight the cell itself, not just the input if it exists
                        cellElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
                        // Don't use timeout, keep highlight until next validation/reset/new game
                        // setTimeout(() => { cellElement.style.backgroundColor = ''; }, 2000);
                    }
                }
            }
        }


        if (isValid) {
            alert('Congratulations! Solution is correct!');
        } else {
            alert('Incorrect solution. Check highlighted cells (if any) or console for details.');
        }
    }

    // Helper function to get the current state of the board from the UI
    function getCurrentBoardState() {
        const board = [];
        for (let r = 0; r < 9; r++) {
            board[r] = [];
            for (let c = 0; c < 9; c++) {
                const cellElement = gridContainer.querySelector(`[data-row='${r}'][data-col='${c}']`);
                if (cellElement) {
                    const input = cellElement.querySelector('input');
                    if (input) {
                        board[r][c] = input.value === '' ? 0 : parseInt(input.value);
                    } else {
                        board[r][c] = parseInt(cellElement.textContent);
                    }
                }
            }
        }
        return board;
    }

    // --- Initialization --- //
    function init() {
        // generateSudoku(); // Called by newGame
        // createGrid(); // Called by newGame
        newGameButton.addEventListener('click', newGame);
        resetButton.addEventListener('click', resetGame);
        solutionButton.addEventListener('click', showSolution);
        validateButton.addEventListener('click', validateSolution);
        newGame(); // Start the first game
    }

    init();
}); 