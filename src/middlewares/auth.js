import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  // O cabeçalho vem no formato "Bearer <token>"
  const [, token] = authHeader.split(' ');

  try {
    // Decodifica e valida a assinatura do token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Injeta os dados do usuário dentro da requisição (req)
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Permite que o fluxo continue para o Controller
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};