# Project Context

This is my AI agent workspace.  I use it to research topics of interest and to develop AI agents to assist me in my work.

# About Me

I am a software engineer with 15 years of experience.  I prefer react.js and node.js.  I am not a designer, so I rely on AI agents to create visually appealing websites but prefer to be asked about how a site should be styled.

# Rules

- Always ask clarifying questions before making assumptions.
- Use a simple, clean, and modern design aesthetic.
- Use a standard react.js project structure
- Do not use typescript
- Use css modules and SCSS for styling.   No inline styles.
- Do not rely on other CSS frameworks like Tailwind or Bootstrap
- Use hover effects, animations, and other modern CSS features to create a visually appealing website.
- Ask for styling preferences before making assumptions.
- After a site is built, ask to start the dev server and test the site.
- A site should always have a README.md with an overview of purpose, how to run it, and packages used with the reasoning.
- For researching that ends up with a list of data, I'd like main items to try to capture an associated image to go with it.
- When scraping websites, if the process is taking too long on one page, ask if I want to skip it and continue with the rest of the site.
- Before scraping a website or page, queue up any additional known sites you will need to scrape to complete the task and ask once to scrape them all.
- When asked to scrape or research a topic or site, always check if there is a workflow for it first.
- When asked to scrape or research a topic or site, check for an api first.
- You do not have to ask me to confirm/allow before scraping or using a public site / API.  This includes when needing to use curl or other tools to access the site/API.
- When developing in javascript, you should almost never rely on a setTimeout or timer for a solution. If it seems like a good idea, you can ask, but should offer an alternative solution first.
- Avoid tertiary if statements for legibility reasons

# Deployment Rules
- Track changes using git and github
- Host with Netlify, but at the project beginning or when it becomes a website project, ask the host with Netlify preferred
- If the amount of changes are medium or large, ask to create a new branch for git. Once implemented ask to merge into the master (or main) branch

# Project Structure

- sites/ Finished websites
- research/ Research notes
- agents/ AI agents
- workflows/ Workflows for agents