var bx = [];
class Ott {
    constructor(tm) {
        var mx = 0, my = 0;
        this.fgx = [];
        for (var t of tm.fogli) {
            var n = t.n || 1;
            if (t.rq) n*=t.rq;
            for (var i = 0; i < n; i++) {
                mx = mx > t.x ? mx : t.x;
                my = my > t.y ? my : t.y;
                var nn = new Pann(t.x, t.y, t.gr);
                nn.foglio = this.fgx.length;
                this.fgx.push(nn);
            }
        }
        sptaglio = tm.sps || 8;
        this.mx = mx;
        this.my = my;
        this.curfoglio = 0;
        this.tg = [];
        var id = 1;
        for (var t of tm.tagli) {
            var n = t.n || 1;
            if (t.rq) n*=t.rq;
             for (var i = 0; i < n; i++) {
                var nn = new Pann(t.x, t.y, t.gr)
                nn.id = id++;
                this.tg.push(nn);
            }
        }
        this.reset();
    }
    reset() {
        this.res = [];
        for (var t of this.tg) t.foglio = -1;
        this.tg.sort((a, b) => {
            return b.y - a.y
        });
    }
    draw() {
        stroke(0);
        fill(200);
        var f = this.fgx[this.curfoglio];
        f.draw();
        getel("foglioid").innerText = `${f.mat}/${this.nused}`;
        getel("fogliomat").innerText = `${f.sigla}`;
        getel("fogliodim").innerText = `${f.x}x${f.y}`;
        getel("foglioresa").innerText = this.resa
        getel("fogliomisure").innerText = (f.misure || []).join('\n');
        for (var m of f.misure) {
            textAlign(RIGHT, CENTER);
            noStroke();
            fill("white");
            text(m, ox - 20, oy + m * scala);

        }
        for (var t of this.tg) {
            fill("white")
            t.draw()
        }
    }
    get nused() {
        var n = 0;
        for (var f of this.fgx) {
            if (f.misure) n++;
        }
        return n;
    }
    movefoglio(dir) {
        var n = this.fgx.length;
        for (var i = 1; i <= n; i++) {
            var m = (this.curfoglio + i * dir) % n;
            if (m < 0) m += n;
            if (this.fgx[m].misure) {
                this.curfoglio = m;
                return;
            }
        }
    }
    get resa() {
        var cf = this.curfoglio;
        var totale = this.fgx[cf].x * this.fgx[cf].y;
        var tm = 0;
        for (var e of this.fgx) {
            this.misure = null;
        }
        for (var e of this.tg) {
            if (e.foglio == cf) {
                tm += e.x * e.y;
            }
        }
        return Math.floor(tm * 10000 / totale) / 100;
    }

// inizio ottimizzatore di taglio!

    ottimizza() {
        this.reset();
        var mats = new Set();
        for (var x of this.tg) {
            mats.add(x.sigla);
        }
        var matfoglio=1;
        mats = [...mats].sort();
        for (var mat of mats) {

            var fgx=this.fgx.filter(e=>e.sigla==mat);

            for (var foglio of fgx) {
                var fx = foglio.x;
                var fy = foglio.y;
                var y0 = 0;
                var idf=foglio.foglio

                var tf = this.tg.filter(e => e.sigla==mat && e.foglio == -1); // finite le ottimizzazioni!
                if (!tf || tf.length == 0) {
                    break;
                }
                for (var xx = 0; xx < 20; xx++) {

                    var tg = this.tg.filter(e => e.y <= fy && e.sigla==mat && e.foglio == -1);
                    if (!tg || tg.length == 0) {
                        break;
                    }
                    tg = tg.sort((a, b) => b.x*b.y - a.x*a.y);
                    for (var t of tg) t.used = false;
                    // prendi fino a tre misure diverse cerca di costruire una barra;
                    bx = [];
                    var tm = [];
                    for (var i = 0; i < tg.length; i++) {
                        if (tm.length > 2) break;
                        if (!tm.includes(tg[i].x)) {
                            tm.push(tg[i].x);
                            this.ottimizzaBarra(fx, fy, tg, tg[i]);
                        }
                    }
                    if (bx.length) {
                        bx = bx.sort((a, b) => b.resa - a.resa);
                        var bb = bx[0];
                        var x0 = 0;
                        if (!foglio.misure) {
                            foglio.misure = [];
                            foglio.mat=matfoglio++;
                        }
                        var x00 = x0;
                        var by = bx[0].y * 1.2;
                        var b1 = 0;
                        var b0 = 0;
                        var eley = bb.ele[0].y; // dimensione barra in y: considera i tagli multipli!!
                        for (var e of bb.ele) {
                            if (b1 + e.y <= by && e.x <= b0) {
                                // continua sulla stessa riga
                                e.px = x00;
                                e.py = y0 + b1 + sptaglio;
                                b1 += e.y + sptaglio;
                                if (b1 > eley) eley = b1;
                            } else {
                                e.py = y0;
                                e.px = x0;
                                x00 = x0;
                                x0 += e.x + sptaglio;
                                b1 = e.y;
                                b0 = e.x;

                            }
                            e.foglio = foglio.foglio;
                        }
                        y0 += eley + sptaglio;
                        foglio.misure.push((y0 - sptaglio / 2));
                        fy -= (bb.ele[0].y + sptaglio);
                    }
                }
            }
        }
        this.curfoglio=this.fgx.length-1;
        this.movefoglio(1);
        var manca={};
        for (var p of this.tg) {
            if (p.foglio==-1) {
                var k=`${p.sigla}  ${p.x}x${p.y}`
                if (!manca[k]) {
                    manca[k]=0
                }
                manca[k]++;
            }
        }
        var rr=[];
        for (var m in manca) {
            rr.push(`${m} = ${manca[m]}`)
        }
        getel("mancanti").innerText=rr.join('\n');

    }
    filler(x, y, tg) {
        // riempie eventualmente in X
        var tm = tg.filter(e => e.x <= x && e.y <= y && !e.used);
        tm = tm.sort((a, b) => b.y * b.x - a.y * a.x);
        if (tm.length) {
            tm[0].used = true;
            var uu = this.filler(x, y - tm[0].y - sptaglio, tm)
            return [tm[0], ...uu];

        } return [];

    }
    linearCandidates(l, h, tg) {
        // calcola candidati lineari in x, funzione ricorsiva con massimo 3 scelte
        var tm = tg.filter(e => e.x < l - sptaglio && !e.used)
        if (tm) {
            tm = tm.sort((a, b) => b.y * b.x - a.y * a.x);
        }
        var res = [];
        var tx = [];
        for (var i = 0; i < tm.length; i++) {
            if (tx.length > 2) break;

            if (!tx.includes(tm[i].x)) {
                tx.push(tm[i].x);
                tm[i].used = true;
                var uu = this.filler(tm[i].x, h - tm[i].y, tm);
                for (var u of uu) u.used = true;
                var r2 = this.linearCandidates(l - tm[i].x - sptaglio, h, tm);
                tm[i].used = false;
                for (var u of uu) u.used = false;
                if (!r2 || r2.length == 0) {
                    res.push([tm[i], ...uu])
                } else {
                    for (var r of r2) {
                        res.push([tm[i], ...uu, ...r]);
                    }
                }
            }

        }
        return res;

    }
    ottimizzaBarra(fx, fy, tg, pan) {
        // imposta il primo pannello e calcola la barra
        var tx = tg.filter(e => e.y <= pan.y);
        pan.used = true;
        var res = this.linearCandidates(fx - pan.x - sptaglio, pan.y, tx);
        if (res.length == 0) {
            var b = new Barra(fx, pan.y)
            b.add(pan, 0, 0);
            bx.push(b);
        } else {
            for (var rr of res) {
                var b = new Barra(fx, pan.y)
                b.add(pan, 0, 0)
                for (var r of rr) {
                    b.add(r, 0, 0)
                }
                bx.push(b);
            }
        }
    }
}

