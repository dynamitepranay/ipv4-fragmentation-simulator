/**
 * ============================================================================
 * IPv4 Fragmentation Simulator
 * Educational simulation tool demonstrating IPv4 packet fragmentation (RFC 791)
 * ============================================================================
 */

// Configuration constants
const IPV4_HEADER_SIZE = 20; // Standard IPv4 header without options (bytes)
const MIN_IPV4_PACKET_SIZE = 21; // At least 20B header + 1B payload
const MAX_IPV4_PACKET_SIZE = 65535; // Maximum possible 16-bit total length in IPv4
const MIN_MTU_SIZE = 28; // 20B header + at least 8B (minimum aligned fragment payload)

// DOM Element References
const form = document.getElementById('fragmentation-form');
const packetSizeInput = document.getElementById('packet-size');
const mtuSizeInput = document.getElementById('mtu-size');
const errorBanner = document.getElementById('error-banner');
const errorTitle = document.getElementById('error-title');
const errorMessage = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');
const resetBtn = document.getElementById('btn-reset');
const presetButtons = document.querySelectorAll('.btn-preset');

// Verdict Banner elements
const verdictBanner = document.getElementById('verdict-banner');
const verdictIcon = document.getElementById('verdict-icon');
const verdictTitle = document.getElementById('verdict-title');
const verdictDesc = document.getElementById('verdict-desc');
const verdictPill = document.getElementById('verdict-pill');
const verdictCount = document.getElementById('verdict-count');

// Metrics elements
const metricOrigPacket = document.getElementById('metric-original-packet');
const metricOrigBreakdown = document.getElementById('metric-original-breakdown');
const metricMtu = document.getElementById('metric-mtu');
const metricMaxPayload = document.getElementById('metric-max-payload');
const metricMaxPayloadFormula = document.getElementById('metric-max-payload-formula');
const metricTotalFragments = document.getElementById('metric-total-fragments');
const metricOverhead = document.getElementById('metric-overhead');

// Visual Diagram elements
const origPacketBadge = document.getElementById('orig-packet-badge');
const origPayloadSizeLabel = document.getElementById('orig-payload-size-label');
const fragCountBadge = document.getElementById('frag-count-badge');
const fragmentsVisualList = document.getElementById('fragments-visual-list');
const dividerChip = document.getElementById('divider-chip');

// Table elements
const fragmentsTableBody = document.getElementById('fragments-table-body');
const fragmentsTableFooter = document.getElementById('fragments-table-footer');

// Educational Step elements
const step1Formula = document.getElementById('step1-formula');
const step2Formula = document.getElementById('step2-formula');
const step3Formula = document.getElementById('step3-formula');
const step4Formula = document.getElementById('step4-formula');

/**
 * Validates user inputs according to IPv4 protocol standards.
 * 
 * @param {number} packetSize - Total packet size including header (bytes)
 * @param {number} mtu - Maximum Transmission Unit of the link (bytes)
 * @returns {{ isValid: boolean, message: string, field: string|null }}
 */
function validateInputs(packetSize, mtu) {
  // Check for NaN or empty values
  if (isNaN(packetSize) || isNaN(mtu)) {
    return {
      isValid: false,
      message: 'Both Packet Size and MTU must be valid integer numbers.',
      field: isNaN(packetSize) ? 'packet-size' : 'mtu-size'
    };
  }

  // Validate integer requirement
  if (!Number.isInteger(packetSize) || !Number.isInteger(mtu)) {
    return {
      isValid: false,
      message: 'Packet Size and MTU must be whole numbers (integers).',
      field: !Number.isInteger(packetSize) ? 'packet-size' : 'mtu-size'
    };
  }

  // Validate Packet Size Lower Bound
  if (packetSize < MIN_IPV4_PACKET_SIZE) {
    return {
      isValid: false,
      message: `Original packet size (${packetSize} B) must be at least ${MIN_IPV4_PACKET_SIZE} bytes to contain a standard ${IPV4_HEADER_SIZE}-byte IPv4 header and at least 1 byte of payload.`,
      field: 'packet-size'
    };
  }

  // Validate Packet Size Upper Bound (IPv4 16-bit limit)
  if (packetSize > MAX_IPV4_PACKET_SIZE) {
    return {
      isValid: false,
      message: `Original packet size (${packetSize.toLocaleString()} B) exceeds the IPv4 maximum architectural limit of ${MAX_IPV4_PACKET_SIZE.toLocaleString()} bytes (16-bit total length field).`,
      field: 'packet-size'
    };
  }

  // Validate MTU Lower Bound
  if (mtu < MIN_MTU_SIZE) {
    return {
      isValid: false,
      message: `Link MTU (${mtu} B) is too small. It must be at least ${MIN_MTU_SIZE} bytes to accommodate the ${IPV4_HEADER_SIZE}-byte header and at least one 8-byte aligned data block.`,
      field: 'mtu-size'
    };
  }

  // Validate MTU Upper Bound
  if (mtu > MAX_IPV4_PACKET_SIZE) {
    return {
      isValid: false,
      message: `Link MTU (${mtu.toLocaleString()} B) exceeds the maximum IPv4 packet size of ${MAX_IPV4_PACKET_SIZE.toLocaleString()} bytes.`,
      field: 'mtu-size'
    };
  }

  return { isValid: true, message: '', field: null };
}

/**
 * Calculates IPv4 fragmentation parameters according to RFC 791.
 * 
 * Fragmentation Rules:
 * 1. Payload = Packet Size - Header Size (20 B)
 * 2. If Packet Size <= MTU, no fragmentation is needed.
 * 3. Max fragment payload = Math.floor((MTU - 20) / 8) * 8.
 *    Non-final fragments MUST be multiples of 8 bytes because the Fragment Offset
 *    field in the IPv4 header is 13 bits and measured in 8-byte blocks.
 * 4. The More Fragments (MF) flag is 1 for all fragments except the final fragment (MF = 0).
 * 5. Fragment Offset = (Payload start byte index in original payload) / 8.
 * 
 * @param {number} packetSize - Original packet size in bytes (includes 20B header)
 * @param {number} mtu - Link MTU in bytes
 * @returns {Object} Structured fragmentation result
 */
function calculateFragmentation(packetSize, mtu) {
  const originalPayload = packetSize - IPV4_HEADER_SIZE;
  const requiresFragmentation = packetSize > mtu;

  // Maximum payload allowed per fragment adhering to the 8-byte boundary
  const rawMaxPayload = mtu - IPV4_HEADER_SIZE;
  const maxFragmentPayload = Math.floor(rawMaxPayload / 8) * 8;

  const fragments = [];

  if (!requiresFragmentation) {
    // Single unfragmented packet transmission
    fragments.push({
      index: 1,
      headerSize: IPV4_HEADER_SIZE,
      payloadSize: originalPayload,
      totalSize: packetSize,
      byteStart: 0,
      byteEnd: originalPayload - 1,
      offsetUnits: 0,
      offsetBytes: 0,
      mf: 0,
      isLast: true
    });
  } else {
    // Fragment the datagram across multiple IP packets
    let currentByteOffset = 0;

    while (currentByteOffset < originalPayload) {
      const remainingBytes = originalPayload - currentByteOffset;
      const isLast = remainingBytes <= maxFragmentPayload;
      
      // Non-final fragments must use maxFragmentPayload (divisible by 8).
      // The final fragment simply carries the remaining payload.
      const currentFragPayload = isLast ? remainingBytes : maxFragmentPayload;
      
      // Fragment offset measured in 8-byte units
      const offsetUnits = currentByteOffset / 8;
      
      // MF = 1 if more fragments follow, 0 for the last fragment
      const mf = isLast ? 0 : 1;

      fragments.push({
        index: fragments.length + 1,
        headerSize: IPV4_HEADER_SIZE,
        payloadSize: currentFragPayload,
        totalSize: currentFragPayload + IPV4_HEADER_SIZE,
        byteStart: currentByteOffset,
        byteEnd: currentByteOffset + currentFragPayload - 1,
        offsetUnits: offsetUnits,
        offsetBytes: currentByteOffset,
        mf: mf,
        isLast: isLast
      });

      currentByteOffset += currentFragPayload;
    }
  }

  // Calculate total header overhead added by fragmentation
  const totalHeadersBytes = fragments.length * IPV4_HEADER_SIZE;
  const addedOverheadBytes = totalHeadersBytes - IPV4_HEADER_SIZE;
  const totalTransmittedBytes = packetSize + addedOverheadBytes;

  return {
    packetSize,
    mtu,
    headerSize: IPV4_HEADER_SIZE,
    originalPayload,
    requiresFragmentation,
    maxFragmentPayload,
    rawMaxPayload,
    fragments,
    totalFragments: fragments.length,
    addedOverheadBytes,
    totalTransmittedBytes
  };
}

/**
 * Displays error message banner and highlights invalid field.
 * 
 * @param {string} title 
 * @param {string} message 
 * @param {string|null} fieldId 
 */
function showError(title, message, fieldId = null) {
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  errorBanner.classList.remove('hidden');

  // Hide stale results when input is invalid
  resultsSection.style.display = 'none';

  // Clear previous errors
  packetSizeInput.classList.remove('input-error');
  mtuSizeInput.classList.remove('input-error');

  if (fieldId) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.add('input-error');
  }

  // Scroll error into view on mobile
  errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hides the error banner and removes field error styling.
 */
function clearError() {
  errorBanner.classList.add('hidden');
  packetSizeInput.classList.remove('input-error');
  mtuSizeInput.classList.remove('input-error');
}

/**
 * Renders fragmentation results into DOM components.
 * 
 * @param {Object} data - Result from calculateFragmentation()
 */
function renderResults(data) {
  clearError();
  resultsSection.style.display = 'block';

  const {
    packetSize,
    mtu,
    originalPayload,
    requiresFragmentation,
    maxFragmentPayload,
    fragments,
    totalFragments,
    addedOverheadBytes,
    totalTransmittedBytes
  } = data;

  // 1. Render Verdict Banner
  if (requiresFragmentation) {
    verdictBanner.className = 'verdict-banner required';
    verdictIcon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    `;
    verdictTitle.textContent = 'Fragmentation Required';
    verdictDesc.textContent = `The original datagram (${packetSize.toLocaleString()} B) exceeds the link MTU (${mtu.toLocaleString()} B). It was divided into ${totalFragments} valid IPv4 fragments.`;
    verdictCount.textContent = totalFragments;
    verdictPill.innerHTML = `<span>${totalFragments}</span> Fragments`;
  } else {
    verdictBanner.className = 'verdict-banner unnecessary';
    verdictIcon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M20 6L9 17l-5-5"></path>
      </svg>
    `;
    verdictTitle.textContent = 'No Fragmentation Required';
    verdictDesc.textContent = `The packet size (${packetSize.toLocaleString()} B) fits within the link MTU (${mtu.toLocaleString()} B). It can be transmitted directly in a single frame.`;
    verdictCount.textContent = '1';
    verdictPill.innerHTML = `<span>1</span> Fragment (No split)`;
  }

  // 2. Render Metric Cards
  metricOrigPacket.innerHTML = `${packetSize.toLocaleString()} <span class="metric-unit">B</span>`;
  metricOrigBreakdown.textContent = `20 B Header + ${originalPayload.toLocaleString()} B Payload`;

  metricMtu.innerHTML = `${mtu.toLocaleString()} <span class="metric-unit">B</span>`;

  metricMaxPayload.innerHTML = `${maxFragmentPayload.toLocaleString()} <span class="metric-unit">B</span>`;
  metricMaxPayloadFormula.innerHTML = `&lfloor;(${mtu} - 20) / 8&rfloor; &times; 8 = ${maxFragmentPayload} B`;

  metricTotalFragments.textContent = totalFragments;
  metricOverhead.textContent = requiresFragmentation 
    ? `Added Overhead: +${addedOverheadBytes} B (${totalFragments} headers)` 
    : 'No additional header overhead';

  // 3. Render Visual Diagram
  origPacketBadge.textContent = `${packetSize.toLocaleString()} Bytes`;
  origPayloadSizeLabel.textContent = `${originalPayload.toLocaleString()} B (Bytes 0 &ndash; ${(originalPayload - 1).toLocaleString()})`;

  if (requiresFragmentation) {
    fragCountBadge.textContent = `${totalFragments} Packets Generated`;
    dividerChip.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M12 5v14M19 12l-7 7-7-7"/>
      </svg>
      <span>Payload segmented into ${totalFragments} fragments (8-byte aligned)</span>
    `;
  } else {
    fragCountBadge.textContent = `1 Complete Packet`;
    dividerChip.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
      <span>Packet transmitted intact without segmentation</span>
    `;
  }

  // Populate Visual Fragments List
  fragmentsVisualList.innerHTML = '';
  fragments.forEach((frag) => {
    const card = document.createElement('div');
    card.className = 'frag-visual-card';

    // Proportional width for visual feedback (relative to max MTU)
    const payloadFlexPercent = Math.max(20, Math.min(100, (frag.payloadSize / mtu) * 100));

    card.innerHTML = `
      <div class="frag-visual-header">
        <div class="frag-title-group">
          <span class="frag-num-pill">Fragment #${frag.index}</span>
          <span class="frag-range-label">Data Range: Bytes [${frag.byteStart.toLocaleString()} &ndash; ${frag.byteEnd.toLocaleString()}]</span>
        </div>
        <div class="frag-badges-group">
          <span class="pill-badge pill-total-size" title="Total fragment size including IP header">Size: ${frag.totalSize} B</span>
          <span class="pill-badge pill-offset" title="Offset in 8-byte units = ${frag.offsetBytes} / 8">Offset: ${frag.offsetUnits}</span>
          <span class="pill-badge ${frag.mf === 1 ? 'pill-mf-1' : 'pill-mf-0'}" title="${frag.mf === 1 ? 'More fragments follow downstream' : 'This is the final fragment'}">
            MF = ${frag.mf} (${frag.mf === 1 ? 'More' : 'Last'})
          </span>
        </div>
      </div>
      <div class="frag-strip-wrapper">
        <div class="frag-strip">
          <div class="strip-chunk chunk-header" style="flex: 0 0 85px;" title="IPv4 Header: 20 Bytes">
            <span class="chunk-title">Header</span>
            <span class="chunk-size">20 B</span>
          </div>
          <div class="strip-chunk chunk-payload" style="flex: 0 0 ${payloadFlexPercent}%; background: ${frag.isLast ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'linear-gradient(135deg, #059669, #10b981)'};" title="Data Payload: ${frag.payloadSize} Bytes">
            <span class="chunk-title">${frag.isLast ? 'Final Payload Chunk' : 'Payload Chunk (Divisible by 8)'}</span>
            <span class="chunk-size">${frag.payloadSize} B</span>
          </div>
        </div>
      </div>
    `;

    fragmentsVisualList.appendChild(card);
  });

  // 4. Render Table Rows
  fragmentsTableBody.innerHTML = '';
  fragments.forEach((frag) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="frag-idx">#${frag.index}</td>
      <td>${frag.headerSize} B</td>
      <td><strong>${frag.payloadSize} B</strong></td>
      <td>${frag.totalSize} B</td>
      <td><code>[${frag.byteStart} &ndash; ${frag.byteEnd}]</code></td>
      <td><code>${frag.offsetUnits}</code> <span style="color:var(--text-muted); font-size:0.75rem;">(${frag.offsetBytes} / 8)</span></td>
      <td>
        <span class="pill-badge ${frag.mf === 1 ? 'pill-mf-1' : 'pill-mf-0'}">
          MF = ${frag.mf}
        </span>
      </td>
      <td>
        <span class="compliance-badge">
          &#10003; &le; ${mtu} B
        </span>
      </td>
    `;
    fragmentsTableBody.appendChild(tr);
  });

  // Render Table Summary Footer
  const totalReassembledPayload = fragments.reduce((acc, f) => acc + f.payloadSize, 0);
  fragmentsTableFooter.innerHTML = `
    <tr>
      <td><strong>Total / Summary</strong></td>
      <td>${fragments.length * 20} B</td>
      <td><strong>${totalReassembledPayload.toLocaleString()} B</strong></td>
      <td><strong>${totalTransmittedBytes.toLocaleString()} B</strong></td>
      <td colspan="4" style="color: var(--success); font-family: var(--font-sans); font-size: 0.8rem;">
        &#10004; Reassembly Integrity: Sum of fragment payloads (${totalReassembledPayload} B) equals original payload (${originalPayload} B).
      </td>
    </tr>
  `;

  // 5. Update Educational Calculation Steps
  step1Formula.innerHTML = `<code>Payload = Packet Size - 20 B = ${packetSize} - 20 = <strong>${originalPayload.toLocaleString()} Bytes</strong></code>`;
  
  const rawCapacity = mtu - IPV4_HEADER_SIZE;
  const isAligned = rawCapacity % 8 === 0;
  const alignmentText = isAligned
    ? `<span style="color:var(--success); font-size:0.75rem; display:block; margin-top:0.35rem;">&#10004; Raw data space (${rawCapacity} B) is naturally divisible by 8.</span>`
    : `<span style="color:var(--warning); font-size:0.75rem; display:block; margin-top:0.35rem;">&#9888; Raw data space (${rawCapacity} B) is NOT divisible by 8. Truncated down to ${maxFragmentPayload} B to satisfy the 8-byte offset boundary requirement.</span>`;

  step2Formula.innerHTML = `<code>Max Data = &lfloor;(MTU - 20) / 8&rfloor; &times; 8 = &lfloor;(${mtu} - 20) / 8&rfloor; &times; 8 = &lfloor;${rawCapacity} / 8&rfloor; &times; 8 = <strong>${maxFragmentPayload.toLocaleString()} Bytes</strong></code>${alignmentText}`;

  if (fragments.length > 1) {
    const secondFrag = fragments[1];
    step3Formula.innerHTML = `<code>Frag #1: 0/8 = <strong>0</strong> &bull; Frag #2: ${secondFrag.offsetBytes}/8 = <strong>${secondFrag.offsetUnits}</strong>${fragments.length > 2 ? ` &bull; Frag #${totalFragments}: ${fragments[totalFragments - 1].offsetBytes}/8 = <strong>${fragments[totalFragments - 1].offsetUnits}</strong>` : ''}</code>`;
  } else {
    step3Formula.innerHTML = `<code>Single Frame: Starting byte = 0 &rarr; Offset Field = 0 / 8 = <strong>0</strong></code>`;
  }

  step4Formula.innerHTML = `<code>${requiresFragmentation ? `Fragments 1 to ${totalFragments - 1}: <strong>MF = 1</strong> &bull; Fragment ${totalFragments} (Final): <strong>MF = 0</strong>` : `Single unfragmented packet: <strong>MF = 0</strong> (No more fragments follow)`}</code>`;
}

/**
 * Handles form submission and triggers fragmentation calculation.
 */
function handleSimulation() {
  const packetVal = packetSizeInput.value.trim();
  const mtuVal = mtuSizeInput.value.trim();

  if (packetVal === '' || mtuVal === '') {
    showError('Input Required', 'Please enter both Packet Size and MTU values.', packetVal === '' ? 'packet-size' : 'mtu-size');
    return;
  }

  const packetSize = Number(packetVal);
  const mtu = Number(mtuVal);

  const validation = validateInputs(packetSize, mtu);
  if (!validation.isValid) {
    showError('Input Validation Error', validation.message, validation.field);
    return;
  }

  const result = calculateFragmentation(packetSize, mtu);
  renderResults(result);
}

/**
 * Applies a selected preset scenario to the input fields.
 * 
 * @param {HTMLButtonElement} btn 
 */
function applyPreset(btn) {
  presetButtons.forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');

  const packetSize = btn.getAttribute('data-packet');
  const mtu = btn.getAttribute('data-mtu');

  packetSizeInput.value = packetSize;
  mtuSizeInput.value = mtu;

  handleSimulation();
}

/**
 * Resets the simulator to default values.
 */
function resetSimulator() {
  packetSizeInput.value = '4000';
  mtuSizeInput.value = '1500';
  
  presetButtons.forEach((b) => b.classList.remove('active'));
  const classicPreset = document.getElementById('preset-classic');
  if (classicPreset) classicPreset.classList.add('active');

  clearError();
  handleSimulation();
}

/**
 * Sets up all event listeners on page load.
 */
function init() {
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Deselect preset buttons if custom input submitted
    presetButtons.forEach((b) => b.classList.remove('active'));
    handleSimulation();
  });

  // Reset button
  resetBtn.addEventListener('click', resetSimulator);

  // Preset buttons click
  presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyPreset(btn));
  });

  // Real-time input change clearing active preset badge
  packetSizeInput.addEventListener('input', () => {
    presetButtons.forEach((b) => b.classList.remove('active'));
    clearError();
  });

  mtuSizeInput.addEventListener('input', () => {
    presetButtons.forEach((b) => b.classList.remove('active'));
    clearError();
  });

  // Run initial simulation on load
  handleSimulation();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
