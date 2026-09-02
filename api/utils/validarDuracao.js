const MINIMO = 60 * 1000; // 1 minuto
const MAXIMO = 24 * 60 * 60 * 1000; // 24 horas

export function validarDuracao(valor) {
    if (valor === undefined || valor === null || valor === "") {
        return {
            valida: false,
            erro: "A duração é obrigatória."
        };
    }

    const duracao = Number(valor);

    if (!Number.isFinite(duracao)) {
        return {
            valida: false,
            erro: "A duração precisa ser um número válido."
        };
    }

    if (!Number.isInteger(duracao)) {
        return {
            valida: false,
            erro: "A duração precisa ser um número inteiro."
        };
    }

    if (duracao < MINIMO) {
        return {
            valida: false,
            erro: "A duração mínima é de 1 minuto."
        };
    }

    if (duracao > MAXIMO) {
        return {
            valida: false,
            erro: "A duração máxima é de 24 horas."
        };
    }

    return {
        valida: true,
        duracao
    };
}
