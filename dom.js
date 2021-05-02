var getel=name=> document.getElementById(name)
var getStorage=(el,def=null) =>{
    var x=localStorage.getItem(el);
    return x?JSON.parse(x):def;
}
var setStorage=(el,v)=>localStorage.setItem(el,JSON.stringify(v))
var curpage=0;

function parseDati(dati) {
    var res=[]
    var vv=dati.split(/\r?\n\r?/);
    var gr="0"
    for (var v of vv) {
        var r=/^\s*([\d\.]+)\s*x\s*([\d\.]+)\s*\=?\s*([\d\.]+)?\s*(.*)$/gim.exec(v);
        if (r) {
            res.push({gr,x:parseFloat(r[1]),y:parseFloat(r[2]),n:parseInt(r[3] || 1),cm:r[4]});
        } else {
            r=/^\s*#(\w+)/gim.exec(v);
            if (r) gr=(r[1] || '0').toUpperCase();
    
        }
    }
    return res;   
}
function datiString(res) {
    res=res.sort((a,b)=>{
        if (a.gr<b.gr) return -1;
        if (a.gr>b.gr) return 1;
        return b.x+b.y*1000-a.x-a.y*1000;
        
    })
    var r2=[];
    var gr=''
    for (var x of res) {
        if (x.gr!=gr) {
            if (gr) r2.push('');
            gr=x.gr;
            r2.push(`#${gr}`)
        }
        r2.push(`${x.x} x ${x.y} = ${x.n} ${x.cm}`);
    
    }
    return r2.join('\n');
}


function menuset(n) {
    if ((n==1 || n==2) && !ott) n=0;
    curpage=n;

    for (var i=0;i<4;i++) {
        var el=getel(`pag${i}`);
        el.style.display=i==n?"block":"none"
    }
}
function getdati() {
    return {
        sptaglio:getel("spessore").value,
        fogli:getel("fogli").value,
        tagli:getel("tagli").value
    }

}

function btverifica() {
    var tm=getdati() 
    tm.tagli=datiString(parseDati(tm.tagli));
    tm.fogli=datiString(parseDati(tm.fogli));
    tm.sptaglio=tm.sptaglio || 8;
    getel("spessore").value=tm.sptaglio;
    getel("fogli").value=tm.fogli;
    getel("tagli").value=tm.tagli
    setStorage("lastdata",tm);
}

function btottimizza() {
    var tm=getdati();
    tm.tagli=parseDati(tm.tagli);
    tm.fogli=parseDati(tm.fogli);
    tm.sptaglio=parseFloat(tm.sptaglio);
    ott=new Ott(tm);
    checksize();
    ott.ottimizza();
    menuset(1);

}