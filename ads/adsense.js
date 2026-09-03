/*
  PARAGON ARCHIVE — EXPORT IDENTITY
  REAL FILE NAME: adsense.js
  EXPECTED PROJECT PATH: /ads/adsense.js
  ROLE: Google AdSense integration controller (P-094 / D-179). DORMANT by default:
        zero ad code loads until the owner sets the approved publisher ID here AND the
        production domain is live. Reserved slots show an honest "reserved" label only —
        no fake ads, ever (P-009).
  RESTORE-LOAD NOTE: Keep under /ads/. Load from paragon-archive.html after app.js.
*/

(() => {
  // ⬇️ SET THIS ONLY AFTER GOOGLE APPROVES THE SITE (format: "ca-pub-XXXXXXXXXXXXXXXX")
  const ADSENSE_PUBLISHER_ID = "";

  const CONFIG = {
    publisherId: ADSENSE_PUBLISHER_ID,
    // Slot IDs are created in the AdSense dashboard after approval; map slot purpose → id.
    slots: {
      websitesList: "", // below the website catalogue grid
      updatesFeed: "", // inside the Updates feed (every 10 items, max 1 per view)
      detailFooter: ""  // under a website detail page
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

  /* renderAdSlots(target): fills every [data-paragon-ad] placeholder.
     - Dormant: shows the honest reserved label (styled by .paragon-ad-slot in style.css).
     - Live: mounts the AdSense library once and fills ins.adsbygoogle blocks. */
  function renderAdSlots(scope = document) {
    const placeholders = scope.querySelectorAll?.("[data-paragon-ad]") || [];
    placeholders.forEach(placeholder => {
      if (placeholder.dataset.paragonAdFilled) return;
      const purpose = placeholder.dataset.paragonAd;
      if (!CONFIG.enabled() || !CONFIG.slots[purpose]) {
        placeholder.innerHTML = '<span class="paragon-ad-slot">Ad space · reserved — ads appear only after Google approves Paragon Archive</span>';
        placeholder.dataset.paragonAdFilled = "reserved";
        return;
      }
      placeholder.innerHTML = `<ins class="adsbygoogle paragon-ad-live" style="display:block" data-ad-client="${CONFIG.publisherId}" data-ad-slot="${CONFIG.slots[purpose]}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      placeholder.dataset.paragonAdFilled = "live";
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (error) { /* library not ready — retried on next render */ }
    });
    if (CONFIG.enabled()) mountLibrary();
  }

  window.ParagonAds = { CONFIG, renderAdSlots, mountLibrary };
})();
