# REVA AICTE IDEA Lab Portal (v6.1.2)

A state-of-the-art web application designed for the **REVA University AICTE IDEA Lab** to manage professional engineering workflows, equipment reservations, and community engagement.

---

## 🚀 Recent Optimizations (v6.1.2)

- **Mobile First Excellence**: Complete UI overhaul for mobile devices. All dashboards, modals, and sidesheets are now optimized with scrollable containers, safe-area padding, and touch-friendly interactions.
- **Smart Access Levels**: Automated access categorization based on email domains. 
  - **Staff Access**: Full administrative control for IDEA Lab employees.
  - **University Access**: Full access to equipment, inventory, and training for members with `@reva.edu.in` accounts.
  - **General Access**: Restructured guest experience for external users via Google/Email login, focusing on public services while protecting university-only hardware resources.
- **Order Tracking v2**: Reimagined live order status carousel showing real-time stages for 3D Prints and PCB Assembly with contextual collection notices.

---

## 🛠️ Core Technology Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Framer Motion.
- **Backend Architecture**: Hybrid Supabase (Real-time data) + Vercel Serverless (Custom API logic).
- **Authentication**: Firebase Auth (Email/Password) + Google OAuth Integration.
- **Payments**: Razorpay Integration (Live/Test modes) with automatic order cancellation for inactivity.
- **3D Engine**: Three.js + React Three Fiber for real-time STL visualization.
- **Document Processing**: Custom receipt generation (PDF) with staff approval tracking.

---

## 📱 Features & Modules

### Student Dashboard
- **Active Order Carousel**: At-a-glance status of your most recent project.
- **3D Print Lab**: Automated STL analysis (volume, surface area, bounding box) and visual verification.
- **PCB Assembly**: Multi-step configuration flow for custom circuit board manufacturing.
- **Slot Booking**: Reserve high-end equipment or a workspace for individual/team projects.
- **Account Management**: Profile customization and historical order archives.

### Staff Dashboard (Role-Based)
- **ADMIN**: System-wide oversight and configuration.
- **LAB**: Workflow management, print job oversight, and order approvals.
- **AMBASSADOR**: Content management (Projects, Gallery, Infrastructure updates).
- **EVENT MANAGER**: Lab closure scheduling and event synchronization.

---

## 📂 Project Structure

```text
.
├── api/                # Vercel Serverless Functions (Router @ api/index.ts)
├── src/
│   ├── components/      # Reusable UI Atoms & Molecules (DashboardNavbar, SideDrawer, etc.)
│   ├── pages/          # Page-level containers (UserDashboard, StaffDashboard, STLViewer)
│   ├── services/       # External service adapters (Auth, Supabase, Razorpay)
│   └── utils/          # Core utilities (Lab Closure checks, PDF Generation)
├── public/             # Static assets (Optimized image assets <500KB)
└── README.md
```

---

## ⚙️ Local Development

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file with the following keys:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
   - `DATABASE_URL` (PostgreSQL)

3. **Start Dev Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🏛️ REVA University AICTE IDEA Lab
Dedicated to fostering innovation by providing state-of-the-art infrastructure for 3D printing, PCB design, and advanced rapid prototyping.
