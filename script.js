document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('sudoku-grid');
    const validateButton = document.getElementById('validate-button');
    let sudokuBoard = []; // Will hold the generated puzzle
    let solution = []; // Will hold the complete solution

    // --- Sudoku Generation Logic --- //
    function generateSudoku() {
        // Placeholder for Sudoku generation algorithm
        // For now, let's use a simple predefined board and solution
        // TODO: Implement a proper generator (e.g., backtracking)
        sudokuBoard = [
            [5, 3, 0, 0, 7, 0, 0, 0, 0],
            [6, 0, 0, 1, 9, 5, 0, 0, 0],
            [0, 9, 8, 0, 0, 0, 0, 6, 0],
            [8, 0, 0, 0, 6, 0, 0, 0, 3],
            [4, 0, 0, 8, 0, 3, 0, 0, 1],
            [7, 0, 0, 0, 2, 0, 0, 0, 6],
            [0, 6, 0, 0, 0, 0, 2, 8, 0],
            [0, 0, 0, 4, 1, 9, 0, 0, 5],
            [0, 0, 0, 0, 8, 0, 0, 7, 9]
        ];
        // This is the solution to the above board
        solution = [
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

        console.log("Generated Sudoku Board (0 represents empty cells):");
        console.log(sudokuBoard);
    }

    // --- Grid Creation Logic --- //
    function createGrid() {
        gridContainer.innerHTML = ''; // Clear previous grid
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.classList.add('sudoku-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (sudokuBoard[r][c] !== 0) {
                    // Pre-filled cell
                    cell.textContent = sudokuBoard[r][c];
                    cell.classList.add('prefilled'); // Optional: style prefilled cells differently
                } else {
                    // Empty cell for user input
                    const input = document.createElement('input');
                    input.type = 'number'; // Use number type for basic validation
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

    // --- Validation Logic --- //
    function validateSolution() {
        console.log("Validating solution...");
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
                        cellElement.style.backgroundColor = 'red'; // Temporary highlight
                        // Maybe revert color after a delay
                        setTimeout(() => { cellElement.style.backgroundColor = ''; }, 2000);
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
        generateSudoku();
        createGrid();
        validateButton.addEventListener('click', validateSolution);
    }

    init();
}); 