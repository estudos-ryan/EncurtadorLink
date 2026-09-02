import { bancoDeDados } from "../database/bancodedados.js";

export function codigo(req, res) {
    const codigo = req.params.codigo;

    // Procura no banco qual URL original tem esse código
    const registro = bancoDeDados.find(registro => registro?.codigo === codigo); // Para a comparaçaõ de tempo funcionar

    if (!registro) return res.status(404).send("Link não encontrado!");

    if (Date.now() > registro.expira) {
        return res.status(410).send(`<h1 style="text-align:center; margin-top:50px;">⏳ Ops! Este link expirou.</h1>`);
    }

    return res.redirect(registro.url);
}