# FT Time Tracker (ft-time-tracker)

Time-tracking tool for measuring time spent on tasks that can be nested with arbitrary depth.

## Features and core ideas

- time is measured using entries, each of which can be assigned a start time, an end time, a task and a description
- each task can be nested in another task and assigned a color and an icon
- all data available to the user is loaded into the browser, so that - after initial load - all data is always immediately available
  - filtering, browsing, and analysis of all tasks and entries without any additional network requests
  - immediate tasks autocomplete suggestions for all your tasks
  - in case of database changes after initial load, state on other currently-connected devices will be updated over WebSockets
  - only changes are transferred over the network - data of tasks and entries that weren't modified since last initial load are already saved in the browser's IndexedDB
- settings are only kept locally, allowing to customize them separately for each browser/device

## Used technologies

[<img align="left" width="26" height="26" alt="Vue.js" src="public/readmeIcons/devicons_vuejs.svg" style="padding: 0 20px 16px 0">](https://vuejs.org "Vue.js")
[<img align="left" width="26" height="26" alt="Quasar Framework" src="public/readmeIcons/devicons_quasar.svg" style="padding: 0 20px 16px 0">](https://quasar.dev "Quasar Framework")
[<img align="left" width="26" height="26" alt="Vite" src="public/readmeIcons/devicons_vitejs.svg" style="padding: 0 20px 16px 0">](https://vitejs.dev/ "Vite")
[<img align="left" width="26" height="26" alt="Vitest" src="public/readmeIcons/devicons_vitest.svg" style="padding: 0 20px 16px 0">](https://vitest.dev "Vitest")
[<img align="left" width="26" height="26" alt="Pinia" src="public/readmeIcons/logos_pinia.svg" style="padding: 0 20px 16px 0">](https://pinia.vuejs.org "Pinia")
[<img align="left" width="26" height="26" alt="TypeScript" src="public/readmeIcons/devicons_typescript.svg" style="padding: 0 20px 16px 0">](https://www.typescriptlang.org "TypeScript")
[<img align="left" width="26" height="26" alt="JavaScript" src="public/readmeIcons/devicons_javascript.svg" style="padding: 0 20px 16px 0">](https://en.wikipedia.org/wiki/JavaScript "JavaScript")
[<img width="26" height="26" alt="GitHub Actions" src="public/readmeIcons/devicons_githubactions.svg" style="padding: 0 20px 16px 0">](https://github.com/features/actions "GitHub Actions")

## Screenshots

Main (entries) page
![Main (entries) page](public/readme%20screenshots/tracker-entries.png)

Tasks page
![Tasks page](public/readme%20screenshots/tracker-tasks.png)

Task editing page
![Task editing page](public/readme%20screenshots/tracker-task-edit.png)
