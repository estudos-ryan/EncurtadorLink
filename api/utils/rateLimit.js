import rateLimit from "express-rate-limit";

export const limiteEncurtar = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora

    limit: 20, // máximo de 20 requisições por IP

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        erro: "Limite de requisições atingido. Tente novamente mais tarde."
    }
});
