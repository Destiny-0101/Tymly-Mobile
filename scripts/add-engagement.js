
document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("engagement-form");
    const submitButton = form.querySelector('button[type="submit"]');

    const params = new URLSearchParams(window.location.search);
    const engagementId = params.get("id");
    const isEditMode = Boolean(engagementId);

    function getText(formData, field) {
        return String(formData.get(field) ?? "").trim();
    }

    // Update the page heading and button for edit mode
    if (isEditMode) {
        document.querySelector(".eyebrow").textContent = "UPDATE COMMITMENT";
        document.querySelector("h1").textContent = "Edit engagement.";
        document.querySelector(".welcome-subtitle").textContent =
            "Update the details of your speaking commitment.";

        submitButton.textContent = "Update engagement →";

        // Retrieve and populate the existing engagement
        try {
            const engagement = await TymlyDB.getEngagement(engagementId);

            if (!engagement) {
                alert("Engagement not found.");
                window.location.href = "engagements.html";
                return;
            }

            Object.entries(engagement).forEach(([key, value]) => {
                const field = form.elements.namedItem(key);

                if (field && value !== null && value !== undefined) {
                    field.value = value;
                }
            });

        } catch (error) {
            console.error("Could not retrieve engagement:", error);
            alert("Unable to load this engagement.");
            window.location.href = "engagements.html";
            return;
        }
    }

    // Handle form submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.reportValidity()) return;

        try {
            submitButton.disabled = true;
            submitButton.textContent = isEditMode
                ? "Updating engagement..."
                : "Saving engagement...";

            const formData = new FormData(form);
            const now = new Date();

            const date = getText(formData, "date");
            const durationValue = getText(formData, "duration");

            const today = [
                now.getFullYear(),
                String(now.getMonth() + 1).padStart(2, "0"),
                String(now.getDate()).padStart(2, "0")
            ].join("-");

            const existingEngagement = isEditMode
                ? await TymlyDB.getEngagement(engagementId)
                : null;

            const engagement = {
                id: engagementId || (
                    window.crypto?.randomUUID
                        ? crypto.randomUUID()
                        : `eng-${Date.now()}-${Math.random().toString(36).slice(2)}`
                ),

                title: getText(formData, "title"),
                eventName: getText(formData, "eventName"),
                organizer: getText(formData, "organizer"),
                date,
                startTime: getText(formData, "startTime"),
                venue: getText(formData, "venue"),
                duration: durationValue ? Number(durationValue) : null,
                topic: getText(formData, "topic"),
                notes: getText(formData, "notes"),

                status: date < today ? "completed" : "upcoming",

                createdAt: existingEngagement?.createdAt || now.toISOString(),
                updatedAt: now.toISOString()
            };

            if (isEditMode) {
                await TymlyDB.updateEngagement(engagement);
            } else {
                await TymlyDB.addEngagement(engagement);
            }

            alert(
                isEditMode
                    ? "Your engagement has been updated successfully!"
                    : "Your engagement has been saved successfully!"
            );

            window.location.href = "engagements.html";

        } catch (error) {
            console.error("Could not save engagement:", error);

            alert("We couldn't save your engagement. Please try again.");

            submitButton.disabled = false;
            submitButton.textContent = isEditMode
                ? "Update engagement →"
                : "Save engagement →";
        }
    });

    // Refresh only when restored from browser history
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    });

});
