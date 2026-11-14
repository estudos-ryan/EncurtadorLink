import { put, head, del } from "@vercel/blob";
import express from "express";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.static("public"));

const limiterCriacao = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { erro: "Muitas requisições. Tente novamente em alguns minutos." },
});

function gerarCodigoBase62(tamanho = 6) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const bytes = crypto.randomBytes(tamanho);
    let codigo = "";
    for (let i = 0; i < tamanho; i++) {
        codigo += chars[bytes[i] % 62];
    }
    return codigo;
}

app.get("/encurtar", limiterCriacao, async (req, res) => {
    try {
        const urlLonga = req.query.url;
        if (!urlLonga) {
            return res.status(400).json({ erro: "Informe o parâmetro ?url=" });
        }

        let urlObj;
        try {
            urlObj = new URL(urlLonga);
        } catch {
            return res.status(400).json({ erro: "URL inválida. Inclua http:// ou https://" });
        }

        if (!["http:", "https:"].includes(urlObj.protocol)) {
            return res.status(400).json({ erro: "Apenas protocolos HTTP e HTTPS são permitidos." });
        }

        const hostAtual = req.get("host");
        if (urlObj.host === hostAtual) {
            return res.status(400).json({ erro: "Não é possível encurtar uma URL deste mesmo domínio." });
        }

        let horas = Number(req.query.tempo);
        if (isNaN(horas) || horas <= 0 || horas > 24) {
            horas = 24;
        }

        let codigo;
        let disponivel = false;
        for (let tentativas = 0; tentativas < 5; tentativas++) {
            codigo = gerarCodigoBase62(6);
            try {
                await head(`${codigo}.json`);
            } catch {
                disponivel = true;
                break;
            }
        }

        if (!disponivel) {
            return res.status(503).json({ erro: "Não foi possível gerar um código único. Tente novamente." });
        }

        const expiraEm = Date.now() + horas * 60 * 60 * 1000;
        const dados = { id: codigo, url: urlObj.href, expiraEm };

        await put(`${codigo}.json`, JSON.stringify(dados), {
            access: "public",
            addRandomSuffix: false,
            contentType: "application/json",
        });

        const protocolo = req.headers["x-forwarded-proto"] || req.protocol;
        const link_gerado = `${protocolo}://${hostAtual}/${codigo}`;

        return res.status(201).json({ link_gerado });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro interno ao salvar link" });
    }
});

app.get("/:codigo", async (req, res) => {
    try {
        const { codigo } = req.params;

        if (!/^[0-9a-zA-Z]{6}$/.test(codigo)) {
            return res.status(404).json({ erro: "Link não encontrado" });
        }

        let blobInfo;
        try {
            blobInfo = await head(`${codigo}.json`);
        } catch {
            return res.status(404).json({ erro: "Link inexistente ou expirado" });
        }

        const resposta = await fetch(blobInfo.url, { cache: "no-store" });
        if (!resposta.ok) {
            return res.status(404).json({ erro: "Link inexistente ou expirado" });
        }

        const dados = await resposta.json();

        if (Date.now() > dados.expiraEm) {
            await del(blobInfo.url).catch(() => { });
            return res.status(410).json({ erro: "Este link expirou" });
        }

        return res.redirect(302, dados.url);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: "Erro ao consultar link" });
    }
});

export default app;