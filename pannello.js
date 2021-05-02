class Pann {
    constructor(x,y,sigla='0') {
        this.foglio=-1;
        this.sigla=sigla;
        this.x=x;
        this.y=y;
        this.px=0
        this.py=0;
    }
    isin(x,y) {
        x=(x-ox)/scala;
        y=(y-oy)/scala;
        if (this.foglio==ott.curfoglio) {
            return x>=this.px && x<=this.px+this.x &&
                   y>=this.py && y<=this.py+this.y
        }
        return false;
    }
    draw() {
        if (this.foglio==ott.curfoglio) {
            stroke(0);
            rect(this.px*scala+ox,this.py*scala+oy,this.x*scala,this.y*scala);
            textAlign(CENTER,CENTER)
            textSize(9);
            noStroke();
            fill(0);
            text(`${this.x}x${this.y}`,(this.px+this.x/2)*scala+ox,(this.py+this.y/2)*scala+oy)
        }
    }

    
}

class Barra {
    constructor (x,y) {
        this.x=x;this.y=y;
        this.ele=[];
    }
    add(e,px,py) {
       // e.used=true;
        e.px=px;
        e.py=py;
        this.ele.push(e);
    }
    move(px,py) {
        for (var e of this.ele) {
            e.px+=px;
            e.py+=py;
        }
    }
    get usato() {
        var n=0;
        for (var e of this.ele) {
            n+=e.x*e.y;
        }
        return n;
    }
    get totale() {
        return this.x*this.y;
    }
    get resa() {
        return this.usato/this.totale;
    }
}