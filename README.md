# Staff Harmony

Build a modern, responsive web application for an "Employee Management System" — 

a full CRUD admin platform for managing Departments, Employees, and Projects, with 

Login/Register authentication and role-based views (ADMIN vs EMPLOYEE).

DESIGN DIRECTION (important — avoid generic/templated look):

- Do NOT use a generic bootstrap-y admin template look (plain white cards, default blue buttons, boxy shadows everywhere).

- Go for a modern SaaS product aesthetic — think Linear, Notion, or Vercel dashboard style: 

  clean typography, generous whitespace, soft depth (subtle shadows, not harsh borders), 

  refined color palette (pick one confident accent color + neutral grays, not default 

  Bootstrap blue/gray).

- Use a distinctive font pairing (a clean sans-serif for body, slightly more expressive 

  for headings) — not the default system font.

- Add tasteful micro-interactions: hover states, smooth transitions, subtle loading 

  skeletons, toast notifications for success/error actions.

- Use rounded corners consistently (not sharp, not overly bubbly), soft gradients or 

  accent glows used sparingly (e.g. on the login page hero, empty states, or key stat cards).

- Make empty states and loading states feel designed, not default browser/table blanks.

- Dashboard should feel calm and premium — like a tool someone enjoys opening every day, 

  not a bare CRUD table dump.

LAYOUT:

- Sidebar navigation (collapsible) with sections: Dashboard, Employees, Departments, 

  Projects, and Logout. Show current user's name/role at the bottom of the sidebar.

- Top bar with page title, maybe a search bar, and a user avatar/dropdown.

- On mobile: sidebar collapses into a bottom nav or hamburger drawer — fully responsive, 

  no horizontal scrolling, touch-friendly tap targets.

PAGES NEEDED:

1. Login page — centered card or split-screen layout (form on one side, branded 

   illustration/gradient on the other), clean input fields, "Don't have an account? 

   Register" link.

2. Register page — same visual style as login, fields: username, password, role 

   (Admin/Employee toggle or dropdown).

3. Dashboard (landing page after login) — overview stat cards (Total Employees, 

   Total Departments, Total Projects), maybe a simple chart (employees per department), 

   and a recent activity or recently added employees list.

4. Departments page — table/grid of departments (name, description, employee count), 

   with Add/Edit/Delete actions (Add/Edit opens a modal, not a separate page). Delete 

   should ask for confirmation. Only visible/actionable for ADMIN role; EMPLOYEE sees 

   read-only view.

5. Employees page — table with columns: name, email, designation, department, salary, 

   date of joining, actions (view/edit/delete). Include a search/filter bar and a 

   filter-by-department dropdown. Add/Edit via modal or slide-over panel, with a 

   department dropdown to link the employee. Clicking a row opens an Employee Detail 

   view showing their assigned Projects.

6. Employee Detail page — profile-style header (avatar initials, name, designation, 

   department badge), key info in a clean grid, and a Projects section below listing 

   projects they're on (with Add Project action).

7. Projects page — table/grid of all projects (name, location, start date, assigned 

   employee), with Add/Edit/Delete actions.

ROLE-BASED UI:

- ADMIN sees all Create/Edit/Delete buttons.

- EMPLOYEE sees read-only views (no add/edit/delete buttons visible) across 

  Departments/Employees/Projects.

COMPONENTS TO USE THROUGHOUT:

- Modals or slide-over panels for Add/Edit forms (not full page navigation for simple forms).

- Toast notifications for success ("Employee added successfully") and error states.

- Confirmation dialogs before delete actions.

- Loading skeletons while data fetches, and friendly empty states 

  ("No employees yet — add your first one") with an icon/illustration, not a blank table.

- Badges for role (Admin/Employee) and department tags.

- Pagination or infinite scroll for long lists.

This will connect to a Spring Boot REST API with JWT authentication (Authorization: 

Bearer <token> header on all requests after login). Structure the app assuming API 

calls will be wired in afterward — use realistic mock/sample data for now so the UI 

can be reviewed visually first.

Make sure everything is fully responsive — test the mental model at 375px (mobile), 

768px (tablet), and 1440px (desktop) breakpoints.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/20dd92ca-313c-4208-96fc-61eae9e841d5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
