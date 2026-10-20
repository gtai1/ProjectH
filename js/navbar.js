function highlightActiveNavLink() {
    const currentPath =
        window.location.pathname.replace(/\/+$/, "") || "/";

    document.querySelectorAll("#navbar nav a").forEach(link => {
        const linkPath =
            new URL(link.href).pathname.replace(/\/+$/, "") || "/";

        if (linkPath === currentPath) {
            link.classList.add("active");
        }
    });
}

highlightActiveNavLink();
