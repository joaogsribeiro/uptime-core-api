export default (req, res, next) => {
  // O papel (Role) foi injetado pelo authMiddleware
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Acesso negado. Esta rota é exclusiva para administradores.' 
    });
  }

  return next();
};