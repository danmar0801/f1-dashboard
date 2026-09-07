# F1 Dashboard frontend

React and D3 dashboard for Monza 2024. See the [project README](../README.md) for complete setup, features, and limitations.

From this directory:

```bash
npm ci
npm run dev -- --port 5173 --strictPort
```

Start the backend in a separate terminal, then open http://localhost:5173.

```bash
npm run build
npm run lint
```

Start with `src/App.jsx` for page content and state, `src/App.css` for dashboard styling, and `src/index.css` for global styles. The two chart components receive race data and selected drivers through props.
