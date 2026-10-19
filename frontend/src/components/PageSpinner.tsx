import { Spinner } from "./ui/spinner";

export const PageSpinner = () => {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Spinner className="size-8" />
        </div>
    );
};