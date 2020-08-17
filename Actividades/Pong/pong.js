let keysDown = {
    'w': false,
    's': false,
    'o': false,
    'l': false
};

//Clase para las cosas que se van a manejar en el PONG
class barra {

    constructor(x, y, width, height, keyUp, keyDown, speed = 5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.keyUp = keyUp;
        this.keyDown = keyDown;
        this.speed = speed;
    }

    moveUp() {
        this.y -= this.speed;
    }
    moveDown() {
        this.y += this.speed;
    }
    draw(context) {
        context.fillStyle = 'white';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        if (keysDown[this.keyUp])
            this.moveUp();

        if (keysDown[this.keyDown])
            this.moveDown();
    }
}

class pelota {
    constructor(x, y, radio, speed = 1) {

        this.x = x;
        this.y = y;
        this.radio = radio;
        this.speed = speed;

        this.up = true;
        this.right = true;

    }

    draw(context) {
        context.fillStyle = 'white';
        context.beginPath(); //Le indicas que empiece a dibujar y cuando detecta un fill para de dibujar
        context.arc(this.x, this.y, this.radio, 0, Math.PI * 2);
        // context.closePath();
        context.fill();
    }

    update(up, down, left, right) {
        if (this.up)
            this.y -= this.speed;
        else
            this.y += this.speed;

        if (this.right)
            this.x += this.speed;
        else
            this.x -= this.speed;

        if ((this.y - this.radio) <= up)
            this.up = false;

        if ((this.y + this.radio) >= down)
            this.up = true;

        if ((this.x + this.radio) >= right)
            this.right = false;

        if ((this.x - this.radio) <= left)
            this.right = true;
    }
}

function update(canvas, context, barras, bola) {
    requestAnimationFrame(() => update(canvas, context, barras, bola));

    context.clearRect(0, 0, canvas.width, canvas.height);

    barras.forEach(barra => {
        barra.draw(context);
        barra.update();
    });

    bola.update(0, canvas.height, 0, canvas.width);

}

function main() {

    const canvas = document.getElementById("pongCanvas");
    const context = canvas.getContext("2d");

    let barraIzq = new barra(10, 120, 20, 60, 'w', 's');
    let barraDer = new barra(570, 120, 20, 60, 'o', 'l');
    let bola = new pelota(canvas.width / 2, canvas.height / 2, 10);

    let barras = [];

    barras.push(barraIzq, barraDer, bola);

    /*     
        Forma básica de una función anónima
        gameObjects.forEach(function(object){
            object.draw(context);
        }); 
     */

    document.addEventListener("keydown", function (event) { keysDown[event.key] = true; });
    // document.addEventListener("keydown", function (event) {
    // if (event.key == 'w')
    //     keysDown[event.key] = true;

    // if (event.key == 'o')
    //     keysDown[event.key] = true;

    // if (event.key == 's')
    //     keysDown[event.key] = true;

    // if(event.key == 'l')
    //     keysDown[event.key] = true;
    // });

    document.addEventListener("keyup", function (event) { keysDown[event.key] = false; });
    // document.addEventListener("keyup", function (event) {
    // if (event.key == 'w')
    //     keysDown[event.key] = false;

    // if (event.key == 'o')
    //     keysDown[event.key] = false;

    // if (event.key == 's')
    //     keysDown[event.key] = false;

    // if (event.key == 'l')
    //     keysDown[event.key] = false;
    // });

    //Operador de Morsa
    //barras.forEach(object => object.draw(context));

    update(canvas, context, barras, bola);


}