import { useForm } from '@tanstack/react-form'
import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'
import { getSession } from '#/lib/server-auth'
import { useState } from 'react'
import { ThemeToggle } from '#/components/ThemeToggle'

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) throw redirect({ to: '/dashboard' })
  },
  component: LoginPage,
})

function LoginPage() {
  const [submitError, setSubmitError] = useState('')
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      setSubmitError('')
      const { error } = await authClient.signIn.email(value)
      if (error) {
        setSubmitError(error.message ?? 'Sign in failed. Please try again.')
        return
      }
      void navigate({ to: '/dashboard' })
    },
  })

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link
              to="/register"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Sign Up
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void form.handleSubmit()
            }}
            className="space-y-4"
            id="login-form"
          >
            <form.Field name="email">
              {(field) => (
                <div>
                  <Label htmlFor="email" className="mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="mt-1 text-sm text-destructive">
                      {field.state.meta.errors[0].message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <Label htmlFor="password" className="mb-1.5 block">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {field.state.meta.errors[0] && (
                    <p className="mt-1 text-sm text-destructive">
                      {field.state.meta.errors[0].message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-2">
          {submitError && (
            <p className="text-destructive text-sm">{submitError}</p>
          )}
          <Button
            form="login-form"
            type="submit"
            disabled={form.state.isSubmitting}
            className="w-full"
          >
            {form.state.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
