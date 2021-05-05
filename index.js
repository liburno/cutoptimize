// variabili globali
var CW, CH;
var scala, ox, oy;
var ott; // ottimizzatore
var sptaglio = 8;




function preload() {
    getinidata();  
    menuset(0);
}


// dimensiona la finestra grafica
function checksize() {
    CW = windowWidth * .75;
    CH = windowHeight;
    if (ott) {
        scala = CW / ott.mx;
        if (CH / ott.my < scala) scala = CH / ott.my;
        scala *= .9;
        ox = (CW - scala * ott.mx) / 2;
        oy = (CH - scala * ott.my) / 2;
    } else {
        scala = 1; ox = 0; oy = 0;
    }
}
function windowResized() {
    checksize();
    resizeCanvas(CW, CH);
}

function setup() {
    checksize();
    var can=createCanvas(CW,CH).parent("canvas");
}

function draw() {
    background(0, 128, 0);
    if (ott) ott.draw();
}

function keyPressed() {
    if (curpage == 1) {
        switch (key) {

            case "ArrowLeft":
                ott.movefoglio(-1);
                break;
            case "ArrowRight":
                ott.movefoglio(1);
                break;
            default:
                break;
        }
    }
}
