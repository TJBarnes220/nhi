// create a background...
//Sets to match app size
//TODO: Should add the functionality of resizing as app resizes
const background = new PIXI.Sprite.from('../images/Picture1.png');
//background.width = app.screen.width;
//background.height = app.screen.height;



var button_commands = [];

//Cancel button is used to end line drawing process prematurely
//Will appear once first point has been added
//Clicking on it resets all values like starting point, text, etc....
const cancel_button = new PIXI.Sprite.from('../images/cancel_icon.png');
cancel_button.width = 50;
cancel_button.height = 50;
cancel_button.x = 0;
cancel_button.y = 0;
cancel_button.alpha = 0;
cancel_button.interactive = true;
cancel_button.buttonMode = true;
cancel_button.on('pointerdown', cancelDown);
cancel_button.on('pointerup', cancelUp);
cancel_button.on('pointerupoutside', cancelOutSide);

const draw_button = new PIXI.Sprite.from('../images/line_tool_icon.png');
draw_button.width = 50;
draw_button.height = 50;
draw_button.x = 0;
draw_button.y = 0;
draw_button.interactive = true;
draw_button.on('pointerdown', activateDraw);
draw_button.on('pointerup', activateUp);
//Value used to determine if user clicked on cancel button
button_commands.push(draw_button);
let cancel = false;

const edit_button = new PIXI.Sprite.from('../images/edit_tool_icon.png');
edit_button.width = 50;
edit_button.height = 50;
edit_button.x = 50;
edit_button.y = 0;
edit_button.interactive = true;
edit_button.on('pointerdown', editDown);
edit_button.on('pointerup', editUp);
button_commands.push(edit_button);

const eraser_button = new PIXI.Sprite.from('../images/eraser_icon.png');
eraser_button.width = 50;
eraser_button.height = 50;
eraser_button.x = 100;
eraser_button.y = 0;
eraser_button.interactive = true;
eraser_button.on('pointerdown', eraseDown);
eraser_button.on('pointerup', eraseUp);
button_commands.push(eraser_button);

const clear_button = new PIXI.Sprite.from('../images/clear_all_icon.png');
clear_button.width = 50;
clear_button.height = 50;
clear_button.x = 150;
clear_button.y = 0;
clear_button.interactive = true;
clear_button.on('pointerdown', clearDown);
clear_button.on('pointerup', clearUp);
button_commands.push(clear_button);





/*
 * States:
 * Neutral
 * Drawing (line creation)
 * Eraser
 * */

let state = 'neutral';


//Creates style used by text. It is currently unnecessary but more of an example
const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    align: 'center',
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 500,
});

//Tells user how to use application
//Text will change along with process
const richText = new PIXI.Text('Hello', style);

//app.stage.addChild(richText);
//Some constants initialized here to be used later
//Graphics concern the line itself
const graphics = new PIXI.Graphics();
//Graphs deals with the actual graph drawn as a result to the line data
const graphs = new PIXI.Graphics();
graphs.buttonMode = true;
graphs.interactive = true;
graphs
    .on('pointerdown', onDragGraphStart)
    .on('pointerup', onDragGraphEnd)
    .on('pointerupoutside', onDragGraphEnd)
    .on('pointermove', onDragGraphMove);

var boundary_tlx = app.screen.width / 2;
var boundary_tly = app.screen.height / 2;
//This container will hold all the horizontal graph text
const hTextContainer = new PIXI.Container();
app.stage.addChild(hTextContainer);
//This container will hold all the vertical graph text
const vTextContainer = new PIXI.Container();
app.stage.addChild(vTextContainer);

//This determines whether a line is currently being drawn
//is used in the draw point function
let drawing = false;
//Variable used to hold starting point for the line
// var points = [0, 0];
var currentStart = -1;
var currentLine = -1;
var lines = [];
var points = [];

//Sets the app to be interactable and allows drawPoint function to be called
//When user clicks anywhere on screen
app.stage.interactive = true;
app.stage.on('pointerdown', drawPoint);

function showAll() {
    this.alpha = 0;
    this.interactive = false;
    this.buttonMode = false;
    //next_button.alpha = 1;
  //  next_button.interactive = true;
  //  next_button.buttonMode = true;
   // 

    app.stage.addChild(background);
    background.width = app.screen.width;
    background.height = app.screen.height;

    app.stage.addChild(cancel_button);
    for (var i = 0; i < button_commands.length; i++) {
        app.stage.addChild(button_commands[i]);
        button_commands[i].alpha = 1;
        button_commands[i].interactive = true;
        button_commands[i].buttonMode = true;
    }
    
    app.stage.addChild(richText);
    richText.alpha = 1;
    richText.x = app.screen.width / 2 - 250;
    richText.y = 0;
    state = 'nuetral';

    app.stage.interactive = true;
    app.stage.on('pointerdown', drawPoint);
}

function hideAll() {
    state = 'nuetral';
    clearUp();
    for (var i = 0; i < button_commands.length; i++) {
        button_commands[i].alpha = 0;
        button_commands[i].interactive = false;
        button_commands[i].buttonMode = false;
    }
    cancel_button.alpha = 0;
    cancel_button.interactive = false;
    cancel_button.buttonMode = false;
    next_button.alpha = 0;
    next_button.interactive = false;
    next_button.buttonMode = false;
    previous_button.alpha = 1;
    previous_button.interactive = true;
    previous_button.buttonMode = true;
    richText.alpha = 0;
}

/**
 * Once activating one of the command buttons they will all be hidden to reveal the cancel button
 * This function provides that process but setting all the command buttons alpha values to zero and bringing the
 * cancel button to the front to allow users to click on it.
 */
function hideButtons() {
    for (var i = 0; i < button_commands.length; i++) {
        button_commands[i].alpha = 0;
        button_commands[i].interactive = false;
        button_commands[i].buttonMode = false;
    }
    cancel_button.alpha = 1;
    bringToFront(cancel_button);
}

/**
 * This simply does the opposite of hideButtons by revealing and bringing all command buttons to the front
 * while hiding the cancel button.
 */
function showButtons() {
    for (var i = 0; i < button_commands.length; i++) {
        button_commands[i].alpha = 1;
        button_commands[i].interactive = true;
        button_commands[i].buttonMode = true;
        bringToFront(button_commands[i]);
    }
    cancel_button.alpha = 0;
}

/**
 * Draw point allows the user to place a point on the image
 * The first time the user does this the line drawing process will begin and drawing switches to true
 * The starting point will be displayed by a small square and the app will wait for the user to
 * click on the screen again
 * Once activated again the app will denonte the end point of the user's line and create a straight
 * line inbetween both points. This will then create a new line object which will have its details
 * displayed and a graph will be created with its information.
 */
function drawPoint(event) {

    if (state == 'drawing') { //Checks if in desired state
        if (!cancel) {  //Checks if user clicked on cancel button
            if (!drawing) { //Checks what phase of line create user is in
                graphics.clear(); //Clears current graphics on screen
                //Changes drawing value
                drawing = true;
                //Updates starting point
                //  points = [event.data.global.x, event.data.global.y];
                //Creates the starting point for the line
                currentStart = new Point(event.data.global.x, event.data.global.y);
                currentStart.image.name = points.length;

                points.push(currentStart);
                //Updates text and cancel button
                setMainText(richText, 2, lines);
            }//end drawing if
            else {
                //Creates the end point of the line
                var endPoint = new Point(event.data.global.x, event.data.global.y);
                endPoint.image.name = points.length;
                points.push(endPoint);
                //Contructs the line graphic to be place inside the line object
                var lineImage = new PIXI.Graphics();
                lineImage.lineStyle(1, 0x9900CC)
                    .moveTo(currentStart.x, currentStart.y)
                    .lineTo(endPoint.x, endPoint.y);
                lineImage.name = lines.length;
                lineImage.interactive = true;
                lineImage.buttonMode = true;
                lineImage
                    .on('pointerdown', lineSelect)
                    .on('pointerup', onDragLineEnd)
                    .on('pointerupoutside', onDragLineEnd)
                    .on('pointermove', onDragLineMove);
                //Creates the hit area of said line graphic
                var polyPts;
                if (currentStart.x > endPoint.x) {
                    polyPts = [currentStart.x - 5, currentStart.y - 5, currentStart.x + 5, currentStart.y + 5, endPoint.x + 5, endPoint.y + 5, endPoint.x - 5, endPoint.y - 5];
                }
                else if (currentStart.x < endPoint.x) {
                    polyPts = [currentStart.x - 5, currentStart.y + 5, currentStart.x + 5, currentStart.y - 5, endPoint.x + 5, endPoint.y - 5, endPoint.x - 5, endPoint.y + 5];
                }
                else if (currentStart.x == endPoint.x) {
                    polyPts = [currentStart.x - 5, currentStart.y, currentStart.x + 5, currentStart.y, endPoint.x + 5, endPoint.y, endPoint.x - 5, endPoint.y];
                }
                //Used to show hitarea for testing purposes
                // var pGraphic = new PIXI.Graphics();
                //       pGraphic.beginFill(0x1C2833);
                //     pGraphic.drawPolygon(polyPts);
                //   app.stage.addChild(pGraphic);
                lineImage.hitArea = new PIXI.Polygon(polyPts);
                app.stage.addChild(lineImage);
                //contructs line object
                currentStart.image
                    .on('pointerdown', onDragStart)
                    .on('pointerup', onDragEnd)
                    .on('pointerupoutside', onDragEnd)
                    .on('pointermove', onDragMove);
                endPoint.image
                    .on('pointerdown', onDragStart)
                    .on('pointerup', onDragEnd)
                    .on('pointerupoutside', onDragEnd)
                    .on('pointermove', onDragMove);
                currentLine = new Line(currentStart, endPoint, background, lines.length, lineImage);
                //Calls data functions to show user the results on the line they drew
                currentLine.displayDetails();   //Displays the details of the line by fetching its information

                createGraph(graphs, currentLine, boundary_tlx, boundary_tly);  //Creates a graph from said line
                app.stage.addChild(graphs);
                lines.push(currentLine);    //Adds this line to the area of lines
                drawing = false;    //Ends the drawing state
                endDraw();

            }//end else
        }//end cancel if
    }// end active if

}// end draw point

/**
 * As of now this doesn't do anything but it can be used to show a pressed button animation
 * @param event
 */
function activateDraw(event) {
    //  cancel_button.texture = resources.t2.texture
    if (this.alpha == 1) {
        //show animated button press????


    }
}

/**
 * This function actually starts the drawing state by changing the main text, hidding the command buttons
 * and setting active to true and state to drawing.
 * @param event
 */
function activateUp(event) {
    if (this.alpha == 1) {
        setMainText(richText, 1, lines);
        hideButtons();
        active = true;
        state = 'drawing';
    }
}

/**
 * End Draw is used to move from the drawing state to the neutral state whether by actually making a line or
 * by canceling the state prematurely.
 */
function endDraw() {
    drawing = false;
    active = false;
    state = 'neutral';
    showButtons();
    //  points = [0, 0];
    currentStart = -1;
    setMainText(richText, 0, lines);
}

/**
 * This function is called when the user clicks on the cancel button.
 * The contents of this function won't run unless the button is clearly visible to the user.
 * Pressing down on the button will prevent the user from creating/doing anything for the
 * current state like erase or draw. However this doesn't activate the transfer of states.
 * This is to allow the user to change their mind by releasing outside the button.
 * @param event the action of clicking on the cancel button sprite
 */
function cancelDown(event) {
    cancel = true;
}// end cancel draw

/**
 * This is to undo the contents of cancel down without actually changing states
 * @param event
 */
function cancelOutSide(event) {
    cancel = false;
}

/**
 * When releasing click/press/etc ontop of the cancel button this will prematurely exit
 * the current state back into neutral. So if the current user is drawing the line they were working on will
 * get destroyed and so on.
 *
 */
function cancelUp(event) {
    //Resets cancel value
    if (cancel) {
        if (state == 'drawing') {
            graphics.clear();
            graphs.clear();
            graphs.removeChildren();
            hTextContainer.removeChildren();
            vTextContainer.removeChildren();
            showButtons();
            cancel = false;
            drawing = false;
            active = false;
            state = 'neutral';
            setMainText(richText, 0, lines);
            currentStart.clearImage();
            if (currentStart != -1) {
                erasePoint(currentStart);
            }
            currentStart = -1;
            endDraw();
        }
        else if (state == 'erase') {
            showButtons();
            cancel = false;
            state = 'neutral';
            setMainText(richText, 0, lines);
        }
        else if (state == 'edit') {
            showButtons();
            cancel = false;
            state = 'neutral';
            setMainText(richText, 0, lines);
        }
    }
}//end cancel up

/**
 * Similar situation to draw down so this could be used to activate a pressed down animation
 */
function eraseDown() {

}

/**
 * When releasing this actually changes the state to erase and changes the main text
 * and hides the command buttons. This only occurs if the erase icon is visible.
 */
function eraseUp() {
    if (this.alpha == 1) {
        setMainText(richText, 3, lines);
        hideButtons();
        state = 'erase';
    }

}

/**
 * This is the process to actually remove a line from the screen. We first take the line's index
 * to allow us to remove said line from our list of lines. We must then reset all the names/indices
 * held within the line objects themselves to prevent future confusion. If the current line being displayed
 * by the graph is the one being deleted then the graph must also be removed. Then we used the line object
 * function of removeLine to get clear off all the images associated with this line object.
 *
 * @param line the line object to be removed
 */
function eraseLine(line) {
    var index = line.name;
    lines.splice(index, 1);
    for (var i = 0; i < lines.length; i++) {
        lines[i].name = i;
        lines[i].image.name = i;
    }
    if (line == currentLine) {
        graphs.clear();
        graphs.removeChildren();
        graphics.clear();
        hTextContainer.removeChildren();
        vTextContainer.removeChildren();
        currentLine = -1;
    }
    line.removeLine();
    erasePoint(this.startPoint);
    erasePoint(this.endPoint);
}

function erasePoint(point) {
    var index = point.image.name;
    points.splice(index, 1);
    for (var i = 0; i < points.length; i++) {
        //points[i].name = i;
        points[i].image.name = i;
    }
    point.clearImage();
}

/**
 * Similar situation to draw down so this could be used to activate a pressed down animation
 */
function editDown() {

}

/**
 * When releasing this actually changes the state to erase and changes the main text
 * and hides the command buttons. This only occurs if the erase icon is visible.
 */
function editUp() {
    if (this.alpha == 1) {
        setMainText(richText, 4, lines);
        hideButtons();
        state = 'edit';
    }
}

//Drag point functions
function onDragStart(event) {
    if (state == 'edit') {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this.data = event.data;
        this.alpha = 0.5;
        //   richText.text = this.name;
        points[this.name].owner.image.alpha = 0.5;
        points[this.name].owner.data.alpha = 0.5;
        points[this.name].owner.clearImage();
        points[this.name].owner.resetImage();
        points[this.name].resetImage();
        this.dragging = true;
        if (currentLine != points[this.name].owner) {
            currentLine = points[this.name].owner;
            createGraph(graphs, currentLine, boundary_tlx, boundary_tly);
            app.stage.addChild(graphs);

        }
    }
}

function onDragEnd() {
    if (state == 'edit') {
        this.alpha = 1;
        points[this.name].owner.image.alpha = 1;
        points[this.name].owner.data.alpha = 1;
        points[this.name].owner.displayDetails();

        this.dragging = false;
        // set the interaction data to null
        this.data = null;
        createGraph(graphs, currentLine, boundary_tlx, boundary_tly);
        app.stage.addChild(graphs);
    }
}

function onDragMove() {
    if (state == 'edit') {
        if (this.dragging) {
            const newPosition = this.data.getLocalPosition(this.parent);
            var changeX = newPosition.x;
            var changeY = newPosition.y;
            var changeY = newPosition.y;

            if (newPosition.x < 0) {
                changeX = 0;
            }
            else if (newPosition.x >= app.screen.width) {
                changeX = app.screen.width;
            }

            if (newPosition.y < 0) {
                changeY = 0;
            }
            else if (newPosition.y >= app.screen.height) {
                changeY = app.screen.height;
            }
            points[this.name].changeLocation(changeX, changeY);
            points[this.name].owner.clearImage();
            points[this.name].owner.resetImage();
            points[this.name].resetImage();
        }
    }
}

//Drag line
function onDragLineEnd() {
    if (state == 'edit') {
        this.alpha = 1;
        lines[this.name].clearImage();
        lines[this.name].resetImage();
        lines[this.name].startPoint.image.alpha = 1;
        lines[this.name].startPoint.resetImage();
        lines[this.name].endPoint.image.alpha = 1;
        lines[this.name].endPoint.resetImage();
        lines[this.name].displayDetails();
        this.dragging = false;
        createGraph(graphs, currentLine, boundary_tlx, boundary_tly);
        app.stage.addChild(graphs);

        this.eventData = null;
    }
}
function onDragLineMove() {
    if (state == 'edit') {
        if (this.dragging) {
            const newPosition = this.eventData.getLocalPosition(this.parent);
            var move = true;
            var changeX = newPosition.x - this.dragx;
            var changeY = newPosition.y - this.dragy;

            if (lines[this.name].startPoint.x + changeX < 0) {
                changeX = 0 - lines[this.name].startPoint.x;
            }
            else if (lines[this.name].endPoint.x + changeX < 0) {
                changeX = 0 - lines[this.name].endPoint.x;
            }
            else if (lines[this.name].startPoint.x + changeX >= app.screen.width) {
                changeX = app.screen.width - (lines[this.name].startPoint.x);
            }
            else if (lines[this.name].endPoint.x + changeX >= app.screen.width) {
                changeX = app.screen.width - (lines[this.name].endPoint.x);
            }

            if (lines[this.name].startPoint.y + changeY < 0) {
                changeY = 0 - lines[this.name].startPoint.y;
            }
            else if (lines[this.name].endPoint.Y + changeY < 0) {
                changeY = 0 - lines[this.name].endPoint.Y;

            }
            else if (lines[this.name].startPoint.y + changeY >= app.screen.height) {
                changeY = app.screen.height - (lines[this.name].startPoint.y);

            }
            else if (lines[this.name].endPoint.y + changeY >= app.screen.height) {
                changeY = app.screen.height - (lines[this.name].endPoint.y);
            }

            if (move) {
                lines[this.name].startPoint.changeLocation(lines[this.name].startPoint.x + changeX, lines[this.name].startPoint.y + changeY);
                lines[this.name].endPoint.changeLocation(lines[this.name].endPoint.x + changeX, lines[this.name].endPoint.y + changeY);
                this.dragx = newPosition.x;
                this.dragy = newPosition.y;
                lines[this.name].clearImage();
                lines[this.name].resetImage();
            }
        }
    }
}

//drag graph
function onDragGraphStart(event) {
    if (state == 'edit') {
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
        this.dragx = event.data.global.x;
        this.dragy = event.data.global.y;
    }
}
function onDragGraphEnd() {
    if (state == 'edit') {
        this.alpha = 1;
        this.dragging = false;
        this.data = null;
    }
}
function onDragGraphMove() {
    if (state == 'edit') {
        if (this.dragging) {
            const newPosition = this.data.getLocalPosition(this.parent);
            var changeX = newPosition.x - this.dragx;
            var changeY = newPosition.y - this.dragy;
            if (boundary_tlx + changeX < 0) {
                changeX = 0 - boundary_tlx;
            }
            else if (boundary_tlx + boundaryWidth + changeX >= app.screen.width) {
                changeX = app.screen.width - (boundary_tlx + boundaryWidth);
            }

            if (boundary_tly + changeY < 0) {
                changeY = 0 - boundary_tly;
            }
            else if (boundary_tly + boundaryHeight + changeY >= app.screen.height) {
                changeY = app.screen.height - (boundary_tly + boundaryHeight);
            }
            moveChildren(graphs, changeX, changeY);
            moveChildren(hTextContainer, changeX, changeY);
            moveChildren(vTextContainer, changeX, changeY);
            this.dragy = newPosition.y;
            this.dragx = newPosition.x;
            boundary_tlx += changeX;
            boundary_tly += changeY;
        }
    }
}

function moveChildren(container, changeX, changeY) {
    var length = container.children.length;
    for (var i = 0; i < length; i++) {
        var child = container.getChildAt(i);
        child.x += changeX;
        child.y += changeY;
    }
}
function clearDown() {

}

/**
 * When releasing this actually changes the state to erase and changes the main text
 * and hides the command buttons. This only occurs if the erase icon is visible.
 */
function clearUp() {
    //if (this.alpha == 1) {
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line == currentLine) {
            graphs.clear();
            graphs.removeChildren();

            graphics.clear();
            // hTextContainer.removeChildren();
            // vTextContainer.removeChildren();
            currentLine = -1;
        }
        line.removeLine();
        erasePoint(line.startPoint);
        erasePoint(line.endPoint);
    }
    lines = [];
    setMainText(richText, 0, lines);
    //  }
}

/**
 * When a user clicks on a line that line will call this function which will decide on what to do
 * depending on the current state of the application.
 * @param line the line that was selected by the user
 */
function lineSelect(event) {
    if (state == 'neutral') {   //Will display the information of said line
        currentLine = lines[this.name];
        createGraph(graphs, currentLine, boundary_tlx, boundary_tly);
        app.stage.addChild(graphs);

        setMainText(richText, 0, lines);
    }
    else if (state == 'erase') {    //Will delete said line
        eraseLine(lines[this.name]);
    }
    else if (state == 'edit') {    //Will delete said line
        this.alpha = 0.5;
        lines[this.name].clearImage();
        lines[this.name].resetImage();
        lines[this.name].startPoint.image.alpha = 0.5;
        lines[this.name].endPoint.image.alpha = 0.5;
        if (currentLine != lines[this.name]) {
            currentLine = lines[this.name];
            createGraph(graphs, currentLine, boundary_tlx, boundary_tly);
            app.stage.addChild(graphs);

        }
        this.dragging = true;
        this.eventData = event.data;
        this.dragx = event.data.global.x;
        this.dragy = event.data.global.y;
    }
}


