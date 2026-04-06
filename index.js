const express= require("express");
const fs=require("fs");
const path= require("path");
const sass=require("sass");


app= express();
app.set("view engine", "ejs")

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

// app.get("/resurse/css/general.css", function(req, res){
//     res.sendFile(path.join(__dirname, "/resurse/css/general.css"));
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
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut);
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
    res.render("pagini/index",{ip:req.ip})
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
