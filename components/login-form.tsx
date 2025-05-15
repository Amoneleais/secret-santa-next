"use client";

import { Label } from "@radix-ui/react-label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useActionState } from "react";
import { login, LoginState } from "@/app/(auth)/login/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, MessageCircle } from "lucide-react";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {
      success: null,
      message: "",
    }
  );

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email to receive a login link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="example@mail.com"
                required
              />
            </div>
            {state.success === true && (
              <Alert className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 !text-green-600" />
                <AlertTitle className="text-gray-50">Email sent!</AlertTitle>
                <AlertDescription>
                  Just sent you a login link! Check your inbox to get started.
                </AlertDescription>
              </Alert>
            )}
            {state.success === false && (
              <Alert className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 !text-red-600" />
                <AlertTitle className="text-gray-50">Error!</AlertTitle>
                <AlertDescription>
                  Hmm, that didn’t work. Try checking your email again or
                  request a new login link.
                </AlertDescription>
              </Alert>
            )}
            <Button type="submit">
              {pending && <Loader2 className="animate-spin" />}Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
