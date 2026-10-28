import { gradientFor } from "@/lib/gradients";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";

interface AvatarPlaceholderProps {
    name: string;
    seed: string;
    /** Pass a picture URL here once profile pictures exist. */
    src?: string | null;
    className?: string;
}

const AvatarPlaceholder = ({ name, seed, src, className }: AvatarPlaceholderProps) => {
    if (src) {
        return <img src={src} alt={`Profile picture of ${name}`} className={cn("rounded-full object-cover", className)} />;
    }

    const initials = name.trim().slice(0, 2).toUpperCase();

    return (
        <div
            aria-hidden
            className={cn(
                "flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-md",
                gradientFor(seed),
                className,
            )}
        >
            {initials || <UserRound className="size-1/2" />}
        </div>
    );
};

export default AvatarPlaceholder;