var board = (function () { // Namespace board

    // Constants relating to the board
    const BOARD_SIZE = 64;  // The number of squares to a side of the board
    const SQUARE_SIZE = window.innerHeight / 10.0; // The size of a board square in pixels

    // Variables pertaining to the board
    var mouse_down = false;
    var mouse_last_x = 0;
    var mouse_last_y = 0;

    var piece_names = ["pawn", "bishop", "knight", "rook", "queen", "king"];

    // Initialize the pieces array
    var pieces = [];
    for (x = 0; x < BOARD_SIZE; ++x) {
        var row = []
        for (y = 0; y < BOARD_SIZE; ++y)
            row.push(null);
        pieces.push(row);
    }

    function rand_int(max) {
        return Math.floor(Math.random() * max)
    }

    function create_piece(x, y, color, name, owner) {
        var p = document.createElement("div");
        p.className = "piece";
        p.id = owner + "_" + color + "_" + name;

        p.style.backgroundImage = "url(img/" + color + "_" + name + ".svg)";
        p.style.width = SQUARE_SIZE + "px";
        p.style.height = p.style.width;
        p.style.backgroundSize = "cover";
        p.style.position = "absolute";
        p.style.left = x * SQUARE_SIZE;
        p.style.top = y * SQUARE_SIZE;

        if (pieces[x][y] != null)
            pieces[x][y].parentNode.removeChild(pieces[x][y]);
        pieces[x][y] = p;

        document.body.appendChild(p);
    }

    function create_random_piece() {

        name = piece_names[rand_int(piece_names.length)];
        color = "black";
        if (Math.random() < 0.5) color = "white";

        owner = "bob";
        if (Math.random() < 0.1) owner = "me";
        create_piece(rand_int(BOARD_SIZE), rand_int(BOARD_SIZE), color, name, owner);
    }

    function create_board() {

        for (i = 0; i < 1000; ++i)
            create_random_piece();

        // Create the board
        for (x = 0; x < BOARD_SIZE; ++x) {

            // A single row of the board
            var row = document.createElement("div");
            row.className = "row";
            row.id = "row_" + x;

            // The board is made up of squares that are
            row.style.width = BOARD_SIZE * SQUARE_SIZE + "px";
            row.style.height = SQUARE_SIZE + "px";

            for (y = 0; y < BOARD_SIZE; ++y) {

                // Create the squares in this row
                var sq = document.createElement("div");

                if ((x + y) % 2 == 0) sq.className = "black_square";
                else sq.className = "white_square";
                sq.id = "square_" + x + "_" + y;

                sq.style.width = SQUARE_SIZE + "px";
                sq.style.height = sq.style.width;

                row.appendChild(sq);
            }

            document.body.appendChild(row);
        }

        // Add the mouse tracking listeners
        document.body.addEventListener("mousedown", () => { mouse_down = true; });
        document.body.addEventListener("mouseup", () => { mouse_down = false; });

        document.body.addEventListener("mousemove", (event) => {

            var dx = event.clientX - mouse_last_x;
            var dy = event.clientY - mouse_last_y;

            // Click-and-drag happened
            if (mouse_down)
                window.scrollBy(-dx, -dy);

            mouse_last_x = event.clientX;
            mouse_last_y = event.clientY;
        });

        // Add touch tracking listeners
        document.body.addEventListener("touchstart", () => { mouse_down = true; });
        document.body.addEventListener("touchend", () => { mouse_down = false; });

        document.body.addEventListener("touchmove", (event) => {

            var dx = event.touches[0].clientX - mouse_last_x;
            var dy = event.touches[0].clientY - mouse_last_y;

            // Touch-and-drag happened
            if (mouse_down)
                if (Math.abs(dx) < 100)
                    if (Math.abs(dy) < 100)
                        window.scrollBy(-dx, -dy);

            mouse_last_x = event.touches[0].clientX;
            mouse_last_y = event.touches[0].clientY;
        });
    }

    return {

        create: function () {
            // Start the game
            create_board();
        },
    }

})(); // End namespace board

board.create();