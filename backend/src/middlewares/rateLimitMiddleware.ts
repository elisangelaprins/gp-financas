import { rateLimit } from 'express-rate-limit';

// Configura o rate limiting por IP para proteger a API. Em ambientes de produção multi-instância,
// este middleware pode ser facilmente integrado a um store do Redis para compartilhar o estado.

export const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 50,
    message: { error: "Limite de requisições excedido. Tente novamente mais tarde." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    limit: 10,
    message: { error: "Limite de requisições excedido. Tente novamente mais tarde." },
    standardHeaders: 'draft-7',
    legacyHeaders: false,

});