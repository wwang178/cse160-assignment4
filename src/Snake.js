let g_isPlayingSnake = false;
let g_snakeEasyMode = false;

class Snake {
    constructor(startPos) {
        this.segmentPositions = [];
        this.cubes = [];
        this.length = 20;
        this.applePosition;
        this.appleCube;
        this.applesEaten = 0;

        this.generateApple();

        this.segmentPositions.unshift(startPos);
        let head = new Cube();
        head.textureNum = -2;
        head.color = [0.0, 1.0, 0.0, 1.0];
        head.matrix.setTranslate(startPos.x, startPos.y, startPos.z);
        setBlock(head, 2, startPos);
        this.cubes.unshift(head);
    }

    addLength() {
        this.length += 5;
    }

    generateApple() {
        let x;
        let y;
        let z;
        for (let attemps = 0; attemps < 50; attemps++) {
            x = getRandomInt(32);
            y = getRandomInt(32);
            z = getRandomInt(32);
            if (g_map[x][y][z] == 0) {
                let apple = new Cube();
                apple.textureNum = -2;
                apple.color = [1.0, 0.0, 1.0, 1.0];
                apple.matrix.setTranslate(x, y, z);
                setBlock(apple, 3, new Vector3([x, y, z]));
                this.applePosition = new Vector3([x, y, z]);
                this.appleCube = apple;
                return new Vector3([x, y, z]);
            }
        }
        console.error("Tried to get a new apple pos 50 times but failed (this is lazy way to get a new position but I'll just say you win at this point)");
        return;
    }

    moveHeadTo(newPos) {
        if (this.segmentPositions[0].equals(newPos))
            return;
        
        // collided with something that is not air or apple
        let collisionData = getMapData(newPos);
        if(collisionData != 0 && collisionData != 3){
            this.lose();
            return;
        }

        // check if ate apple
        if(newPos.equals(this.applePosition)){
            console.log("ate apple");
            this.applesEaten++;
            this.addLength();
            this.generateApple();
            this.displayApplesEaten();
        }

        let oldHeadPos = this.segmentPositions[0];
        let oldHead = new Cube();
        oldHead.textureNum = -2;
        oldHead.color = [0.0, 1.0, 0.0, 1.0];
        oldHead.matrix.setTranslate(oldHeadPos.x, oldHeadPos.y, oldHeadPos.z);
        setBlock(oldHead, 2, newPos);
        this.cubes[0] = oldHead;

        // the new head is not rendered because the block gets stuck in your face / the camera would be inside
        this.segmentPositions.unshift(newPos);
        this.cubes.unshift(null);
        // remove last segment
        if(this.segmentPositions.length > this.length){
            let tailPos = this.segmentPositions.pop();
            this.cubes.pop();
            setBlock(null, 0, tailPos);
        }
    }

    lose(){
        stopPlayingSnake();
        let highscoreString = "---You lose. You ate " + this.applesEaten + " apple(s).---";
        console.log(highscoreString);
        highscoreString = "<b>" + highscoreString + "</b>";
        document.getElementById("snakeOutput").innerHTML = highscoreString;
    }

    displayApplesEaten(){
        let applesEatenString = "---Apples eaten: " + this.applesEaten + "---";
        console.log(applesEatenString);
        applesEatenString = "<b>" + applesEatenString + "</b>";
        document.getElementById("snakeOutput").innerHTML = applesEatenString;
    }

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function startPlayingSnake() {
    let currentPos = getCurrentPos();
    g_snake = new Snake(currentPos);
    g_isPlayingSnake = true;
    g_snake.displayApplesEaten();
}

function stopPlayingSnake(){
    g_snake = null;
    g_isPlayingSnake = false;
}

function getCurrentPos() {
    let vector = new Vector3([g_camera.eye.x, g_camera.eye.y, g_camera.eye.z]);
    vector.x = Math.floor(vector.x);
    vector.y = Math.floor(vector.y);
    vector.z = Math.floor(vector.z);
    return vector;
}