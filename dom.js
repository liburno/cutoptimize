var getel = name => document.getElementById(name)
var getStorage = (el, def = null) => {
    var x = localStorage.getItem(el);
    return x ? JSON.parse(x) : def;
}
var setStorage = (el, v) => localStorage.setItem(el, JSON.stringify(v))
var curpage = 0;
var liste = {
    nome: '.lastdata',
    list: []
}

var esempio = `
!sps=8
!2550x1250

#P15 = 24 
!3050x1800 =5
!1000x1000=1

935 x 120 = 2 
550 x 120 = 2 

#P8 = 24
950 x 550 = 1 
950 x 520 = 3 

#R19 = 8
1000 x 600 = 2 
600 x 600 = 2 
1000 x 580 = 1 
1000 x 250 = 1 
1000 x 200 = 1 
1000 x 130 = 1 
1000 x 80 = 2 
`
function parseDati(dati) {
    var res = {
        sps: 0,
        fx: 3000,
        fy: 2000,
        fogli: [],
        tagli: [],
    }
    var vv = dati.split(/\r?\n\r?/);
    var sgr = new Set();
    var gr = ""
    var rq = 1;
    for (var v of vv) {
        r = /^\!sps[\s=]([\d\.]+)/gim.exec(v);
        if (r) {
            res.sps = parseFloat(r[1]);
        } else {
            var r = /^\s*(\!)?([\d\.]+)\s*[x\*]\s*([\d\.]+)\s*\=?\s*([\d\.]+)?\s*(.*)$/gim.exec(v);
            if (r) {
                if (r[1] == '!') {
                    if (gr) {
                        res.fogli.push({ gr, x: parseFloat(r[2]), y: parseFloat(r[3]), n: parseInt(r[4] || 50), cm: r[5] });
                    } else {
                        res.fx = parseFloat(r[2]);
                        res.fy = parseFloat(r[3])
                    }
                } else {
                    if (gr)
                        res.tagli.push({ gr, x: parseFloat(r[2]), y: parseFloat(r[3]), n: parseInt(r[4] || 1), rq: rq, cm: r[5] });
                }
            } else {
                r = /^\s*#(\w+)(\s*=\s*(\d+))?(.*)$/gim.exec(v);
                if (r) {
                    rq = 1;
                    if (r[3]) rq = parseInt(r[3])
                    if (!rq) rq = 1;
                    gr = (r[1] || '0').toUpperCase();
                    sgr.add(gr);
                }
            }
        }
    }
    sgr = [...sgr];
    for (var gr of sgr) {
        var f = res.fogli.filter(a => a.gr == gr);
        if (f.length == 0) {
            res.fogli.push({ gr, x: res.fx, y: res.fy, n: 50, cm: '#auto' })
        }
    }
    return res;
}
function datiString(res) {
    res.tagli = res.tagli.sort((a, b) => {
        if (a.gr < b.gr) return -1;
        if (a.gr > b.gr) return 1;
        if (a.rq != b.rq) return b.rq - a.rq;
        return b.x + b.y * 1000 - a.x - a.y * 1000;

    })
    var r2 = [];
    var gr = '', rq = 1;
    r2.push(`!sps = ${res.sps}`);
    r2.push(`!${res.fx} x ${res.fy}`);

    for (var x of res.tagli) {
        if (x.gr != gr || rq != x.rq) {
            if (gr) r2.push('');
            gr = x.gr;
            rq = x.rq;
            r2.push(rq > 1 ? `#${gr} = ${rq}` : `#${gr}`);
            var ff = res.fogli.filter(a => a.gr == gr && a.cm != '#auto');
            for (var f of ff) {
                if (f.n != 50 && f.n > 1) {
                    r2.push(`!${f.x} x ${f.y} = ${f.n} ${x.cm}`);
                } else {
                    r2.push(`!${f.x} x ${f.y} ${x.cm}`);
                }
            }



        }
        r2.push(`${x.x} x ${x.y} = ${x.n} ${x.cm}`);

    }
    return r2.join('\n');
}

function showliste() {
    var el = getel("liste");
    console.log("showliste", el);
    el.innerHTML = "";
    if (!liste.list.includes(".lastdata")) liste.list.unshift(".lastdata");
    for (var x of liste.list) {
        console.log("x=", x);
        el.appendChild(new Option(x));
    }
    el.value=liste.nome;
}

function getinidata() {
    liste = getStorage(".liste", liste);
    getel("dati").value = getStorage(liste.nome, esempio);
    getel("nome").value = liste.nome;
    showliste();
}
function menuset(n) {
    if ((n == 1) && !ott) n = 0;
    curpage = n;

    for (var i = 0; i < 4; i++) {
        var el = getel(`pag${i}`);
        el.style.display = i == n ? "block" : "none"
    }
}

function btsalva() {
    var nome = getel("nome").value;
    nome = (nome || '.lastdata').trim().toLowerCase();
    if (nome == '.liste') return;

    var tm = parseDati(getel("dati").value);
    if (tm.fogli.length == 0 && tm.tagli.length == 0) {
        // cancella voce
        localStorage.removeItem(nome);
        liste.list = liste.list.filter(a => a != nome)
        liste.nome=".default";
    } else {
        if (!liste.list.includes(nome)) {
            liste.list.push(nome);
            liste.list.sort()
        }
        liste.nome = nome;
        getel("nome").value = nome;
        setStorage(nome, getel("dati").value);
    }
    setStorage(".liste", liste);
    showliste();
}
function btottimizza() {
    var tm = parseDati(getel("dati").value);
    console.log(tm);
    ott = new Ott(tm);
    checksize();
    ott.ottimizza();
    menuset(1);
}

function btcarica() {
    var nome = getel("liste").value;
    if (nome) {
        getel("nome").value = nome;
        liste.nome = nome;
        setStorage(".liste", liste);
        getel("dati").value = getStorage(liste.nome, esempio);
    }

}