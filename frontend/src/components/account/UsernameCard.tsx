import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserService } from "@/services/UserService";
import type { Account } from "@/types/account";
import { getErrorMessage, readJson } from "@/utils/apiUtils";
import { Loader2, Save } from "lucide-react";
import { useState, type FormEvent } from "react";

interface UsernameCardProps {
    account: Account;
    onChanged: (account: Account) => void;
}

const validate = (value: string): string | null => {
    if (value.length < 3 || value.length > 20) return "Username must be 3 to 20 characters long.";
    if (/\s/.test(value)) return "Username can't contain spaces.";
    return null;
};

const UsernameCard = ({ account, onChanged }: UsernameCardProps) => {
    const [username, setUsername] = useState(account.username);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmed = username.trim();
    const unchanged = trimmed === account.username;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const problem = validate(trimmed);
        if (problem) {
            setError(problem);
            return;
        }

        setSaving(true);
        try {
            const updated = await readJson<Account>(await UserService.changeUsername(trimmed));
            onChanged(updated);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Username</CardTitle>
                <CardDescription>
                    Your username is unique: no one else can use the same one. Changing it signs you out so you can
                    log in again.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">New username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={20}
                            autoComplete="username"
                            aria-invalid={error !== null}
                        />
                        <p className="text-xs text-muted-foreground">3 to 20 characters, no spaces.</p>
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" disabled={saving || unchanged}>
                        {saving ? <Loader2 className="animate-spin" /> : <Save />}
                        Save username
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default UsernameCard;