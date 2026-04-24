const express= require("express");
const fs=require("fs");
const path= require("path");
const sass=require("sass");
const sharp = require("sharp");

const ejs=require('ejs');
const pg = require("pg");


app= express();
app.set("view engine", "ejs")

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/CSS"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

client=new pg.Client({
     database:"cti_2026",
     user:"valentina",
     password:"valentina",
     host:"localhost", //daca siteul era hostat pe un server, aici trebuia sa punem ip-ul serverului sau numele de domeniu
     port:5432 
 })

client.connect() //asta transmite datele

client.query("select * from prajituri where id>3", function(err, rez){
    if(err){
        console.log(rez);
    }
})



let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

// app.get("/resurse/css/general.css", function(req, res){
//     res.sendFile(path.join(__dirname, "/resurse/CSS/general.css"));
// });

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"));
});

// app.get("/", function(req, res){
//     //res.sendFile(
// __dirname, "index.html"));
//     res.render("pagini/index")
//     // ,{
//     //     ip: req.ip,
//     //     imagini: obGlobal.obImagini.imagini
//     // };
// });
// //deoarece pe linux ar trebui backslash


// app.get("/cale/:a/:b", function(req, res){
//     console.log(parseInt(req.params.a)+parseInt(req.params.b));
//     res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
// })

// app.get("/:a/:b", function(req, res){
//     console.log(parseInt(req.params.a)+parseInt(req.params.b));
//     res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
// })


// app.get("/cale", function(req, res){
//     console.log("S-a accesat ruta /cale");
//     res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
// })



app.get("/cale2", function(req, res){
    res.write("123");
    res.write("456");
    res.end();
})


function initErori(){
//bonus A
    let caleJson = path.join(__dirname, "resurse/json/erori.json");
    if (!fs.existsSync(caleJson)) {
        console.error("EROARE CRITICĂ");
        console.error(`Fișierul obligatoriu 'erori.json' NU a fost găsit la calea: ${caleJson}`);
        console.error("Aplicația se va închide deoarece nu poate funcționa fără managementul erorilor.");
        
        process.exit(1); // inchide aplicatia cu un cod de eroare
    }


    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");


//bonus F
    function verificaDuplicate(text) {
        //cautam daca intre {} apare aceeasi cheie
        let regexObiecte = /\{([\s\S]*?)\}/g;
        let match;
        while ((match = regexObiecte.exec(text)) !== null) {
            let interiorObiect = match[1];
            let regexChei = /"([^"]+)"\s*:/g;
            let chei = [];
            let matchCheie;
            while ((matchCheie = regexChei.exec(interiorObiect)) !== null) {
                let numeCheie = matchCheie[1];
                if (chei.includes(numeCheie)) {
                    console.error(`EROARE JSON (String): Proprietatea '${numeCheie}' este duplicată în același obiect!`);
                }
                chei.push(numeCheie);
            }
        }
    }
    verificaDuplicate(continut);



    let erori=obGlobal.obErori=JSON.parse(continut);

//bonus B
    if (!erori.cale_baza) {
        console.error("EROARE CONFIGURARE: Lipsește proprietatea 'cale_baza' din erori.json");
    }
    if (!erori.eroare_default) {
        console.error("EROARE CONFIGURARE: Lipsește proprietatea 'eroare_default' din erori.json");
    }
    if (!erori.info_erori || !Array.isArray(erori.info_erori)) {
        console.error("EROARE CONFIGURARE: Lipsește vectorul 'info_erori' din erori.json");
    }

//bonus C
    if (erori.eroare_default) {
        let prop_obligatorii = ["titlu", "text", "imagine"];
        for (let prop of prop_obligatorii) {
            if (!erori.eroare_default.hasOwnProperty(prop)) {
                console.error(`EROARE CONFIGURARE: În eroare_default lipsește proprietatea: '${prop}'`);
            }
        }
    }

//bonus D
    if (erori.cale_baza) {
        let caleFolderImagini = path.join(__dirname, erori.cale_baza);
        if (!fs.existsSync(caleFolderImagini)) {
            console.error(`EROARE SISTEM: Folderul specificat în cale_baza nu există: ${caleFolderImagini}`);
        }
    }

//bonus E
    if (erori.cale_baza) {
        if (erori.eroare_default && erori.eroare_default.imagine) {
            let caleImgDefault = path.join(__dirname, erori.cale_baza, erori.eroare_default.imagine);
            if (!fs.existsSync(caleImgDefault)) {
                console.error(`EROARE IMAGINE: Imaginea default '${erori.eroare_default.imagine}' nu există la calea: ${caleImgDefault}`);
            }
        }
        if (erori.info_erori) {
            for (let eroare of erori.info_erori) {
                if (eroare.imagine) {
                    let caleImgEroare = path.join(__dirname, erori.cale_baza, eroare.imagine);
                    if (!fs.existsSync(caleImgEroare)) {
                        console.error(`EROARE IMAGINE: Imaginea pentru eroarea ${eroare.identificator} ('${eroare.imagine}') nu există la calea: ${caleImgEroare}`);
                    }
                }
            }
        }
    }

//bonus G
    if (erori.info_erori) {
            let idsVazute = [];
            for (let i = 0; i < erori.info_erori.length; i++) {
                let e1 = erori.info_erori[i];
                
                for (let j = i + 1; j < erori.info_erori.length; j++) {
                    let e2 = erori.info_erori[j];
                    
                    if (e1.identificator == e2.identificator && !idsVazute.includes(e1.identificator)) {
                        console.error(`EROARE CONFIGURARE: Identificatorul ${e1.identificator} este folosit de mai multe ori!`);
                        console.log(`Detalii erori conflictuale:`);
                        console.log(`Eroare A: {titlu: ${e1.titlu}, text: ${e1.text}, imagine: ${e1.imagine}}`);
                        console.log(`Eroare B: {titlu: ${e2.titlu}, text: ${e2.text}, imagine: ${e2.imagine}}`);
                        idsVazute.push(e1.identificator);
                        }
                }
            }
        }


    let err_default=erori.eroare_default;
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine);
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine);
    }

}
initErori()

function afisareEroare(res,identificator,titlu,text,imagine){
    let eroare = obGlobal.obErori.info_erori.find((elem) => elem.identificator==identificator);
    if(eroare?.status) //?. verifica si returneaza proprietatea
        res.status(eroare.identificator);
    let errDefault=obGlobal.obErori.eroare_default;
     res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
        ip: res.req.ip
    });
}


app.get("/eroare", function(req,res){
   afisareEroare(res,404,"Pagina nu a fost gasita!");
});


app.get(["/", "/index","/home"], function(req, res){
    let d = new Date();
    let minute = d.getMinutes();
    let sfertCurent = Math.floor(minute / 15) + 1;
    let imaginiSfert = obGlobal.obImagini.imagini.filter((img) => img.sfert_ora == sfertCurent);
    let imaginiAfisate = imaginiSfert.slice(0, 10);
    res.render("pagini/index", {
        ip: req.ip,
        imagini: imaginiAfisate
    });
});



app.get("/produse", function(req, res){
    clauzaWhere=""
    if(req.query.tip){
        clauzaWhere=`where tip_produs='${req.query.tip}'`
    }
    client.query(`select * from prajituri ${clauzaWhere}`, function(err, rez){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            console.log(rez);//doar serverul vede console.log, nu si utilizatorul
            res.render("pagini/produse", {
                produse: rez.rows,
                optiuni:{}
            });
        }
    });
});



app.get("/produs/:id", function(req, res){
    if(req.query.tip){
        clauzaWhere=`where tip_produs='${req.query.tip}'`
    }
    client.query(`select * from prajituri where id=${req.params.id}`, function(err, rez){
        if(err){
            console.log(err);
            afisareEroare(res, 2);
        }
        else{
            if(rez.rowCount==0){
                afisareEroare(res,404,"Produs inexistent");
            }
            else{
            res.render("pagini/produs", {
                prod: rez.rows[0]
            });
            }
        }
    });
});



app.get("/galerie", function(req, res){
    let d = new Date();
    let minute = d.getMinutes();
    let sfertCurent = Math.floor(minute / 15) + 1;
    let imaginiSfert = obGlobal.obImagini.imagini.filter((img) => img.sfert_ora == sfertCurent);
    let imaginiAfisate = imaginiSfert.slice(0, 10);

    res.render("pagini/galerie-statica", {
        imagini: imaginiAfisate
    });
});

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");
    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie;

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    let caleAbsMic=path.join(caleAbs, "mic");

    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic)) fs.mkdirSync(caleAbsMic);
    
    for (let imag of vImagini){

        let numeFisExt = imag.cale_imagine; //cale_imagine din galerie.json
        let parti = numeFisExt.split(".");
        let numeFis = parti[0];

        let caleFisAbs = path.join(caleAbs, numeFisExt);
        
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis+".webp");

        if (!fs.existsSync(caleFisMediuAbs)) {
            sharp(caleFisAbs).resize(400).toFile(caleFisMediuAbs);
        }
        if (!fs.existsSync(caleFisMicAbs)) {
            sharp(caleFisAbs).resize(200).toFile(caleFisMicAbs);
        }

        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis+".webp").replace(/\\/g, '/');
        imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis+".webp").replace(/\\/g, '/');
        imag.cale_imagine_absoluta = path.join("/", caleGalerie, numeFisExt).replace(/\\/g, '/');
    }
}
initImagini();


function compileazaScss(caleScss, caleCss) {
    try {
        let caleAbsScss = path.isAbsolute(caleScss) ? caleScss : path.join(obGlobal.folderScss, caleScss);
        
        let numeFisExt = path.basename(caleAbsScss); //stil.scss
        let numeFis = numeFisExt.split(".")[0];      //stil

        let caleAbsCss;
        if (!caleCss) {
            caleAbsCss = path.join(obGlobal.folderCss, numeFis + ".css");
        } else {
            caleAbsCss = path.isAbsolute(caleCss) ? caleCss : path.join(obGlobal.folderCss, caleCss);
        }

        let folderBackupCss = path.join(obGlobal.folderBackup, "resurse/CSS");
        if (!fs.existsSync(folderBackupCss)) {
            fs.mkdirSync(folderBackupCss, { recursive: true });
        }

        if (fs.existsSync(caleAbsCss)) {
            try {
                let timpCurent = new Date().getTime();
                let numeFisBackup = numeFis + "_" + timpCurent + ".css";
                
                fs.copyFileSync(caleAbsCss, path.join(folderBackupCss, numeFisBackup));
            } catch (errBackup) {
                console.error("EROARE BACKUP: Nu s-a putut face backup pentru fișierul: " + caleAbsCss);
                console.error(errBackup);
            }
        }

        let rez = sass.compile(caleAbsScss, { sourceMap: true });
        fs.writeFileSync(caleAbsCss, rez.css);
        console.log(`[SCSS] Compilare realizată cu succes pentru: ${numeFisExt}`);

    } catch (err) {
        console.error(`[EROARE SCSS] A apărut o problemă la compilarea: ${caleScss}`);
        console.error(err.message);
    }
}


let fisiereScss = fs.readdirSync(obGlobal.folderScss);
for (let fis of fisiereScss) {
    if (path.extname(fis) === ".scss") {
        compileazaScss(fis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis) {
    if (numeFis && path.extname(numeFis) === ".scss") {
        if (eveniment === "change" || eveniment === "rename") {
            let caleCompletaScss = path.join(obGlobal.folderScss, numeFis);
            
            if (fs.existsSync(caleCompletaScss)) {
                console.log(`[WATCH SCSS] Modificare detectată la ${numeFis}. Recompilăm...`);
                compileazaScss(caleCompletaScss);
            }
        }
    }
});


app.get("/*pagina",function(req,res){
    console.log("cale pagina",req.url);
    if(req.url.startsWith ("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if(path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
    res.render("pagini"+req.url,function(err,rezRandare){
        if(err){
            if(err.message.includes("Failed to lookup view")){
                afisareEroare(res,404);
                return; //iese din functie
            }
            afisareEroare(res);
            return;
        }
        res.send(rezRandare);
        console.log("Randare:",rezRandare);
    });
}
catch(err){
    if (err.message.includes("Cannot find module")){
        afisareEroare(res,404);
        return;
    }
    afisareEroare(res);
    return;
}
})

app.listen(8080);
console.log("Serverul a pornit!");
