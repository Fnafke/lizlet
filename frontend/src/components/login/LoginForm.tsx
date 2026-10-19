import { useContext, useState } from "react"
import { LockKeyhole, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { UserService } from "@/services/UserService"
import { AuthContext } from "../context/AuthContext"
import type { AuthenticationRequest } from "@/types/types"
import { Spinner } from "../ui/spinner"
import { AuthService } from "@/services/AuthService"

const LoginForm = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [authenticationError, setAuthenticationError] = useState("")
    const [successMessage, setSuccessMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate();
    const context = useContext(AuthContext);

    const validateCredentials = () => {
        let isValid = true;
        setEmailError("");
        setPasswordError("");

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setEmailError("Please enter a valid email address.");
        isValid = false;
        }

        if (!password || password.length < 10) {
        setPasswordError("Password must be at least 10 characters long.");
        isValid = false;
        }

        return isValid;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setAuthenticationError("");

        if (!validateCredentials()) return;

        setIsSubmitting(true);

        try {
            const response = await AuthService.login(
                {email, password} as AuthenticationRequest
            );

            if (!response.ok) {
                setAuthenticationError("Invalid email or password.");
                return;
            }

            // cookie is now set — fetch the user profile and push it into context
            const meResponse = await UserService.fetchCurrentUser();

            if (!meResponse || !meResponse.ok) {
                setAuthenticationError("Logged in, but couldn't load your profile.");
                return;
            }

            const userData = await meResponse.json();
            context?.login && context.login(userData);

            setSuccessMessage("Login successful! Redirecting...");
            navigate("/");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.18)] sm:p-8">
            <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LockKeyhole className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to Lizlet</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
                </label>
                <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="h-11 pl-9"
                    autoComplete="email"
                    disabled={isSubmitting}
                />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                </label>
                {/* <a href="#" className="text-xs font-medium text-primary underline-offset-4 hover:underline">
                    Forgot password?
                </a> */}
                </div>
                <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-11"
                autoComplete="current-password"
                disabled={isSubmitting}
                />
            </div>

            {/* <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <label htmlFor="remember" className="flex items-center gap-2">
                <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-2 focus:ring-ring"
                />
                Remember me
                </label>
            </div> */}

            <Button type="submit" className="h-11 w-full rounded-2xl text-sm font-medium" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="size-4" /> : "Sign in"}
            </Button>

            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            {authenticationError && <p className="text-sm text-red-500">{authenticationError}</p>}
            {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Create one here
            </Link>
            </p>
        </div>
        </div>
    )
}

export default LoginForm;