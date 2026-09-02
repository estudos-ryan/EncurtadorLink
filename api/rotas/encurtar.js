import { bancoDeDados } from "../database/bancodedados.js";
import { validarURL } from "../utils/validacaoURL.js";
import { validarDuracao } from "../utils/validarDuracao.js";
import { gerarCodigo } from "../utils/gerarCodigo.js";

export function encurtar(req, res) {
    const { url, duracao } = req.body

    const resultado = validarURL(url);
    const resultadoDuracao = validarDuracao(duracao);

    if (!resultado.valida) {
        return res.status(400).json({
            erro: resultado.erro
        });
    }

    if (!resultadoDuracao.valida) {
        return res.status(400).json({
            erro: resultadoDuracao.erro
        });
    }

    const urlOriginal = resultado.url;

    // Link encurtado + Temporario
    const momentoDaMorte = Date.now() + resultadoDuracao.duracao;

    // Chama funçaõ e transforma o ID em link curto
    const codigoCurto = gerarCodigo()

    // Salva na última linha do banco para descobre qual é o ID
    bancoDeDados.push({
        codigo: codigoCurto,
        url: urlOriginal,
        criadoEm: Date.now(),
        expira: momentoDaMorte
    });

    res.json({ urlCurta: `http://localhost:3000/${codigoCurto}` });
}