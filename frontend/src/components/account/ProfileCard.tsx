import AvatarPlaceholder from "@/components/account/AvatarPlaceholder";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { gradientFor } from "@/lib/gradients";
import { cn } from "@/lib/utils";
import type { Account } from "@/types/account";
import { CalendarDays, Camera, Mail, PencilLine, ShieldCheck } from "lucide-react";

const ProfileCard = ({ account }: { account: Account }) => {
    const role = account.role.charAt(0).toUpperCase() + account.role.slice(1).toLowerCase();

    return (
        <Card className="overflow-hidden pt-0">
            <div className={cn("h-28 bg-gradient-to-br", gradientFor(account.id))} />

            <div className="space-y-5 px-6 pb-6">
                <div className="-mt-12 flex items-end justify-between">
                    <div className="relative">
                        <AvatarPlaceholder
                            name={account.username}
                            seed={`${account.id}-avatar`}
                            className="size-24 text-3xl ring-4 ring-card"
                        />
                        <button
                            type="button"
                            disabled
                            title="Profile pictures are coming soon"
                            aria-label="Change profile picture (coming soon)"
                            className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm disabled:cursor-not-allowed"
                        >
                            <Camera className="size-4" />
                        </button>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                        <ShieldCheck className="size-3" /> {role}
                    </Badge>
                </div>

                <div className="space-y-1">
                    <h2 className="break-words text-2xl font-bold tracking-tight">{account.username}</h2>
                    <p className="flex items-center gap-2 break-all text-sm text-muted-foreground">
                        <Mail className="size-4 shrink-0" /> {account.email}
                    </p>
                </div>

                <dl className="space-y-3 border-t pt-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                        <dt className="flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="size-4" /> Member since
                        </dt>
                        <dd className="font-medium">{formatDate(account.createdAt)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <dt className="flex items-center gap-2 text-muted-foreground">
                            <PencilLine className="size-4" /> Last updated
                        </dt>
                        <dd className="font-medium">{formatDate(account.updatedAt)}</dd>
                    </div>
                </dl>
            </div>
        </Card>
    );
};

export default ProfileCard;