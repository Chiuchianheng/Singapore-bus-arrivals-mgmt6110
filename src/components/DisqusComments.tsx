import React, { useEffect, useRef } from 'react';

interface DisqusCommentsProps {
  currentView: string;
}

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: any) => void;
      }) => void;
    };
    disqus_config?: (this: any) => void;
  }
}

const DISQUS_SHORTNAME = 'singapore-bus-arrivals-mgmt6110';
const PAGE_URL = 'https://singapore-bus-arrivals-mgmt6110.vercel.app';
const PAGE_IDENTIFIER = 'home';

export const DisqusComments: React.FC<DisqusCommentsProps> = ({ currentView }) => {
  const prevViewRef = useRef(currentView);

  useEffect(() => {
    // Configure Disqus parameters
    window.disqus_config = function () {
      this.page = this.page || {};
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
    };

    // Load Disqus Universal Code script only once
    const SCRIPT_ID = 'disqus-universal-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://${DISQUS_SHORTNAME}.disqus.com/embed.js`;
      script.setAttribute('data-timestamp', String(+new Date()));
      script.async = true;
      (document.head || document.body).appendChild(script);
    }
  }, []);

  // When the view changes, reset Disqus so comments reload cleanly in SPA mode
  useEffect(() => {
    if (prevViewRef.current === currentView) {
      return;
    }
    prevViewRef.current = currentView;

    if (typeof window.DISQUS !== 'undefined' && typeof window.DISQUS.reset === 'function') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            this.page = this.page || {};
            this.page.url = PAGE_URL;
            this.page.identifier = PAGE_IDENTIFIER;
          },
        });
      } catch {
        // Safe guard against Disqus reset issues during view changes
      }
    }
  }, [currentView]);

  return (
    <section id="disqus-feedback-section" className="mt-12 pt-8 border-t border-slate-200">
      <p className="text-sm font-medium text-slate-600 mb-6 text-center">
        Let us know what worked for you and what did not.
      </p>
      <div id="disqus_thread" className="min-h-[160px]" />
    </section>
  );
};
