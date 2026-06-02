import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { name: '', email: '', password: '' },
    validators: { onChange: schema },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.signUp.email(value)
      if (error) {
        alert(error.message)
        return
      }
      void navigate({ to: '/dashboard' })
    },
  })

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-3xl font-bold">Create account</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void form.handleSubmit()
        }}
        className="space-y-4"
      >
        <form.Field name="name">
          {(field) => (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {field.state.meta.errors[0].message}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? 'Creating...' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
