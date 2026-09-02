import crypto from "node:crypto";

const CARACTERES = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const TAMANHO_CODIGO = 5;

export function gerarCodigo() {
    let codigo = "";

    for (let i = 0; i < TAMANHO_CODIGO; i++) {
        const indice = crypto.randomInt(0, CARACTERES.length);

        codigo += CARACTERES[indice];
    }

    return codigo;
}
