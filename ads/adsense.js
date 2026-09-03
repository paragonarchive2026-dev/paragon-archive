/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: adsense.js
  EXPECTED PROJECT PATH: /ads/adsense.js
  ROLE: Google AdSense integration controller (P-094 / D-179). DORMANT by default:
        zero ad code loads until the owner sets the approved publisher ID here AND the
        production domain is live. Reserved slots show an honest "reserved" label only —
        no fake ads, ever (P-009).
  P-106: impression + intentional engagement clicks feed achievement counters (ad views /
         ad clicks). Clicks never invent revenue; they train the habit and open a clear
         support message until AdSense is live.
  RESTORE-LOAD NOTE: Keep under /ads/. Load from paragon-archive.html after app.js.
*/

(() => {
  // ⬇️ SET THIS ONLY AFTER GOOGLE APPROVES THE SITE (format: "ca-pub-XXXXXXXXXXXXXXXX")
  const ADSENSE_PUBLISHER_ID = "";

  const CONFIG = {
    publisherId: ADSENSE_PUBLISHER_ID,
    slots: {
      websitesList: "",
      updatesFeed: "",
      detailFooter: ""
    },
    enabled() { return Boolean(this.publisherId); }
  };

  function mountLibrary() {
    if (!CONFIG.enabled()) return false;
    if (document.querySelector("script[data-paragon-adsense]")) return true;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.paragonAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.publisherId}`;
    document.head.appendChild(script);
    return true;
  }

  function recordImpression(purpose) {
    try { window.ParagonArchiveAdsBridge?.onImpression?.(purpose); } catch (_) { /* app not ready */ }
  }

  function recordEngagementClick(purpose, live) {
    try { window.ParagonArchiveAdsBridge?.onEngage?.(purpose, { live: Boolean(live) }); } catch (_) { /* app not ready */ }
  }

  function wireReservedEngagement(placeholder, purpose) {
    if (placeholder.dataset.paragonAdClickWired) return;
    placeholder.dataset.paragonAdClickWired = "1";
    placeholder.setAttribute("role", "button");
    placeholder.tabIndex = 0;
    placeholder.style.cursor = "pointer";
    const fire = (event) => {
      event?.preventDefault?.();
      recordEngagementClick(purpose, false);
      try {
        window.showToast?.(
          "Thanks for supporting Paragon — when Google approves ads, taps here open real sponsors. You still earn ad-engagement achievements.",
          "success"
        );
      } catch (_) { /* ignore */ }
    };
    placeholder.addEventListener("click", fire);
    placeholder.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") fire(event);
    });
  }

  function wireLiveClick(placeholder, purpose) {
    if (placeholder.dataset.paragonAdClickWired) return;
    placeholder.dataset.paragonAdClickWired = "1";
    placeholder.addEventListener("click", () => recordEngagementClick(purpose, true), true);
  }

  function observeImpression(placeholder, purpose) {
    if (placeholder.dataset.paragonAdSeen) return;
    const mark = () => {
      if (placeholder.dataset.paragonAdSeen) return;
      placeholder.dataset.paragonAdSeen = "1";
      recordImpression(purpose);
    };
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.4)) {
          mark();
          observer.disconnect();
        }
      }, { threshold: [0.4] });
      observer.observe(placeholder);
    } else {
      mark();
    }
  }

  /* renderAdSlots(target): fills every [data-paragon-ad] placeholder.
     - Dormant: honest reserved label + optional engagement click for achievements.
     - Live: mounts AdSense and counts real impressions/clicks via bridge. */
  function renderAdSlots(scope = document) {
    const placeholders = scope.querySelectorAll?.("[data-paragon-ad]") || [];
    placeholders.forEach(placeholder => {
      const purpose = placeholder.dataset.paragonAd || "unknown";
      if (!placeholder.dataset.paragonAdFilled) {
        if (!CONFIG.enabled() || !CONFIG.slots[purpose]) {
          placeholder.innerHTML = '<span class="paragon-ad-slot">Ad space · reserved — tap to support Paragon · live ads after Google approval</span>';
          placeholder.dataset.paragonAdFilled = "reserved";
        } else {
          placeholder.innerHTML = `<ins class="adsbygoogle paragon-ad-live" style="display:block" data-ad-client="${CONFIG.publisherId}" data-ad-slot="${CONFIG.slots[purpose]}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
          placeholder.dataset.paragonAdFilled = "live";
          try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (error) { /* library not ready */ }
        }
      }
      observeImpression(placeholder, purpose);
      if (placeholder.dataset.paragonAdFilled === "reserved") wireReservedEngagement(placeholder, purpose);
      else wireLiveClick(placeholder, purpose);
    });
    if (CONFIG.enabled()) mountLibrary();
  }

  window.ParagonAds = { CONFIG, renderAdSlots, mountLibrary };
})();
