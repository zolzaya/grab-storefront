import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

import { useLoaderData, useActionData, Form, Link } from "@remix-run/react";
import { SfButton, SfIconDelete } from "@storefront-ui/react";
import { shopApiRequest } from "~/lib/graphql";
import { GET_ACTIVE_ORDER, REMOVE_ORDER_LINE, ADJUST_ORDER_LINE } from "~/lib/queries";
import { Order, RemoveOrderLineResult, AdjustOrderLineResult } from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Shopping Cart - Your Store" },
    { name: "description", content: "Review your shopping cart" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { activeOrder } = await shopApiRequest<{ activeOrder: Order | null }>(
      GET_ACTIVE_ORDER
    );
    
    return ({ activeOrder });
  } catch (error) {
    console.error('Failed to load cart:', error);
    return ({ activeOrder: null });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("_action") as string;

  try {
    if (action === "remove") {
      const orderLineId = formData.get("orderLineId") as string;
      const result = await shopApiRequest<RemoveOrderLineResult>(
        REMOVE_ORDER_LINE,
        { orderLineId }
      );

      if ('errorCode' in result.removeOrderLine) {
        return ({ error: result.removeOrderLine.message });
      }

      return ({ success: true, order: result.removeOrderLine });
    } 
    
    if (action === "adjust") {
      const orderLineId = formData.get("orderLineId") as string;
      const quantity = parseInt(formData.get("quantity") as string);

      if (quantity < 1) {
        return ({ error: "Quantity must be at least 1" });
      }

      const result = await shopApiRequest<AdjustOrderLineResult>(
        ADJUST_ORDER_LINE,
        { orderLineId, quantity }
      );

      if ('errorCode' in result.adjustOrderLine) {
        return ({ error: result.adjustOrderLine.message });
      }

      return ({ success: true, order: result.adjustOrderLine });
    }

    return ({ error: "Invalid action" });
  } catch (error) {
    console.error('Cart action failed:', error);
    return ({ error: "Action failed. Please try again." });
  }
}

export default function Cart() {
  const { activeOrder } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  if (!activeOrder || activeOrder.lines.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart</h1>
          <p className="text-gray-600 mb-8">Your cart is empty</p>
          <Link to="/products">
            <SfButton size="lg">Continue Shopping</SfButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {actionData && 'error' in actionData && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{actionData.error}</p>
        </div>
      )}

      {actionData && 'success' in actionData && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">Cart updated successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Items in your cart</h2>
        </div>

        <div className="divide-y">
          {activeOrder.lines.map((line) => (
            <div key={line.id} className="p-6 flex items-center space-x-4">
              {/* Product Image */}
              <div className="flex-shrink-0 w-20 h-20">
                {line.productVariant.product.featuredAsset ? (
                  <img
                    src={line.productVariant.product.featuredAsset.preview + '?preset=thumb'}
                    alt={line.productVariant.product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/products/${line.productVariant.product.slug}`}
                  className="text-lg font-medium text-gray-900 hover:text-blue-600"
                >
                  {line.productVariant.product.name}
                </Link>
                {line.productVariant.name !== line.productVariant.product.name && (
                  <p className="text-sm text-gray-600">{line.productVariant.name}</p>
                )}
                <p className="text-sm text-gray-500">SKU: {line.productVariant.sku}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatPrice(line.productVariant.priceWithTax)}
                </p>
              </div>

              {/* Quantity */}
              <div className="flex-shrink-0">
                <Form method="post" className="flex items-center space-x-2">
                  <input type="hidden" name="_action" value="adjust" />
                  <input type="hidden" name="orderLineId" value={line.id} />
                  <button
                    type="submit"
                    name="quantity"
                    value={line.quantity - 1}
                    disabled={line.quantity <= 1}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{line.quantity}</span>
                  <button
                    type="submit"
                    name="quantity"
                    value={line.quantity + 1}
                    className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                  >
                    +
                  </button>
                </Form>
              </div>

              {/* Line Total */}
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(line.linePriceWithTax)}
                </p>
              </div>

              {/* Remove Button */}
              <div className="flex-shrink-0">
                <Form method="post">
                  <input type="hidden" name="_action" value="remove" />
                  <input type="hidden" name="orderLineId" value={line.id} />
                  <button
                    type="submit"
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Remove item"
                  >
                    <SfIconDelete />
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Subtotal ({activeOrder.totalQuantity} items):</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(activeOrder.totalWithTax)}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link to="/products">
              <SfButton variant="secondary" size="lg">
                Continue Shopping
              </SfButton>
            </Link>
            <SfButton size="lg">
              Proceed to Checkout
            </SfButton>
          </div>
        </div>
      </div>
    </div>
  );
}