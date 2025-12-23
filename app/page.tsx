import * as React from "react"
import { OpenInV0Button } from "./components/open-in-v0-button"

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
        <p className="text-muted-foreground">
          ahooks registry for distributing code using shadcn.
        </p>
      </header>
      <main className="flex flex-col flex-1 gap-8">
<a href="https://ahooks.js.org/hooks/use-request/index">ahooks</a>

        <div className="flex flex-col gap-4 border rounded-lg p-4 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              useRequest
            </h2>
            <OpenInV0Button name="useRequest" />
          </div>
          <div className="flex items-center justify-center relative">
            <code>
              pnpm dlx shadcn@latest add https://shadcn-ahooks.vercel.app/r/useRequest.json
            </code>
          </div>
        </div>
      </main>
    </div>
  )
}
