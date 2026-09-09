# Simple Microscope — Interactive Physics Seminar

An interactive, high-fidelity web presentation for **Class 12 Physics (Ray Optics & Optical Instruments)** exploring the principles, ray optics, and angular magnification derivations of the **Simple Microscope**.

![Presentation Preview](public/favicon.svg)

---

## 🌟 Seminar Outline

1. **Classification of Optical Instruments**: Interactive taxonomy tree branching into Projector, Camera, Telescope, and Microscope.
2. **Definition of Simple Microscope**: Core physical conditions, focal arrangement ($F_1$ and $O$), and visual angle increase.
3. **Ray Optics & Image Formation**:
   - Interactive dual ray diagrams comparing the **Simple Microscope** vs. **Naked Eye at Near Point ($D = 25\text{ cm}$)**.
   - Interactive draggable object position strictly constrained between $F$ and $O$ with real-time magnification readout ($u\text{ in cm}$, $M \approx \dots \times$).
4. **Step-by-Step Mathematical Derivations**:
   - General Angular Magnification formula ($m = D / u$) with small-angle approximations.
   - **Case 1: Image Formed at Near Point** ($v = -D$, $m_{\text{max}} = 1 + D/f$).
   - **Case 2: Image Formed at Infinity / Normal Adjustment** ($u = f$, $m = D/f$, relaxed eye).
   - Bottom-docked step navigation for seamless presentation flow.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed

### Installation & Run
```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to GitHub Pages

This project is pre-configured with:
- Relative asset paths (`base: './'` in `vite.config.ts`)
- Automated GitHub Actions workflow (`.github/workflows/deploy.yml`)

### To Host on GitHub:

1. Create a new repository on GitHub (e.g. `microscope-seminar`).
2. Run in your terminal:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**
   - Under **Build and deployment** > **Source**, select **GitHub Actions**
4. GitHub Actions will automatically build and publish your seminar site at:
   `https://<your-username>.github.io/<your-repo-name>/`
