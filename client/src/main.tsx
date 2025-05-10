import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useEffect } from "react";

// Initialize MathJax
declare global {
  interface Window {
    MathJax: any;
  }
}

// MathJax will be loaded via a script tag in index.html
// This function will initialize it
const initMathJax = () => {
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true,
      processEnvironments: true
    },
    options: {
      ignoreHtmlClass: 'no-mathjax',
      processHtmlClass: 'mathjax'
    },
    startup: {
      pageReady() {
        return window.MathJax.startup.defaultPageReady().then(() => {
          console.log('MathJax initially typeset');
        });
      }
    }
  };

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  document.head.appendChild(script);
};

// Initialize MathJax before rendering the app
initMathJax();

createRoot(document.getElementById("root")!).render(<App />);
