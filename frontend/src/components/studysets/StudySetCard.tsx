import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { gradientFor } from "@/lib/gradients";
import { cn } from "@/lib/utils";
import type { StudySetSummary } from "@/types/studySet";
import { Layers } from "lucide-react";
import { Link } from "react-router-dom";

const StudySetCard = ({ set }: { set: StudySetSummary }) => (
    <Link to={`/study-sets/${set.id}`} className="group block h-full">
        <Card className="h-full gap-4 overflow-hidden pt-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl">
            <div className={cn("h-2 bg-gradient-to-r", gradientFor(set.id))} />
            <CardHeader>
                <CardTitle className="line-clamp-1 text-lg">{set.title}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-10">
                    {set.description || "No description"}
                </CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
                <Badge variant="secondary" className="gap-1">
                    <Layers className="size-3" />
                    {set.cardCount} {set.cardCount === 1 ? "term" : "terms"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                    {new Date(set.updatedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </span>
            </CardFooter>
        </Card>
    </Link>
);

export default StudySetCard;