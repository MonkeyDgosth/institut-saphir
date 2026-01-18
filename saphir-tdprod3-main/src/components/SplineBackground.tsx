import { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { url: string },
        HTMLElement
      >;
    }
  }
}

const SplineBackground = () => {
  useEffect(() => {
    // Load the Spline viewer script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@splinetool/viewer@1.12.32/build/spline-viewer.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://unpkg.com/@splinetool/viewer@1.12.32/build/spline-viewer.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{ minHeight: "500px" }}
    >
      <spline-viewer
        url="https://prod.spline.design/WnWSJghd5JzNZBLo/scene.splinecode"
        className="w-full h-full"
        style={{ 
          pointerEvents: "none",
          touchAction: "none",
          // @ts-ignore - Custom Spline properties
          "--spline-pixel-ratio": "1",
        }}
      />
      {/* Overlay to blend with the site's dark theme - allows scroll through */}
      <div 
        className="absolute inset-0 bg-night/40" 
        style={{ pointerEvents: "none", touchAction: "none" }}
      />
    </div>
  );
};

export default SplineBackground;
