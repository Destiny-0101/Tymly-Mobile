
document.addEventListener("DOMContentLoaded", () => {
    // Load dashboard data
async function loadDashboardData() {
    try {
        const engagements = await TymlyDB.getAllEngagements();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get upcoming engagements
        const upcomingEngagements = engagements
            .filter(engagement => {
                const engagementDate = new Date(`${engagement.date}T00:00:00`);
                return engagementDate >= today &&
                    engagement.status === "upcoming";
            })
            .sort((a, b) => {
                const dateA = `${a.date}T${a.startTime || "00:00"}`;
                const dateB = `${b.date}T${b.startTime || "00:00"}`;
                return dateA.localeCompare(dateB);
            });

        console.log("Dashboard engagements loaded:", engagements);
        console.log("Upcoming engagements:", upcomingEngagements);

    } catch (error) {
        console.error("Could not load dashboard data:", error);
    }
}

    // Dynamic greeting
    const greetingElement = document.getElementById("greeting");
    const headerDate = document.getElementById("header-date");

    const now = new Date();
    const hour = now.getHours();

    let greeting = "Good evening";

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 17) {
        greeting = "Good afternoon";
    }

    if (greetingElement) {
        greetingElement.textContent = `${greeting}, Speaker.`;
    }

    // Current date
    if (headerDate) {
        headerDate.textContent = now.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Temporary feedback for features not yet implemented
    const toast = document.getElementById("toast");
    let toastTimeout;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2500);
    }

    const featureMessages = {
        engagements: "Engagement management is our next milestone.",
        schedule: "Your schedule feature is coming next.",
        timer: "The Speaker Timer is coming soon.",
        preparation: "Preparation tools are coming soon.",
        reminders: "Reminders are coming soon.",
        settings: "Settings will be available in a future update."
    };

    document.querySelectorAll("[data-feature]").forEach(element => {
        element.addEventListener("click", event => {
            event.preventDefault();

            const feature = element.dataset.feature;
            const message = featureMessages[feature];

            if (message) {
                showToast(message);
            }
        });
    });

    // Register service worker
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", async () => {
            try {
                await navigator.serviceWorker.register("./service-worker.js");
                console.log("Tymly service worker registered.");
            } catch (error) {
                console.error("Service worker registration failed:", error);
            }
        });
    }

    console.log("Tymly Dashboard V1 initialized.");

    window.addEventListener("pageshow", () => {
    loadDashboardData();
});

});
