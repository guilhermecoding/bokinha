// import { withAuth } from 'next-auth/middleware';
// import type { NextRequest } from 'next/server';

// // Exporta um middleware válido (withAuth retorna a função esperada pelo Next.js)
// export default withAuth((req: NextRequest) => {
//   // noop: apenas usa o middleware do next-auth
// });

// export const config = {
//   // ajustar rotas a proteger; exemplo protege tudo exceto assets e /api
//   matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
// };