import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";

import { useLoaderData, Link } from "@remix-run/react";
import { shopApiRequest } from "~/lib/graphql";
import { GET_COLLECTIONS } from "~/lib/queries";
import { CollectionList } from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Collections - Your Store" },
    { name: "description", content: "Browse our product collections" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { collections } = await shopApiRequest<{ collections: CollectionList }>(
      GET_COLLECTIONS,
      { options: {} }
    );
    
    return ({ collections });
  } catch (error) {
    console.error('Failed to load collections:', error);
    return ({ collections: { items: [] } });
  }
}

export default function Collections() {
  const { collections } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Collections</h1>

      {collections.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.items.map((collection) => (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              className="group block bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {collection.featuredAsset ? (
                  <img
                    src={collection.featuredAsset.preview + '?preset=medium'}
                    alt={collection.name}
                    className="w-full h-48 object-cover group-hover:opacity-75 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {collection.name}
                </h3>
                {collection.description && (
                  <p className="text-gray-600 line-clamp-3">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No collections found</p>
          <p className="text-gray-400">
            Collections will appear here once they are created in your Vendure backend
          </p>
        </div>
      )}
    </div>
  );
}