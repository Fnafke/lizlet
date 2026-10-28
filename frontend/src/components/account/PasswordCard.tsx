// PasswordCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UserService } from "@/services/UserService";
import { assertOk, getErrorMessage } from "@/utils/apiUtils";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

const SEGMENT_COLORS = ["bg-destructive", "bg-orange-400", "bg-lime-500", "bg-emerald-500"];

function getStrength(password: string): { score: number; label: string } {
    if (!password) return { score: 0, label: "" };
    if (password.length < 10) return { score: 1, label: "Too short" };

    let score = 1;
    if (password.length >= 14) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    return { score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
}

interface PasswordFieldProps {
    id: string;
    label: string;
    value: string;
    autoComplete: string;
    onChange: (value: string) => void;
}

const PasswordField = ({ id, label, value, autoComplete, onChange }: PasswordFieldProps) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    maxLength={100}
                    className="pr-10"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
            </div>
        </div>
    );
};

const PasswordCard = () => {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const strength = getStrength(next);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!current) return setError("Enter your current password.");
        if (next.length < 10 || next.length > 100) return setError("Your new password must be 10 to 100 characters long.");
        if (next === current) return setError("Your new password must be different from the current one.");
        if (next !== confirm) return setError("The new passwords don't match.");

        setSaving(true);
        try {
            await assertOk(await UserService.changePassword(current, next));
            setCurrent("");
            setNext("");
            setConfirm("");
            setSuccess(true);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Use at least 10 characters. A longer mix of letters, numbers and symbols is stronger.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <PasswordField
                        id="current-password"
                        label="Current password"
                        value={current}
                        autoComplete="current-password"
                        onChange={setCurrent}
                    />
                    <PasswordField
                        id="new-password"
                        label="New password"
                        value={next}
                        autoComplete="new-password"
                        onChange={setNext}
                    />

                    {next && (
                        <div className="space-y-1.5">
                            <div className="flex gap-1.5">
                                {SEGMENT_COLORS.map((color, i) => (
                                    <div
                                        key={color}
                                        className={cn(
                                            "h-1.5 flex-1 rounded-full transition-colors",
                                            i < strength.score ? color : "bg-muted",
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{strength.label}</p>
                        </div>
                    )}

                    <PasswordField
                        id="confirm-password"
                        label="Confirm new password"
                        value={confirm}
                        autoComplete="new-password"
                        onChange={setConfirm}
                    />

                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {success && (
                        <p className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-4" /> Your password was updated.
                        </p>
                    )}

                    <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin" /> : <KeyRound />}
                        Update password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default PasswordCard;