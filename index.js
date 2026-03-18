const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

// app.get("/resurse/css/general.css", function(req, res){
//     res.sendFile(path.join(__dirname, "/resurse/css/general.css"));
// });

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get("/", function(req, res){
    //res.sendFile(path.join(__dirname, "index.html"));
    res.render("pagini/index");
});
//deoarece pe linux ar trebui backslash


// app.get("/cale/:a/:b", function(req, res){
//     console.log(parseInt(req.params.a)+parseInt(req.params.b));
//     res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
// })

app.get("/:a/:b", function(req, res){
    console.log(parseInt(req.params.a)+parseInt(req.params.b));
    res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
})

app.get("/cale", function(req, res){
    console.log("S-a accesat ruta /cale");
    res.send("Raspuns pentru <b style='color:red;'>ruta</b> /cale");
})



app.get("/cale2", function(req, res){
    res.write("123");
    res.write("456");
    res.end();
})


app.listen(8080);
console.log("Serverul a pornit!");