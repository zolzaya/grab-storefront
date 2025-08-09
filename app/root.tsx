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
import { Order } from './lib/types';

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
    const { activeOrder } = await shopApiRequest<{ activeOrder: Order | null }>(
      GET_ACTIVE_ORDER,
      undefined,
      request
    );
    
    return { activeOrder };
  } catch (error) {
    console.error('Failed to load active order:', error);
    return { activeOrder: null };
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
  const { activeOrder } = useLoaderData<typeof loader>();
  
  return (
    <>
      <Header activeOrder={activeOrder} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
