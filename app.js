/**
 * Wuchin Sung Portfolio - Application Core
 * Features: Real-Time Telemetry Clock, Timezone Switcher, Theme Engine,
 * Project Simulation Modals, Focus Timer, Profile Customizer, & Toast System.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. State Management
  // ==========================================
  const state = {
    timeFormat: '24', // '24' or '12'
    selectedTimezone: 'local', // 'local' or IANA string
    theme: localStorage.getItem('site-theme') || 'dark',
    focusTimerSeconds: 25 * 60,
    focusTimerInterval: null,
    isFocusRunning: false,
    profile: (() => {
      const saved = JSON.parse(localStorage.getItem('user-profile-data') || 'null');
      if (saved && saved.name && saved.name !== 'Alex Morgan') return saved;
      return {
        name: 'Wuchin Sung',
        brand: 'Wuchin.dev',
        role: 'Software Engineer | Python • C / C++ • Machine Learning',
        location: 'Taipei / Remote Worldwide',
        email: 'wujin910504@gmail.com',
        bio: 'Passionate software engineer specializing in high-performance computing, systems programming with C / C++, and intelligent machine learning solutions powered by Python.'
      };
    })()
  };

  // ==========================================
  // 2. DOM Selectors
  // ==========================================
  const dom = {
    // Clocks
    clockHours: document.getElementById('clock-hours'),
    clockMinutes: document.getElementById('clock-minutes'),
    clockSeconds: document.getElementById('clock-seconds'),
    clockAmpm: document.getElementById('clock-ampm'),
    clockDate: document.getElementById('clock-date'),
    clockDayOfYear: document.getElementById('clock-day-of-year'),
    clockUtcOffset: document.getElementById('clock-utc-offset'),
    clockWeekNumber: document.getElementById('clock-week-number'),
    secondProgressBar: document.getElementById('second-progress-bar'),
    navClockTime: document.getElementById('nav-clock-time'),
    footerClockTime: document.getElementById('footer-clock-time'),
    greetingIcon: document.getElementById('greeting-icon'),
    greetingText: document.getElementById('greeting-text'),
    hubTimezoneLabel: document.getElementById('hub-timezone-label'),
    
    // Format buttons
    btnFormat24: document.getElementById('btn-format-24'),
    btnFormat12: document.getElementById('btn-format-12'),
    tzChips: document.querySelectorAll('.tz-chip'),

    // Focus Timer
    focusDigits: document.getElementById('focus-timer-digits'),
    focusStatus: document.getElementById('focus-status'),
    focusStartBtn: document.getElementById('focus-start-btn'),
    focusResetBtn: document.getElementById('focus-reset-btn'),

    // Theme & Navigation
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    mobileToggle: document.getElementById('mobile-toggle'),
    navLinks: document.getElementById('nav-links'),
    backToTopBtn: document.getElementById('back-to-top-btn'),

    // Profile elements
    profileName: document.getElementById('profile-name'),
    profileRole: document.getElementById('profile-role'),
    profileLocation: document.getElementById('profile-location'),
    profileEmailBadge: document.getElementById('profile-email-badge'),
    profileBio: document.getElementById('profile-bio'),
    navBrandName: document.getElementById('nav-brand-name'),
    footerBrandName: document.getElementById('footer-brand-name'),
    contactEmailText: document.getElementById('contact-email-text'),
    contactLocationText: document.getElementById('contact-location-text'),

    // Buttons
    heroCopyEmailBtn: document.getElementById('hero-copy-email-btn'),
    copyEmailBtn: document.getElementById('copy-email-btn'),
    editProfileBtn: document.getElementById('edit-profile-btn'),

    // Customizer Modal
    customizerModal: document.getElementById('customizer-modal'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalResetBtn: document.getElementById('modal-reset-btn'),
    customizerForm: document.getElementById('customizer-form'),
    editName: document.getElementById('edit-name'),
    editBrand: document.getElementById('edit-brand'),
    editRole: document.getElementById('edit-role'),
    editLocation: document.getElementById('edit-location'),
    editEmail: document.getElementById('edit-email'),
    editBio: document.getElementById('edit-bio'),

    // Project Preview Modal
    projectModal: document.getElementById('project-demo-modal'),
    projectModalTitle: document.getElementById('demo-modal-title'),
    projectModalSubtitle: document.getElementById('demo-modal-subtitle'),
    projectModalBody: document.getElementById('demo-modal-body'),
    projectModalCloseBtn: document.getElementById('demo-modal-close-btn'),
    demoButtons: document.querySelectorAll('.btn-demo'),

    // Project filters
    filterButtons: document.querySelectorAll('.filter-btn'),
    projectCards: document.querySelectorAll('.project-card'),

    // Contact Form
    contactForm: document.getElementById('contact-form'),
    toastContainer: document.getElementById('toast-container')
  };

  // ==========================================
  // 3. Theme Initializer
  // ==========================================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('site-theme', theme);
    state.theme = theme;
  }

  applyTheme(state.theme);

  dom.themeToggleBtn.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Obsidian Dark' : 'Crisp Light'} mode`, 'info');
  });

  // ==========================================
  // 4. Real-Time Clock Engine
  // ==========================================
  function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  function updateClock() {
    const now = new Date();
    let displayDate = now;

    // Timezone calculation
    let tzString = 'Local System Time';
    let hourVal, minVal, secVal;

    if (state.selectedTimezone === 'local') {
      hourVal = now.getHours();
      minVal = now.getMinutes();
      secVal = now.getSeconds();
      
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetSign = offsetMinutes >= 0 ? '+' : '-';
      const offsetH = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
      const offsetM = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');
      const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      tzString = `${resolvedTz} • UTC${offsetSign}${offsetH}:${offsetM}`;
      
      dom.clockUtcOffset.textContent = `UTC${offsetSign}${offsetH}:${offsetM}`;
    } else {
      try {
        const tzOptions = { timeZone: state.selectedTimezone, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const parts = new Intl.DateTimeFormat('en-US', tzOptions).formatToParts(now);
        hourVal = parseInt(parts.find(p => p.type === 'hour').value, 10);
        minVal = parseInt(parts.find(p => p.type === 'minute').value, 10);
        secVal = parseInt(parts.find(p => p.type === 'second').value, 10);
        
        tzString = `${state.selectedTimezone.replace('_', ' ')}`;
        dom.clockUtcOffset.textContent = state.selectedTimezone.split('/')[1] || state.selectedTimezone;
      } catch (e) {
        hourVal = now.getHours();
        minVal = now.getMinutes();
        secVal = now.getSeconds();
      }
    }

    dom.hubTimezoneLabel.textContent = tzString;

    // 12h vs 24h format handling
    let formattedHour = hourVal;
    let ampm = '';

    if (state.timeFormat === '12') {
      ampm = hourVal >= 12 ? 'PM' : 'AM';
      formattedHour = hourVal % 12;
      if (formattedHour === 0) formattedHour = 12;
      dom.clockAmpm.textContent = ampm;
      dom.clockAmpm.classList.add('visible');
    } else {
      dom.clockAmpm.classList.remove('visible');
    }

    const strHours = String(formattedHour).padStart(2, '0');
    const strMinutes = String(minVal).padStart(2, '0');
    const strSeconds = String(secVal).padStart(2, '0');

    // Update main digital readout
    dom.clockHours.textContent = strHours;
    dom.clockMinutes.textContent = strMinutes;
    dom.clockSeconds.textContent = strSeconds;

    // Update compact tickers
    const compactTimeStr = `${strHours}:${strMinutes}:${strSeconds}${ampm ? ' ' + ampm : ''}`;
    if (dom.navClockTime) dom.navClockTime.textContent = compactTimeStr;
    if (dom.footerClockTime) dom.footerClockTime.textContent = compactTimeStr;

    // Seconds progress bar (0% - 100%)
    const progressPercent = ((secVal + 1) / 60) * 100;
    dom.secondProgressBar.style.width = `${progressPercent}%`;

    // Date formatting
    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: state.selectedTimezone === 'local' ? undefined : state.selectedTimezone
    };
    dom.clockDate.textContent = new Intl.DateTimeFormat('en-US', dateOptions).format(now);

    // Day of year and Week Number
    dom.clockDayOfYear.textContent = `Day ${getDayOfYear(now)} of ${now.getFullYear()}`;
    dom.clockWeekNumber.textContent = `Week ${getWeekNumber(now)}`;

    // Dynamic Greeting
    updateGreeting(hourVal);
  }

  function updateGreeting(hour) {
    let icon = '☀️';
    let text = 'Good morning, welcome to my space';

    if (hour >= 5 && hour < 12) {
      icon = '☀️';
      text = 'Good morning, welcome to my space';
    } else if (hour >= 12 && hour < 18) {
      icon = '🌤️';
      text = 'Good afternoon, crafting high-performance code';
    } else if (hour >= 18 && hour < 23) {
      icon = '🌆';
      text = 'Good evening, tuning systems & architecture';
    } else {
      icon = '🌙';
      text = 'Late night coding & telemetry active';
    }

    dom.greetingIcon.textContent = icon;
    dom.greetingText.textContent = text;
  }

  // Clock format toggles
  dom.btnFormat24.addEventListener('click', () => {
    state.timeFormat = '24';
    dom.btnFormat24.classList.add('active');
    dom.btnFormat12.classList.remove('active');
    updateClock();
    showToast('Switched to 24-Hour Time Format');
  });

  dom.btnFormat12.addEventListener('click', () => {
    state.timeFormat = '12';
    dom.btnFormat12.classList.add('active');
    dom.btnFormat24.classList.remove('active');
    updateClock();
    showToast('Switched to 12-Hour Time Format');
  });

  // Timezone chips
  dom.tzChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dom.tzChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedTimezone = chip.getAttribute('data-tz');
      updateClock();
      showToast(`Timezone switched to ${chip.textContent.trim()}`);
    });
  });

  // Run clock immediately and every second
  updateClock();
  setInterval(updateClock, 1000);

  // ==========================================
  // 5. Focus Timer Mini-Widget
  // ==========================================
  function updateFocusDisplay() {
    const mins = Math.floor(state.focusTimerSeconds / 60);
    const secs = state.focusTimerSeconds % 60;
    dom.focusDigits.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  dom.focusStartBtn.addEventListener('click', () => {
    if (state.isFocusRunning) {
      clearInterval(state.focusTimerInterval);
      state.isFocusRunning = false;
      dom.focusStartBtn.textContent = 'Resume';
      dom.focusStatus.textContent = 'Paused';
    } else {
      state.isFocusRunning = true;
      dom.focusStartBtn.textContent = 'Pause';
      dom.focusStatus.textContent = 'Focusing...';

      state.focusTimerInterval = setInterval(() => {
        if (state.focusTimerSeconds > 0) {
          state.focusTimerSeconds--;
          updateFocusDisplay();
        } else {
          clearInterval(state.focusTimerInterval);
          state.isFocusRunning = false;
          dom.focusStartBtn.textContent = 'Start';
          dom.focusStatus.textContent = 'Done!';
          showToast('Focus session complete! Take a breather ☕', 'success');
        }
      }, 1000);
    }
  });

  dom.focusResetBtn.addEventListener('click', () => {
    clearInterval(state.focusTimerInterval);
    state.isFocusRunning = false;
    state.focusTimerSeconds = 25 * 60;
    updateFocusDisplay();
    dom.focusStartBtn.textContent = 'Start';
    dom.focusStatus.textContent = 'Ready';
  });

  // ==========================================
  // 6. Project Category Filter
  // ==========================================
  dom.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      dom.projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // ==========================================
  // 7. Interactive Project Demo Simulations
  // ==========================================
  const projectDemos = {
    aether: {
      title: 'Aether Intelligence Telemetry Hub',
      subtitle: 'Real-Time Anomaly Detection & Stream Simulator',
      render: () => `
        <div style="display:flex;flex-direction:column;gap:18px;">
          <div style="background:rgba(0,0,0,0.3);padding:16px;border-radius:10px;border:1px solid var(--bg-card-border);">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-family:var(--font-mono);font-size:0.85rem;">
              <span>Telemetry Node: <strong>US-EAST-01</strong></span>
              <span style="color:var(--accent-emerald);">● INGESTING 52,400 EPS</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;text-align:center;">
              <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">P99 Latency</div>
                <div style="font-size:1.25rem;font-weight:700;color:var(--accent-cyan);" id="sim-latency">18.4 ms</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">CPU Utilization</div>
                <div style="font-size:1.25rem;font-weight:700;color:var(--accent-primary);" id="sim-cpu">42.8 %</div>
              </div>
              <div style="background:rgba(255,255,255,0.03);padding:10px;border-radius:8px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">Anomaly Score</div>
                <div style="font-size:1.25rem;font-weight:700;color:var(--accent-emerald);" id="sim-anomaly">0.02 (Nominal)</div>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" id="sim-trigger-anomaly">Inject Artificial Traffic Spike</button>
        </div>
      `,
      init: () => {
        const btn = document.getElementById('sim-trigger-anomaly');
        const latEl = document.getElementById('sim-latency');
        const cpuEl = document.getElementById('sim-cpu');
        const anomEl = document.getElementById('sim-anomaly');
        if (!btn) return;
        btn.addEventListener('click', () => {
          latEl.textContent = '94.2 ms';
          cpuEl.textContent = '89.1 %';
          anomEl.textContent = '0.88 (ALERT)';
          anomEl.style.color = 'var(--accent-rose)';
          showToast('Artificial spike injected! Anomaly detection triggered.', 'warning');
          setTimeout(() => {
            if (latEl) {
              latEl.textContent = '19.1 ms';
              cpuEl.textContent = '44.3 %';
              anomEl.textContent = '0.04 (Nominal)';
              anomEl.style.color = 'var(--accent-emerald)';
            }
          }, 3500);
        });
      }
    },
    orbital: {
      title: 'Orbital Mesh Cluster Orchestrator',
      subtitle: 'Multi-Region Microservice Health Checker',
      render: () => `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <p style="color:var(--text-secondary);font-size:0.9rem;">Simulate health probe queries across global edge clusters:</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--bg-card-border);">
              <span>Cluster: <strong>Frankfurt (eu-central)</strong></span>
              <span style="color:var(--accent-emerald);">Online (12/12 Pods)</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--bg-card-border);">
              <span>Cluster: <strong>Tokyo (ap-northeast)</strong></span>
              <span style="color:var(--accent-emerald);">Online (18/18 Pods)</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:12px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid var(--bg-card-border);">
              <span>Cluster: <strong>Virginia (us-east)</strong></span>
              <span style="color:var(--accent-emerald);">Online (24/24 Pods)</span>
            </div>
          </div>
          <button class="btn btn-secondary btn-block" id="sim-run-healthcheck">Ping All Edge Nodes</button>
        </div>
      `,
      init: () => {
        const btn = document.getElementById('sim-run-healthcheck');
        if (!btn) return;
        btn.addEventListener('click', () => {
          showToast('Healthcheck ping completed: 100% healthy across 3 regions.');
        });
      }
    },
    pulsepad: {
      title: 'PulsePad Collaborative Studio',
      subtitle: 'Real-Time CRDT Document Simulator',
      render: () => `
        <div style="display:flex;flex-direction:column;gap:14px;">
          <div style="background:#0d1117;border-radius:8px;padding:16px;border:1px solid rgba(255,255,255,0.1);font-family:var(--font-mono);font-size:0.875rem;">
            <div style="color:var(--text-muted);margin-bottom:8px;">// Live Shared Buffer (2 peers active)</div>
            <div id="crdt-live-doc" style="color:#7ee787;min-height:70px;">const system = new DistributedKernel({ syncInterval: 10 });</div>
          </div>
          <div style="display:flex;gap:10px;">
            <input type="text" id="crdt-input" placeholder="Type code or comment to broadcast..." style="flex-grow:1;padding:10px 14px;border-radius:8px;background:rgba(0,0,0,0.3);border:1px solid var(--bg-card-border);color:#fff;">
            <button class="btn btn-primary" id="crdt-send-btn">Broadcast</button>
          </div>
        </div>
      `,
      init: () => {
        const btn = document.getElementById('crdt-send-btn');
        const input = document.getElementById('crdt-input');
        const doc = document.getElementById('crdt-live-doc');
        if (!btn || !input || !doc) return;
        btn.addEventListener('click', () => {
          const val = input.value.trim();
          if (val) {
            doc.innerHTML += `<br><span style="color:var(--accent-cyan);">&gt; Peer (Wuchin):</span> ${val}`;
            input.value = '';
            showToast('Change broadcasted to CRDT replica.');
          }
        });
      }
    },
    chroma: {
      title: 'Chroma Glass UI Design System',
      subtitle: 'Dynamic Glass & Color Playground',
      render: () => `
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div id="glass-playground-box" style="padding:24px;border-radius:14px;background:rgba(255,255,255,0.08);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.2);text-align:center;">
            <h4>Interactive Frosted Glass Component</h4>
            <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:6px;">Adjust the sliders below to test glass tokens dynamically.</p>
          </div>
          <div>
            <label style="font-size:0.8rem;color:var(--text-muted);">Backdrop Blur (<span id="blur-val">16px</span>)</label>
            <input type="range" id="blur-range" min="0" max="40" value="16" style="width:100%;">
          </div>
        </div>
      `,
      init: () => {
        const slider = document.getElementById('blur-range');
        const box = document.getElementById('glass-playground-box');
        const label = document.getElementById('blur-val');
        if (!slider || !box) return;
        slider.addEventListener('input', (e) => {
          const val = e.target.value;
          box.style.backdropFilter = `blur(${val}px)`;
          label.textContent = `${val}px`;
        });
      }
    }
  };

  dom.demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const projKey = btn.getAttribute('data-project');
      const demoData = projectDemos[projKey];
      if (!demoData) return;

      dom.projectModalTitle.textContent = demoData.title;
      dom.projectModalSubtitle.textContent = demoData.subtitle;
      dom.projectModalBody.innerHTML = demoData.render();
      dom.projectModal.classList.add('open');

      if (demoData.init) demoData.init();
    });
  });

  dom.projectModalCloseBtn.addEventListener('click', () => {
    dom.projectModal.classList.remove('open');
  });

  // ==========================================
  // 8. Profile Customizer Modal
  // ==========================================
  function applyProfileToDom(profile) {
    if (dom.profileName) dom.profileName.textContent = profile.name;
    if (dom.profileRole) dom.profileRole.textContent = profile.role;
    if (dom.profileLocation) dom.profileLocation.textContent = profile.location;
    if (dom.profileEmailBadge) dom.profileEmailBadge.textContent = profile.email;
    if (dom.profileBio) dom.profileBio.textContent = profile.bio;
    if (dom.navBrandName) dom.navBrandName.textContent = profile.brand;
    if (dom.footerBrandName) dom.footerBrandName.textContent = profile.brand;
    if (dom.contactEmailText) dom.contactEmailText.textContent = profile.email;
    if (dom.contactLocationText) dom.contactLocationText.textContent = `${profile.location} • Remote Ready`;

    // Sync input fields
    dom.editName.value = profile.name;
    dom.editBrand.value = profile.brand;
    dom.editRole.value = profile.role;
    dom.editLocation.value = profile.location;
    dom.editEmail.value = profile.email;
    dom.editBio.value = profile.bio;
  }

  // Load saved profile data
  applyProfileToDom(state.profile);

  dom.editProfileBtn.addEventListener('click', () => {
    dom.customizerModal.classList.add('open');
  });

  dom.modalCloseBtn.addEventListener('click', () => {
    dom.customizerModal.classList.remove('open');
  });

  dom.modalResetBtn.addEventListener('click', () => {
    const defaultProfile = {
      name: 'Wuchin Sung',
      brand: 'Wuchin.dev',
      role: 'Software Engineer | Python • C / C++ • Machine Learning',
      location: 'Taipei / Remote Worldwide',
      email: 'wujin910504@gmail.com',
      bio: 'Passionate software engineer specializing in high-performance computing, systems programming with C / C++, and intelligent machine learning solutions powered by Python.'
    };
    state.profile = defaultProfile;
    localStorage.removeItem('user-profile-data');
    applyProfileToDom(defaultProfile);
    dom.customizerModal.classList.remove('open');
    showToast('Profile reset to default settings.');
  });

  dom.customizerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.profile = {
      name: dom.editName.value.trim() || 'Wuchin Sung',
      brand: dom.editBrand.value.trim() || 'Wuchin.dev',
      role: dom.editRole.value.trim() || 'Software Engineer | Python • C / C++ • Machine Learning',
      location: dom.editLocation.value.trim() || 'Taipei / Remote Worldwide',
      email: dom.editEmail.value.trim() || 'wujin910504@gmail.com',
      bio: dom.editBio.value.trim() || 'Passionate software engineer specializing in Python, C / C++, and Machine Learning.'
    };

    localStorage.setItem('user-profile-data', JSON.stringify(state.profile));
    applyProfileToDom(state.profile);
    dom.customizerModal.classList.remove('open');
    showToast('Profile successfully updated & saved!', 'success');
  });

  // Close modals on outside click
  [dom.customizerModal, dom.projectModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // ==========================================
  // 9. Copy Email & Toast System
  // ==========================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;

    dom.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function copyEmailToClipboard() {
    const email = state.profile.email;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`);
      }).catch(() => fallbackCopy(email));
    } else {
      fallbackCopy(email);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast(`Email copied: ${text}`);
    } catch (e) {
      showToast(`Email: ${text}`);
    }
    document.body.removeChild(textarea);
  }

  if (dom.heroCopyEmailBtn) dom.heroCopyEmailBtn.addEventListener('click', copyEmailToClipboard);
  if (dom.copyEmailBtn) dom.copyEmailBtn.addEventListener('click', copyEmailToClipboard);

  // ==========================================
  // 10. Contact Form Validation & Submission
  // ==========================================
  dom.contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const subjectInput = document.getElementById('form-subject');
    const msgInput = document.getElementById('form-message');

    let isValid = true;

    // Name check
    if (!nameInput.value.trim()) {
      nameInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      nameInput.parentElement.classList.remove('has-error');
    }

    // Email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      emailInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      emailInput.parentElement.classList.remove('has-error');
    }

    // Subject check
    if (!subjectInput.value.trim()) {
      subjectInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      subjectInput.parentElement.classList.remove('has-error');
    }

    // Message check
    if (!msgInput.value.trim()) {
      msgInput.parentElement.classList.add('has-error');
      isValid = false;
    } else {
      msgInput.parentElement.classList.remove('has-error');
    }

    if (isValid) {
      showToast(`Thank you, ${nameInput.value.trim()}! Message dispatched successfully.`, 'success');
      dom.contactForm.reset();
    }
  });

  // ==========================================
  // 11. Navigation & Mobile Drawer
  // ==========================================
  dom.mobileToggle.addEventListener('click', () => {
    dom.navLinks.classList.toggle('open');
  });

  // Close mobile nav when clicking a link
  dom.navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      dom.navLinks.classList.remove('open');
    });
  });

  // Back to top
  dom.backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
