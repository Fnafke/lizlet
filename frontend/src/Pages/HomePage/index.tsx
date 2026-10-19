import SidebarComponent from "@/components/SidebarComponent";

const HomePage = () => {
    return (
        <>
            <title>Lizlet - Home</title>
            <SidebarComponent />
            <div className="m-auto flex h-full w-full max-w-4xl flex-col items-center justify-center gap-6 px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-4">Welcome to Lizlet</h1>
                <p className="text-lg text-center text-muted-foreground mb-8">
                    Connect with your friends and enjoy the experience!
                </p>
            </div>
        </>
    )
}

export default HomePage;