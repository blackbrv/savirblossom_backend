export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="w-full border-t border-border bg-background">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-sm ">
                <p>© {year} Savirblossom. All rights reserved.</p>

                <p className="text-muted-foreground">
                    Built with{" "}
                    <a
                        href="https://lpdev.netlify.app"
                        target="_blank"
                        rel="preload"
                        className="text-foreground font-medium"
                    >
                        Lpdev
                    </a>
                </p>
            </div>
        </footer>
    );
}
