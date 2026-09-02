import express from "express";

import { encurtar } from "./rotas/encurtar.js";
import { codigo } from "./rotas/codigo.js";
import { limiteEncurtar } from "./utils/rateLimit.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

// Rota POST que recebe a URL do site
app.post("/encurtar", limiteEncurtar, encurtar);

// Rota que faz o redirecionamento
app.get("/:codigo", codigo);

app.listen(3000, () => {
    console.log(`http://localhost:3000`);
});