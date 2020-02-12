var board = (function () { // Namespace board

    // Constants relating to the board
    const BOARD_SIZE = 64;  // The number of squares to a side of the board
    const MAX_RANGE = 8; // The maximum range a piece can move

    function square_size() {
        if (squares[0][0] != null)
            return parseFloat(squares[0][0].style.width.replace("px",""));
        return window.innerHeight / 10.0;
    }

    // Variables pertaining to the board
    var mouse_down = false;
    var mouse_last_x = 0;
    var mouse_last_y = 0;

    var piece_names       = ["pawn", "bishop", "knight", "rook", "queen", "king"];
    var highlighted_moves = [];

    // Contains the row elements, which themselves contain the squares
    var rows = [];

    // Initialize the pieces/squares arrays
    var pieces  = [];
    var squares = [];
    for (x = 0; x < BOARD_SIZE; ++x) {
        var prow = []
        var srow = []
        for (y = 0; y < BOARD_SIZE; ++y)
        {
            prow.push(null);
            srow.push(null);
        }
        pieces.push(prow);
        squares.push(srow);
    }

    function rand_int(max) {
        return Math.floor(Math.random() * max)
    }

    function clear_square(x, y) {
        if (get_piece(x,y) != null)
            get_piece(x,y).parentNode.removeChild(get_piece(x,y));
        pieces[x][y] = null;
    }

    function get_piece(x, y){
        if (!in_range(x)) return null;
        if (!in_range(y)) return null;
        return pieces[x][y];
    }

    function get_color(x, y) {
        p = get_piece(x,y);
        if (p == null) return null;
        return p.id.split("_")[1];
    }

    function in_range(x) {
        return (x >= 0) && (x < BOARD_SIZE);
    }

    function move_piece(x,y,xt,yt) {

        var p1 = get_piece(x,y);
        if (p1 == null) return;

        clear_square(xt,yt);

        owner = p1.id.split("_")[0];
        color = p1.id.split("_")[1];
        name  = p1.id.split("_")[2];
        create_piece(xt,yt,color,name,owner);

        clear_square(x,y);
        clear_highlights();
    }

    function highlight_move(x,y,xt,yt) {

        if (!in_range(x)) return;
        if (!in_range(y)) return;
        if (!in_range(xt)) return;
        if (!in_range(yt)) return;
        
        p1 = get_piece(x,y);
        if (p1 == null) return; // No piece here

        move_color = "rgba(32,128,0,0.5)";
        p2 = pieces[xt][yt];
        if (p2 != null)
        {
            // These are the same color => cant make this move
            if (get_color(x,y) == get_color(xt, yt))
                return;

            // These are opposite colors => this is a taking move
            else
                move_color = "rgba(128,32,0,0.5)";
        }

        var h = document.createElement("div");
        h.className = "move_highlight";

        h.style.borderRadius = (square_size()/2) + "px";
        h.style.backgroundColor = move_color;
        h.style.width = square_size() + "px";
        h.style.height = h.style.width;
        h.style.backgroundSize = "cover";
        h.style.position = "absolute";
        h.style.left = xt * square_size();
        h.style.top = yt * square_size();

        h.onclick = () => { move_piece(x,y,xt,yt); }

        highlighted_moves.push(h);
        document.body.append(h);
    }

    function clear_highlights() {

        // Clear move highlights
        for (var i=0; i<highlighted_moves.length; ++i)
            highlighted_moves[i].parentNode.removeChild(highlighted_moves[i]);
        highlighted_moves = [];
    }

    function click_piece(x,y) {
        
        clear_highlights();

        // Stop here if no piece is on square clicked
        p = get_piece(x,y);
        if (p == null) return;

        splt  = p.id.split("_");
        owner = splt[0];
        color = splt[1];
        name  = splt[2];

        enemy_color = "white";
        if (color == "white") enemy_color = "black";

        switch(name)
        {
            case "pawn":
                // Moves to adjecent squares, takes diagonally
                if (get_color(x+1, y) == null) highlight_move(x,y,x+1,y);
                if (get_color(x-1, y) == null)   highlight_move(x,y,x-1,y);
                if (get_color(x, y+1) == null) highlight_move(x,y,x,y+1);
                if (get_color(x, y-1) == null) highlight_move(x,y,x,y-1);
                if (get_color(x+1,y+1) == enemy_color) highlight_move(x,y,x+1,y+1);
                if (get_color(x+1,y-1) == enemy_color) highlight_move(x,y,x+1,y-1);
                if (get_color(x-1,y+1) == enemy_color) highlight_move(x,y,x-1,y+1);
                if (get_color(x-1,y-1) == enemy_color) highlight_move(x,y,x-1,y-1);
                break;

            case "knight":
                // Knight moves
                highlight_move(x, y, x+1, y+2);
                highlight_move(x, y, x-1, y+2);
                highlight_move(x, y, x+1, y-2);
                highlight_move(x, y, x-1, y-2);
                highlight_move(x, y, x+2, y+1);
                highlight_move(x, y, x-2, y+1);
                highlight_move(x, y, x+2, y-1);
                highlight_move(x, y, x-2, y-1);
                break;

            case "king":
                // King moves
                for (var dx=-1; dx<2; ++dx)
                    for (var dy=-1; dy<2; ++dy)
                        highlight_move(x, y, x+dx, y+dy);
                break;

            case "queen":
                // Queen moves
                for (var xs=-1; xs<2; xs+=1)
                    for (var ys=-1; ys<2; ys+=1)
                        for (var range=1; range<MAX_RANGE; ++range)
                        {
                            var xt = x+xs*range;
                            var yt = y+ys*range;
                            highlight_move(x, y, xt, yt);
                            if (get_color(xt, yt) != null)
                                break;
                        }
                break;

            case "bishop":
                // Bishop moves
                for (var xs=-1; xs<2; xs+=2)
                    for (var ys=-1; ys<2; ys+=2)
                        for (var range=1; range<MAX_RANGE; ++range)
                        {
                            var xt = x+xs*range;
                            var yt = y+ys*range;
                            highlight_move(x, y, xt, yt);
                            if (get_color(xt, yt) != null)
                                break;
                        }
                break;

            case "rook":
                // Rook moves
                var dxs = [0, 0, 1, -1];
                var dys = [1, -1, 0, 0];
                for (var n=0; n<4; ++n)
                    for (var range=1; range<MAX_RANGE; ++range)
                    {
                        var xt = x+dxs[n]*range;
                        var yt = y+dys[n]*range;
                        highlight_move(x, y, xt, yt);
                        if (get_color(xt, yt) != null)
                            break;
                    }
                break;
        }
    }

    function create_piece(x, y, color, name, owner) {
        var p = document.createElement("div");
        p.className = "piece";
        p.id = owner + "_" + color + "_" + name;

        p.style.backgroundImage = "url(img/" + color + "_" + name + ".svg)";
        p.style.width = square_size() + "px";
        p.style.height = p.style.width;
        p.style.backgroundSize = "cover";
        p.style.position = "absolute";
        p.style.left = x * square_size();
        p.style.top = y * square_size();

        clear_square(x, y);
        p.onclick = () => { click_piece(x, y); };
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

    function zoom(factor) {
        // Modify the display size of the board by the given factor
        // maintaining the view centre

        // Record the old window dimensions in units of the old square size
        old_window_width  = window.innerWidth/square_size();
        old_window_height = window.innerHeight/square_size();
        old_window_x = window.pageXOffset/square_size() + old_window_width/2;
        old_window_y = window.pageYOffset/square_size() + old_window_height/2;

        // Resize objects to the new square size
        new_square_size = square_size()*factor;
        clear_highlights();
        for (var x=0; x<BOARD_SIZE; ++x)
            for (var y=0; y<BOARD_SIZE; ++y)
            {
                squares[x][y].style.width  = new_square_size + "px";
                squares[x][y].style.height = new_square_size + "px";
                squares[x][y].style.left   = x*new_square_size;
                squares[x][y].style.top    = y*new_square_size;

                if (pieces[x][y] != null)
                {
                    pieces[x][y].style.width  = new_square_size + "px";
                    pieces[x][y].style.height = new_square_size + "px";
                    pieces[x][y].style.left   = x*new_square_size;
                    pieces[x][y].style.top    = y*new_square_size;
                }
            }

        for (var y=0; y<BOARD_SIZE; ++y)
        {
            rows[y].style.width  = (BOARD_SIZE*new_square_size) + "px";
            rows[y].style.height = new_square_size + "px";
        }

        // Scroll the page to centre on the same point of 
        // the board as it was before 
        new_window_width  = window.innerWidth/square_size();
        new_window_height = window.innerHeight/square_size();
        window.scroll((old_window_x-new_window_width/2)*new_square_size,
                      (old_window_y-new_window_height/2)*new_square_size);
    }

    function create_board() {

        for (i = 0; i < 1000; ++i)
            create_random_piece();

        // Create the board
        for (var x = 0; x < BOARD_SIZE; ++x) {

            // A single row of the board
            var row = document.createElement("div");
            row.className = "row";
            row.id = "row_" + x;

            // The board is made up of squares that are
            row.style.width = BOARD_SIZE * square_size() + "px";
            row.style.height = square_size() + "px";

            for (var y = 0; y < BOARD_SIZE; ++y) {

                // Create the squares in this row
                var sq = document.createElement("div");

                if ((x + y) % 2 == 0) sq.className = "black_square";
                else sq.className = "white_square";
                sq.id = "square_" + x + "_" + y;
                sq.onclick = () => { clear_highlights(); }

                sq.style.width  = square_size() + "px";
                sq.style.height = sq.style.width;
                squares[x][y]   = sq;

                row.appendChild(sq);
            }

            rows.push(row);
            document.body.appendChild(row);
        }

        document.body.onkeydown = (event) => {
            // Handle keyboard input
            switch(event.key)
            {
                case "-":
                    zoom(0.5);
                    break;
                case "=":
                    zoom(2.0);
                    break;
            }
        };  

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
