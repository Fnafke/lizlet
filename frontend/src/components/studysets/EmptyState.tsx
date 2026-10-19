import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
    title: string;
    description: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
            <Layers className="size-7" />
        </div>
        <div className="space-y-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild>
            <Link to="/study-sets/new">
                <Plus /> Create a set
            </Link>
        </Button>
    </div>
);

export default EmptyState;