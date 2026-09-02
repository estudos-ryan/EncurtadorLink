const IP_PRIVADO_REGEX = [/^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^169\.254\./, /^0\./];

const HOSTS_BLOQUEADOS = new Set(["localhost", "localhost.localdomain", "ip6-localhost", "ip6-loopback", "0.0.0.0", "::1", "[::1]"]);

export function validarURL(valor) {
    if (typeof valor !== "string") {
        return {
            valida: false,
            erro: "A URL precisa ser um texto."
        };
    }

    const urlTexto = valor.trim();

    if (!urlTexto) {
        return {
            valida: false,
            erro: "A URL não pode estar vazia."
        };
    }

    // Evita URLs absurdamente grandes
    if (urlTexto.length > 2048) {
        return {
            valida: false,
            erro: "A URL é muito longa."
        };
    }

    let url;

    try {
        url = new URL(urlTexto);
    } catch {
        return {
            valida: false,
            erro: "URL inválida."
        };
    }

    // Aceita somente HTTP e HTTPS
    if (!["http:", "https:"].includes(url.protocol)) {
        return {
            valida: false,
            erro: "A URL precisa usar HTTP ou HTTPS."
        };
    }

    if (url.username || url.password) {
        return {
            valida: false,
            erro: "URLs com usuário ou senha não são permitidas."
        };
    }

    const hostname = url.hostname.toLowerCase();

    if (!hostname) {
        return {
            valida: false,
            erro: "A URL precisa possuir um domínio válido."
        };
    }

    // Bloqueia localhost e hosts locais
    if (HOSTS_BLOQUEADOS.has(hostname)) {
        return {
            valida: false,
            erro: "URLs locais não são permitidas."
        };
    }

    // Bloqueia IPv4 privados/reservados
    if (IP_PRIVADO_REGEX.some((regex) => regex.test(hostname))) {
        return {
            valida: false,
            erro: "Endereços IP privados ou locais não são permitidos."
        };
    }

    // Bloqueia IPv6 local
    if (hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:")) {
        return {
            valida: false,
            erro: "Endereços IPv6 locais ou privados não são permitidos."
        };
    }

    // O hostname não pode possuir espaços
    if (/\s/.test(hostname)) {
        return {
            valida: false,
            erro: "O domínio contém caracteres inválidos."
        };
    }

    // Evita hostname terminando em ponto
    if (hostname.endsWith(".")) {
        return {
            valida: false,
            erro: "Domínio inválido."
        };
    }

    // Domínio precisa possuir pelo menos um ponto,
    // exceto casos de IP que já foram tratados.
    if (!hostname.includes(".")) {
        return {
            valida: false,
            erro: "Informe um domínio válido."
        };
    }

    // Verifica tamanho máximo do hostname
    if (hostname.length > 253) {
        return {
            valida: false,
            erro: "O domínio é muito longo."
        };
    }

    // Verifica cada parte do domínio
    const partes = hostname.split(".");

    for (const parte of partes) {
        if (!parte) {
            return {
                valida: false,
                erro: "Domínio inválido."
            };
        }

        if (parte.length > 63) {
            return {
                valida: false,
                erro: "Uma parte do domínio é muito longa."
            };
        }

        // Não permite começar ou terminar com hífen
        if (parte.startsWith("-") || parte.endsWith("-")) {
            return {
                valida: false,
                erro: "Domínio inválido."
            };
        }

        // Apenas caracteres válidos em nomes DNS
        if (!/^[a-z0-9-]+$/i.test(parte)) {
            return {
                valida: false,
                erro: "O domínio contém caracteres inválidos."
            };
        }
    }

    return {
        valida: true,
        url: url.toString()
    };
}
