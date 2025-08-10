import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { logout } from "~/lib/auth"

export async function action({ request }: ActionFunctionArgs) {
  await logout(request)
  return redirect('/')
}

export async function loader() {
  return redirect('/')
}