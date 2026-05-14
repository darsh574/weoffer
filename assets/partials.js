/* =========================================================
   WeOffer Growth — shared site nav + footer
   ---------------------------------------------------------
   THIS IS THE ONLY PLACE TO EDIT THE NAV AND FOOTER.
   Every page just drops in two placeholders:

     <div id="site-nav"></div>          ... near the top of <body>
     <div id="site-footer"></div>       ... at the end of the page

   and loads this file:  <script src="/assets/partials.js" defer></script>

   Inner pages (blog, docs, free-audit) mark BOTH placeholders with a
   `data-static` attribute. That switches the header to the sticky/solid
   variant and makes the section links absolute (/#service) so they work
   from any page. The home page leaves the attribute off.
   ========================================================= */
(function () {
  var navEl  = document.getElementById('site-nav');
  var footEl = document.getElementById('site-footer');

  // Inner page? (sticky solid header + absolute /#... links)
  var inner =
    (navEl  && navEl.hasAttribute('data-static')) ||
    (footEl && footEl.hasAttribute('data-static'));

  var P    = inner ? '/' : '';          // section-link prefix
  var HOME = inner ? '/' : '#top';      // brand / back-to-* target
  var year = new Date().getFullYear();

  var nav = `
  <header class="site-header${inner ? ' site-header--static' : ''}" id="site-header">
    <a href="${HOME}" class="site-header__brand" data-cursor="link" aria-label="WeOffer Growth, home">
      <img src="/assets/logo.png" alt="WeOffer Growth" class="brand__logo" width="250" height="100" />
    </a>

    <nav class="site-header__nav" aria-label="Primary">
      <a href="${P}#service" data-cursor="link"><span>What we do</span></a>
      <a href="${P}#process" data-cursor="link"><span>Process</span></a>
      <a href="${P}#industries" data-cursor="link"><span>Who it's for</span></a>
      <a href="${P}#contact" data-cursor="link"><span>Contact</span></a>
    </nav>

    <a href="${P}#contact" class="site-header__cta magnetic" data-cursor="button">
      <span class="btn__inner">
        <span class="btn__label">Start a project</span>
        <span class="btn__label btn__label--alt">Let's talk</span>
      </span>
      <span class="btn__arrow" aria-hidden="true">↗</span>
    </a>
  </header>`;

  var footer = `
  <footer class="site-footer">
    <div class="site-footer__top">
      <div class="site-footer__brand">
        <img src="/assets/logo.png" alt="WeOffer Growth" class="brand__logo brand__logo--lg" width="250" height="100" />
        <p>WeOffer Growth is an engineering studio in Pune building <a href="/free-audit">workflow automation</a>, <a href="/blog/ai-agents-for-business">AI agents</a>, and <a href="/blog/custom-tools-build-vs-buy">custom internal tools</a> for businesses that want to grow without growing the payroll.</p>
      </div>

      <nav class="site-footer__cols" aria-label="Footer">
        <div>
          <h6>Service</h6>
          <a href="/free-audit" data-cursor="link">Free audit</a>
          <a href="${P}#service" data-cursor="link">Workflow Automation</a>
          <a href="${P}#service" data-cursor="link">AI Systems</a>
          <a href="${P}#service" data-cursor="link">Custom Tools</a>
        </div>
        <div>
          <h6>Studio</h6>
          <a href="${P}#process" data-cursor="link">Process</a>
          <a href="${P}#industries" data-cursor="link">Who it's for</a>
          <a href="/blog" data-cursor="link">Notes / Blog</a>
          <a href="${P}#contact" data-cursor="link">Contact</a>
        </div>
        <div>
          <h6>Reach us</h6>
          <a href="mailto:weoffer.info@gmail.com" data-cursor="link">weoffer.info@gmail.com</a>
          <a href="https://wa.me/919881368336" target="_blank" rel="noopener" data-cursor="link">WhatsApp</a>
          <a href="${HOME}" data-cursor="link">${inner ? 'Back to home ↑' : 'Back to top ↑'}</a>
        </div>
        <div>
          <h6>Legal</h6>
          <a href="/privacy" data-cursor="link">Privacy Policy</a>
          <a href="/terms" data-cursor="link">Terms of Service</a>
        </div>
      </nav>
    </div>

    <div class="site-footer__bottom">
      <span>© <span id="year">${year}</span> WeOffer Growth. All rights reserved.</span>
      <span>Engineered in Pune.</span>
    </div>

    <div class="site-footer__giant" aria-hidden="true">WeOffer</div>
  </footer>`;

  // outerHTML swap: the placeholder div is fully replaced by the real element.
  if (navEl)  navEl.outerHTML  = nav;
  if (footEl) footEl.outerHTML = footer;
})();
