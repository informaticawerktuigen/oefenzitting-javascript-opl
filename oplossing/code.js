//Interne voorstelling van de puzzel als een tweedimensionale lijst
let my_puzzle = [[0, 1, 2],
                 [7, 4, 8],
                 [3, 5, 6]];

//Wanneer de volledige HTML-pagina geladen is wordt onderstaande functie uitgevoerd
window.onload = function(){
    new_game_handler();
}

//Deze functie neemt als invoer de lijstrepresentatie van onze puzzel
//
function draw_puzzle(puzzle){
    let puzzle_html = generate_puzzle_html(puzzle);
    document.getElementById("puzzle_container").innerHTML = puzzle_html;
}

function generate_puzzle_html(puzzle){
    let puzzle_inner_html = "";
    for(let i = 0; i < puzzle.length; i++){
        
        let row_html = "<tr>"
        for(let j = 0; j < puzzle[i].length; j++){
            row_html += "<td onclick=\"square_click_handler(this)\" ";
            if(puzzle[i][j] == 0){
                row_html += "class=\"emptyTile\">";
            }else{
                row_html += ">"+puzzle[i][j];
            }
            row_html += "</td>";
        }
        row_html += "</tr>";
        puzzle_inner_html += row_html;
    }

    return `<table>${puzzle_inner_html}</table>`;
}

//Correct solution: [[1,2,3],[4,5,6],[7,8,0]]
//Strategy: We will check if the array is sorted (each element is bigger than the next one),
//          with the exception of the last element. The last element must be 0.
//          For the chosen internal representation, a sorted array with last element 0 
//          always means that the solution is correct.
//          This strategy works for generic N x M puzzles

function check_game_complete(puzzle){
    let previous = 0;
    for(let i = 0; i < puzzle.length; i++){
        for(let j = 0; j < puzzle[i].length; j++){
            //If we have reached the last element, the whole array was sorted, so we are done
            if(i == puzzle.length - 1 && j == puzzle[0].length - 1){
                return puzzle[i][j] == 0;
            }
            //If the current element is smaller than the previous one, the array is not sorted
            //Game is not complete
            if(puzzle[i][j] < previous){
                return false;
            }
            //Store the current value of puzzle so next iteration we can compare it
            previous = puzzle[i][j];
        }
    }
}

//Helper function to find the empty square in the puzzle
function find_empty_square(puzzle){
    for(let i = 0; i < puzzle.length; i++){
        for(let j = 0; j < puzzle[i].length; j++){
            if(puzzle[i][j] == 0){
                return [i, j];
            }
        }
    }
    //No zero value found? Invalid board state - return negative (impossible) values
    return [-1, -1];
}

//Helper function to find Manhattan distance between two points on the puzzle
//https://en.wikipedia.org/wiki/Taxicab_geometry
function manhattan_distance(x1, y1, x2, y2){
    return Math.abs(x1-x2) + Math.abs(y1-y2);
}

//Helper function to check if two points are neighboring (no diagonal neighbors!)
function is_neighbor(x1, y1, x2, y2){
    return manhattan_distance(x1, y1, x2, y2) == 1;
}

//Swaps the value at position (row,col) with the empty square IF that position is a neighbor of
//the empty square
function swap_empty_square(puzzle, row, col){

    if(row < 0 || col < 0 || row >= puzzle.length || col >= puzzle[0].length) return;

    let empty_position = find_empty_square(puzzle);
    let empty_row = empty_position[0];
    let empty_col = empty_position[1];

    if(is_neighbor(empty_row, empty_col, row, col)){
        let swap_value = puzzle[row][col];
        puzzle[row][col] = puzzle[empty_row][empty_col];
        puzzle[empty_row][empty_col] = swap_value;
    }
}

function square_click_handler(cell){
    let col = cell.cellIndex;
    let row = cell.parentNode.rowIndex;
    swap_empty_square(my_puzzle, row, col);
    draw_puzzle(my_puzzle);
    
    if(check_game_complete(my_puzzle)){
        alert(`Proficiat! Je spendeerde ${seconds_spent} seconden aan de puzzel.`);
        new_game_handler();
    }
}

//BONUS/EXTRA PART

function generate_solved_puzzle(n){
    let puzzle = [];
    let counter = 1;
    let i, j;
    for(i = 0; i < n; i++){
        puzzle[i] = [];
        for(j = 0; j < n; j++){
            puzzle[i][j] = counter++;
        }
    }
    puzzle[i-1][j-1] = 0;
    return puzzle;
}

function make_random_move(puzzle){
    let empty_position = find_empty_square(puzzle);
    let row = empty_position[0];
    let col = empty_position[1];
    let direction = Math.floor(Math.random()*4);
    switch(direction){
        case 0: row++; break;
        case 1: row--; break;
        case 2: col++; break;
        case 3: col--; break;
    }
    //Swap empty square does nothing if we try to swap out of bounds so we don't need
    //to worry about that case
    swap_empty_square(puzzle, row, col);
}

function generate_solvable_puzzle(n){
    let puzzle = generate_solved_puzzle(n)
    for(let i = 0; i < 100; i++){
        make_random_move(puzzle);
    }
    if(check_game_complete(puzzle)){
        return generate_solvable_puzzle(n);
    }else{
        return puzzle;
    }
}

let seconds_spent = 0;
let timer;

function draw_time(){
    document.getElementById("timer").innerHTML = seconds_spent;
}

function increment_time(){
    seconds_spent++;
    draw_time();
}

function reset_timer(){
    if(timer != undefined) clearInterval(timer);
    seconds_spent = 0;
    draw_time();
    timer = setInterval(increment_time, 1000);
}

function new_game_handler(){
    let n = document.getElementById("quantity").value;
    my_puzzle = generate_solvable_puzzle(n);
    draw_puzzle(my_puzzle);
    reset_timer();
}