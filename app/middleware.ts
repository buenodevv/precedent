import { clerkMiddleware, authMiddleware } from '@clerk/nextjs/server'

// Protege rotas específicas que requerem autenticação
export default authMiddleware({
  // Rotas que são acessíveis publicamente
  publicRoutes: [
    "/",
    "/api/(.*)" // Rotas de API públicas
  ],
  // Rotas que ignoram a autenticação
  ignoredRoutes: [
    "/api/public/(.*)"
  ]
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}