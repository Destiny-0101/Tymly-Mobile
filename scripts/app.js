document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // DASHBOARD DATA
    // =========================================

    const nextEmptyState = document.getElementById("next-empty-state");
    const nextDetails = document.getElementById("next-engagement-details");

    const nextTitle = document.getElementById("next-engagement-title");
    const nextDate = document.getElementById("next-engagement-date");
    const nextVenue = document.getElementById("next-engagement-venue");
    const nextTopic = document.getElementById("next-engagement-topic");

    const scheduleEmpty = document.getElementById("schedule-empty");
    const scheduleList = document.getElementById("schedule-list");


    function getEngagementDateTime(engagement) {
        if (!engagement.date) return null;

        const time = engagement.startTime || "00:00";

        const dateTime = new Date(
            `${engagement.date}T${time}:00`
        );

        return Number.isNaN(dateTime.getTime()) ? null : dateTime;
    }


    function formatDate(dateString) {
        const date = new Date(`${dateString}T00:00:00`);

        return date.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }


    function formatTime(timeString) {
        if (!timeString) return "Time not set";

        const [hours, minutes] = timeString.split(":");

        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    }


    // =========================================
    // NEXT ENGAGEMENT
    // =========================================

    function displayNextEngagement(engagement) {

        nextEmptyState.style.display = "none";
        nextDetails.style.display = "block";

        nextTitle.textContent =
            engagement.title ||
            engagement.eventName ||
            "Speaking engagement";

        nextDate.textContent =
            `${formatDate(engagement.date)} · ${formatTime(engagement.startTime)}`;

        nextVenue.textContent = engagement.venue
            ? `Venue: ${engagement.venue}`
            : "Venue not provided";

        nextTopic.textContent = engagement.topic
            ? `Topic: ${engagement.topic}`
            : "";

    }


    // =========================================
    // UPCOMING SCHEDULE
    // =========================================

    function createScheduleItem(engagement) {

        const item = document.createElement("a");
        item.href = "engagements.html";
        item.className = "schedule-item";

        const dateBox = document.createElement("div");
        dateBox.className = "schedule-item-date";

        const date = new Date(`${engagement.date}T00:00:00`);

        const day = document.createElement("span");
        day.className = "schedule-day";
        day.textContent = date.getDate();

        const month = document.createElement("span");
        month.className = "schedule-month";

        month.textContent = date.toLocaleDateString("en-US", {
            month: "short"
        });

        dateBox.append(day, month);

        const details = document.createElement("div");
        details.className = "schedule-item-details";

        const title = document.createElement("h3");
        title.textContent =
            engagement.title ||
            engagement.eventName ||
            "Speaking engagement";

        const event = document.createElement("p");
        event.textContent = engagement.eventName || "Event details not provided";

        const time = document.createElement("span");
        time.className = "schedule-item-time";
        time.textContent = formatTime(engagement.startTime);

        details.append(title, event, time);

        item.append(dateBox, details);

        return item;
    }


    function displaySchedule(engagements) {

        scheduleList.innerHTML = "";

        if (engagements.length === 0) {
            scheduleEmpty.style.display = "flex";
            return;
        }

        scheduleEmpty.style.display = "none";

        engagements.slice(0, 3).forEach(engagement => {
            scheduleList.appendChild(
                createScheduleItem(engagement)
            );
        });

    }


    // =========================================
    // LOAD DASHBOARD DATA
    // =========================================

    async function loadDashboardData() {

        try {

            const engagements = await TymlyDB.getAllEngagements();

            const now = new Date();

            const upcomingEngagements = engagements
                .map(engagement => ({
                    ...engagement,
                    dateTime: getEngagementDateTime(engagement)
                }))
                .filter(engagement =>
                    engagement.status !== "completed" &&
                    engagement.dateTime &&
                    engagement.dateTime >= now
                )
                .sort((a, b) =>
                    a.dateTime - b.dateTime
                );

            // Display the nearest engagement
            if (upcomingEngagements.length > 0) {

                displayNextEngagement(upcomingEngagements[0]);

            } else {

                nextDetails.style.display = "none";
                nextEmptyState.style.display = "block";

            }

            // Display the next three engagements
            displaySchedule(upcomingEngagements);

            console.log("Dashboard updated successfully.");

        } catch (error) {

            console.error("Could not load dashboard data:", error);

        }

    }


    // =========================================
    // DYNAMIC GREETING
    // =========================================

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

    if (headerDate) {
        headerDate.textContent = now.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }


    // =========================================
    // TOAST NOTIFICATIONS
    // =========================================

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


    // =========================================
    // SERVICE WORKER
    // =========================================

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


    // =========================================
    // INITIALISE DASHBOARD
    // =========================================

    loadDashboardData();

    // Refresh when returning through browser history
    window.addEventListener("pageshow", event => {

        if (event.persisted) {
            loadDashboardData();
        }

    });


    console.log("Tymly Dashboard V2 initialized.");

});