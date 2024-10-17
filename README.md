### Project Overview

This is a TypeScript-based project that creates a personal automation bot. The
bot performs several tasks:

1. Syncing tasks between ClickUp and Notion
2. Sending email reminders for tasks due today
3. Automating task updates in Notion

### Main Components

1. **Notion Integration**

    - The bot interacts with Notion databases to fetch and update tasks.
    - It uses the Notion API client to perform operations.

2. **ClickUp Integration**

    - Fetches tasks from ClickUp using their API.
    - Converts ClickUp tasks to a format compatible with Notion.

3. **Google Gmail Integration**

    - Uses OAuth2 for authentication with Google's APIs.
    - Sends email reminders for tasks due today.

4. **Task Synchronization**

    - Syncs tasks between ClickUp and Notion.
    - Updates task statuses and details in both systems.

5. **Email Notifications**

    - Sends email notifications for tasks due today.
    - Uses the Google Gmail API to send emails.

6. **More is coming soon**
    - Based on my needs, I will add more integrations and features in the
      future.

### Project Structure

-   The project uses a modular structure with separate files for different
    functionalities.
-   Environment variables are managed using dotenv and stored in a separate
    file.
-   TypeScript is used throughout the project, with proper type definitions for
    API responses and internal data structures.

### Deployment

-   The project is containerized using Docker.
-   It uses GitHub Actions for CI/CD, automatically building and deploying the
    Docker image to a server when changes are pushed to the main branch.

### Scheduling

-   The bot uses node-cron to schedule regular task executions.
-   Different integrations run at different intervals:
    -   Notion to Email: Every 15 minutes between 8 AM and 11:59 PM, all days.
    -   ClickUp to Notion: Every 5 minutes between 8 AM and 11:59 PM, weekdays
        only.
