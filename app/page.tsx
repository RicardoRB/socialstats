import Link from "next/link";
import {Button} from "@/components/ui/button";
import {getSession} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
    const session = await getSession();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header
                className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-xl font-bold tracking-tight">Social Sync</span>
                        </Link>
                    </div>
                    <nav className="flex items-center gap-4">
                        {session ? (
                            <Button asChild variant="default">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild variant="default">
                                <Link href="/login">Login or Sign Up</Link>
                            </Button>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                    Sync Your Social Presence Effortlessly
                                </h1>
                                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                                    Manage all your social media accounts in one place. Track metrics, schedule posts,
                                    and grow your audience with Social Sync.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                                {session ? (
                                    <Button asChild size="lg">
                                        <Link href="/dashboard">Go to Dashboard</Link>
                                    </Button>
                                ) : (
                                    <Button asChild size="lg">
                                        <Link href="/login">Get Started for Free</Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" size="lg">
                                    <Link href="#features">Learn More</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Unified Analytics</h3>
                                <p className="text-muted-foreground">
                                    See how you're performing across all platforms with our consolidated dashboard.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                                        <line x1="16" x2="16" y1="2" y2="6"/>
                                        <line x1="8" x2="8" y1="2" y2="6"/>
                                        <line x1="3" x2="21" y1="10" y2="10"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Smart Scheduling</h3>
                                <p className="text-muted-foreground">
                                    Schedule your content to be posted at the optimal time for maximum engagement.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-6 w-6"
                                    >
                                        <path d="m8 3 4 8 5-5 5 15H2L8 3z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold">Growth Insights</h3>
                                <p className="text-muted-foreground">
                                    Get actionable insights on how to improve your reach and engagement.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                            Built by Social Sync Inc. &copy; {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
