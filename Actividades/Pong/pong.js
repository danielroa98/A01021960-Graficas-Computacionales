//Clase para las cosas que se van a manejar en el PONG
class barra {

    constructor(x, y, width, height, speed = 1) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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

    barras.forEach(bola => {
        bola.draw(context);
        bola.update();
    });

    bola.update(0, canvas.height, 0, canvas.width);

}

function main() {

    const canvas = document.getElementById("pongCanvas");
    document.addEventListener("keypress", keyPress);

    const context = canvas.getContext("2d");

    let barraIzq = new barra(10, 120, 20, 60);
    let barraDer = new barra(570, 120, 20, 60);
    let bola = new pelota(canvas.width / 2, canvas.height / 2, 10);

    let barras = [];

    barras.push(barraIzq, barraDer, bola);

    /*     
        Forma básica de una función anónima
        gameObjects.forEach(function(object){
            object.draw(context);
        }); 
     */

    console.log(barras);

    //Operador de Morsa
    //barras.forEach(object => object.draw(context));

    function keyPress(event) {

        console.log(event.keyCode);

        barras.forEach(object => {

            //Para que detecte si se presiona la W (sin importar si es mayúscula)
            if (event.keyCode == 87 || event.keyCode == 119) {
                // object.moveUp();
                barraDer.speed -= 5;
            }

            //Para que detecte si se presiona S (sin importar si es mayúscula)
            else if (event.keyCode == 115 || event.keyCode == 83) {
                // object.moveDown();
                barraDer.speed += 5;
            }
        });
    }

    update(canvas, context, barras, bola);


}