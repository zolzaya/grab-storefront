import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { shopApiRequest } from './lib/graphql';
import { GET_ACTIVE_ORDER } from './lib/queries';
import { getCurrentUser } from './lib/auth';
import { Order, CurrentUser } from './lib/types';

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get current user and active order in parallel
    const [user, { activeOrder }] = await Promise.all([
      getCurrentUser(request),
      shopApiRequest<{ activeOrder: Order | null }>(
        GET_ACTIVE_ORDER,
        undefined,
        request
      )
    ]);
    
    return { activeOrder, user };
  } catch (error) {
    console.error('Failed to load root data:', error);
    return { activeOrder: null, user: null };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { activeOrder, user } = useLoaderData<typeof loader>();
  
  return (
    <>
      <Header activeOrder={activeOrder} user={user} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
