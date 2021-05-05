class Pann {
    constructor(x,y,sigla='0',cm='') {
        this.foglio=-1;
        this.sigla=sigla;
        this.x=x;
        this.y=y;
        this.px=0
        this.py=0;
        this.cm=cm;
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
            var py=(this.py+this.y/2)*scala+oy;
            text(`${this.x}x${this.y}`,(this.px+this.x/2)*scala+ox,py)
            fill("blue");
            textSize(8);
            if (!this.cm.startsWith('#') && !this.cm.startsWith('//') ) {
                var vv=(this.cm || '').split(/[\!\|\,]/);
                for (var v of vv) {
                    py+=10;
                    text(v,(this.px+this.x/2)*scala+ox,py)
                }
            }
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