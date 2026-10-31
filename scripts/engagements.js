
document.addEventListener("DOMContentLoaded", () => {

    const engagementList = document.getElementById("engagement-list");
    const emptyState = document.getElementById("empty-state");
    const upcomingCount = document.getElementById("upcoming-count");
    const completedCount = document.getElementById("completed-count");

    // Format dates for display
    function formatDate(dateString) {
        if (!dateString) return "Date not set";

        const date = new Date(`${dateString}T00:00:00`);

        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    }

    // Format time for display
    function formatTime(timeString) {
        if (!timeString) return "Time not set";

        const [hours, minutes] = timeString.split(":");
        const date = new Date();

        date.setHours(Number(hours), Number(minutes));

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    // Create an element with safe text content
    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    // Create an engagement card
    function createEngagementCard(engagement) {

        const card = createElement("article", "engagement-item");

        const header = createElement("div", "engagement-item-header");

        const status = createElement(
            "span",
            "engagement-status",
            engagement.status.toUpperCase()
        );

        const date = createElement(
            "span",
            "engagement-date",
            formatDate(engagement.date)
        );

        header.append(status, date);

        const title = createElement("h3", "", engagement.title);

        const event = createElement(
            "p",
            "engagement-event",
            engagement.eventName || "Event details not provided"
        );

        const organizer = createElement(
            "p",
            "engagement-detail",
            `Organizer: ${engagement.organizer || "Not provided"}`
        );

        const venue = createElement(
            "p",
            "engagement-detail",
            `Venue: ${engagement.venue || "Not provided"}`
        );

        const time = createElement(
            "p",
            "engagement-detail",
            `Time: ${formatTime(engagement.startTime)}`
        );

        const duration = createElement(
            "p",
            "engagement-detail",
            engagement.duration
                ? `Duration: ${engagement.duration} minutes`
                : "Duration: Not set"
        );

        const actions = createElement("div", "engagement-actions");

        const editButton = createElement("button", "", "Edit");
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = engagement.id;

        const deleteButton = createElement(
            "button",
            "delete-button",
            "Delete"
        );

        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = engagement.id;

        actions.append(editButton, deleteButton);

        card.append(
            header,
            title,
            event,
            organizer,
            venue,
            time,
            duration,
            actions
        );

        return card;
    }

    // Load and display engagements
    async function loadEngagements() {

        try {
            const engagements = await TymlyDB.getAllEngagements();

            // Sort by date and start time
            engagements.sort((a, b) => {
                const dateA = `${a.date || ""}T${a.startTime || "00:00"}`;
                const dateB = `${b.date || ""}T${b.startTime || "00:00"}`;

                return dateA.localeCompare(dateB);
            });

            const upcoming = engagements.filter(
                item => item.status === "upcoming"
            );

            const completed = engagements.filter(
                item => item.status === "completed"
            );

            upcomingCount.textContent = upcoming.length;
            completedCount.textContent = completed.length;

            // Remove previous cards
            engagementList
                .querySelectorAll(".engagement-item")
                .forEach(card => card.remove());

            // Show empty state when there are no records
            if (engagements.length === 0) {
                emptyState.style.display = "flex";
                return;
            }

            emptyState.style.display = "none";

            // Display all engagements
            engagements.forEach(engagement => {
                engagementList.appendChild(
                    createEngagementCard(engagement)
                );
            });

        } catch (error) {
            console.error("Could not load engagements:", error);
        }
    }

    // Delete an engagement
    engagementList.addEventListener("click", async event => {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;
        const action = button.dataset.action;

        if (action === "delete") {

            const confirmed = window.confirm(
                "Are you sure you want to delete this engagement?"
            );

            if (!confirmed) return;

            try {
                await TymlyDB.deleteEngagement(id);
                await loadEngagements();

                console.log("Engagement deleted successfully.");

            } catch (error) {
                console.error("Could not delete engagement:", error);
                alert("Unable to delete this engagement. Please try again.");
            }
        }

        if (action === "edit") {
    window.location.href = `add-engagement.html?id=${encodeURIComponent(id)}`;
}
    });

// Load engagements whenever the page is displayed,
// including when restored from browser history.
window.addEventListener("pageshow", () => {
    loadEngagements();
});
});