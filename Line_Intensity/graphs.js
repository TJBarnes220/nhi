var LI_boundaryWidth = 500;
var LI_boundaryHeight = 300;

/**
* The create graph function contructs the visual representation of the data collected by the line
* details function. A graph is handmade using rectangles, lines and text. The sizes
* are arbitrary for now and can be changed later on. As of now the graph has a specfic
* size and position that it sticks to.
* @param line the line object to extract information from
*/
function createGraph(graphContainer, line, boundary_tlx, boundary_tly) {

    graphContainer.clear();
    graphContainer.removeChildren();
    //  hTextContainer.removeChildren();
    //   vTextContainer.removeChildren();

    //Create a rectangle
    //Outside boundary

    var outsideBoundary = new PIXI.Graphics();
    outsideBoundary.lineStyle(1, 0x000000, 1);
    outsideBoundary.beginFill(0xffffff);
    outsideBoundary.drawRect(boundary_tlx, boundary_tly, LI_boundaryWidth, LI_boundaryHeight);
    outsideBoundary.endFill();
    var polyPts;
    polyPts = [boundary_tlx, boundary_tly, boundary_tlx, boundary_tly + LI_boundaryHeight, boundary_tlx + LI_boundaryWidth, boundary_tly + LI_boundaryHeight, boundary_tlx + LI_boundaryWidth, boundary_tly];
    outsideBoundary.hitArea = new PIXI.Polygon(polyPts);
    graphContainer.addChild(outsideBoundary);

    
    //Inner graph
    var innerGraph = new PIXI.Graphics();
    var graph_tlx = boundary_tlx + 50;
    var graph_tly = boundary_tly + 25;
    var graphWidth = 425;
    var graphHeight = 225;
    innerGraph.lineStyle(1, 0x000000, 1);
    innerGraph.beginFill(0xffffff);
    innerGraph.drawRect(graph_tlx, graph_tly, graphWidth, graphHeight);
    innerGraph.endFill();
    graphContainer.addChild(innerGraph);


    //This takes care of the horizontal segements of the graph
    var horizontalColumns = 10;
    var horizontalHalfSpacing = graphWidth / (horizontalColumns * 2);    //Spacing between each noted index
    var horizontalDashY = graph_tly + graphHeight;      //Starting point for everything (Bottom of graph)
    var horizontalDashX = graph_tlx;        //Left hand side
    var currentX = horizontalDashX + horizontalHalfSpacing;     //Off sets the first element

    var horizontalText = [];   //Text to be used
    for (var i = 0; i <= horizontalColumns; i++) {
        horizontalText.push(Math.floor((line.lineDataPoints.length / 10) * i));
    }
    for (var i = 0; i < horizontalColumns; i++) {
        var indexLine = new PIXI.Graphics();
        indexLine.lineStyle(1, 0x000000)               //Creates a line to indicate the index
            .moveTo(currentX, horizontalDashY - 5)
            .lineTo(currentX, horizontalDashY + 5);
        graphContainer.addChild(indexLine);

        const hText = new PIXI.Text(horizontalText[i], graphText);  //Adds text underneath it
        hText.x = currentX - hText.width / 2;
        hText.y = horizontalDashY + 10;
        graphContainer.addChild(hText);

        var backgroundLine = new PIXI.Graphics();
        backgroundLine.lineStyle(1, 0x33FFFC)               //Creates the background lines for the graph
            .moveTo(currentX, horizontalDashY - graphHeight)
            .lineTo(currentX, horizontalDashY);
        graphContainer.addChild(backgroundLine);

        currentX += 2 * horizontalHalfSpacing;
    }

    //This takes care of the vertical segements of the graph
    var verticalRows = 15;
    if (line.valueDifference < verticalRows) {
        verticalRows = line.valueDifference;
    }
    var verticalSpacing = graphHeight / verticalRows;
    var verticalDashY = graph_tly + graphHeight;
    var verticalDashX = graph_tlx;
    var currentY = verticalDashY;
    // var verticalText = ["51", "102", "153", "204", "255"];
    var verticalText = [];
    var verticalValueSpacing = line.valueDifference / verticalRows;
    var counter = 0;
    for (var i = 0; i <= verticalRows; i++) {
        verticalText.push(Math.floor(counter));
        counter += verticalValueSpacing;
    }

    for (var i = 0; i <= verticalRows; i++) {
        const vText = new PIXI.Text(verticalText[i], graphText);
        vText.x = verticalDashX - 20;
        var vIndexLine = new PIXI.Graphics();
        vIndexLine.lineStyle(1, 0x000000)       //Vertical entry index
            .moveTo(verticalDashX - 5, currentY)
            .lineTo(verticalDashX, currentY);
        graphContainer.addChild(vIndexLine);

        if (i != 0) {
            var vBackgroundLine = new PIXI.Graphics();
            vBackgroundLine.lineStyle(1, 0x33FFFC)   //Background lines
                .moveTo(verticalDashX, currentY)
                .lineTo(verticalDashX + graphWidth, currentY);
            graphContainer.addChild(vBackgroundLine);
        }
        vText.y = currentY - (vText.height) / 2;
        graphContainer.addChild(vText);
        currentY -= verticalSpacing;
    }


    //This plots the actual data of the graph

    var arrayLength = line.lineDataPoints.length; //used for loop bounds
    var valueSpacing = graphHeight / line.valueDifference;   //finds pixel length of each individual y value (y-axis)
    var entrySpacing = (graphWidth - (horizontalHalfSpacing * 2)) / arrayLength;    //Spacing between each entry (x-axis)
    var entryStartY = graph_tly + graphHeight;      //Starting point for everything (Bottom of graph)
    var entryStartX = graph_tlx + horizontalHalfSpacing;        //Left hand side
    var entryCurrentX = entryStartX;
    for (var i = 0; i < arrayLength; i++) {
        var peakCheck = false;
        var peakLength = line.peakData.length;
        for (var j = 0; j < peakLength; j++) {
            if (i == line.peakData[j]) {
                peakCheck = true;
                break;
            }//end if
        }//end for
        var valleyCheck = false;
        var valleyLength = line.valleyData.length;
        for (var j = 0; j < valleyLength; j++) {
            if (i == line.valleyData[j]) {
                valleyCheck = true;
                break;
            }//end if
        }//end for
        if (peakCheck) {
            var peakBar = new PIXI.Graphics();
            peakBar.lineStyle(2, 0x165F0A)               //Creates bar for the ith entry of the bar graph
                .moveTo(entryCurrentX - 1, entryStartY)
                .lineTo(entryCurrentX - 1, entryStartY - (valueSpacing * (line.lineDataPoints[i])));
            graphContainer.addChild(peakBar);
        }// end if
        else if (valleyCheck) {
            var valleyBar = new PIXI.Graphics();
            valleyBar.lineStyle(2, 0x0A175F)               //Creates bar for the ith entry of the bar graph
                .moveTo(entryCurrentX - 1, entryStartY)
                .lineTo(entryCurrentX - 1, graph_tly);
            graphContainer.addChild(valleyBar);
        }// end else if
        else {
            var entryBar = new PIXI.Graphics();
            entryBar.lineStyle(2, 0xC70039)               //Creates bar for the ith entry of the bar graph
                .moveTo(entryCurrentX - 1, entryStartY)
                .lineTo(entryCurrentX - 1, entryStartY - (valueSpacing * (line.lineDataPoints[i])));
            graphContainer.addChild(entryBar);
        }// end else
        entryCurrentX += entrySpacing;
    }//end of for loop
    
    //Draw baseline
    var baslineImage = new PIXI.Graphics();
    baslineImage.lineStyle(1, 0x4A235A)
        .moveTo(verticalDashX, entryStartY - (valueSpacing * (line.baseline)))
        .lineTo(verticalDashX + graphWidth, entryStartY - (valueSpacing * (line.baseline)));
    graphContainer.addChild(baslineImage);
 
}//end of create graph