export const ui = {
    inputLeft: document.getElementById('input-left'),
    outputLeft: document.getElementById('output-left'),
    highlightingArea: document.getElementById('highlighting-area'),
    highlightingCode: document.querySelector('#highlighting-area code'),
    memoryGrid: document.getElementById('memory-grid-container'),
    acValue: document.getElementById('ac-value'),
    pcValue: document.getElementById('pc-value'),
    vacValue: document.getElementById('vac-value'),
    ixValue: document.getElementById('ix-value'),
    bpValue: document.getElementById('bp-value'),
    vrValue: document.getElementById('vr-value'),
    baseDisplay: document.getElementById('base-display'),
    nFlagBox: document.getElementById('n-flag-box'),
    zFlagBox: document.getElementById('z-flag-box'),
    logContainer: document.getElementById('log-container'),
    stepControls: document.getElementById('step-controls'),
    aboutModal: document.getElementById('about-modal'),
    helpModal: document.getElementById('help-modal'),
    modulesModal: document.getElementById('modules-modal'),
    overlay: document.getElementById('overlay'),
    languageSwitch: document.getElementById('language-switch'),
    themeSwitch: document.getElementById('theme-switch'),
    btnRunProg: document.getElementById('btnRunProg'),
    btnStep: document.getElementById('btnStep'),
    btnClear: document.getElementById('btnClear'),
    btnNext: document.getElementById('btnNext'),
    btnStopStep: document.getElementById('btnStopStep'),
    btnHex: document.getElementById('btnHex'),
    btnDec: document.getElementById('btnDec'),
    btnCloseAbout: document.getElementById('close-about'),
    btnCloseHelp: document.getElementById('close-help'),
    btnCloseModules: document.getElementById('close-modules'),
    btnAbout: document.getElementById('about-btn'),
    btnHelp: document.getElementById('help-btn'),
    btnModules: document.getElementById('modules-btn'),
    btnLoad: document.getElementById('btnLoad'),
    btnSave: document.getElementById('btnSave'),
    fileMenuLabel: document.querySelector('#file .menu-label'),
    viewMenuLabel: document.querySelector('#view .menu-label'),
    runMenuLabel: document.querySelector('#run .menu-label'),
    icacheHits: document.getElementById('icache-hits'),
    icacheMisses: document.getElementById('icache-misses'),
    icacheTag: document.getElementById('icache-tag'),
    icacheData: document.getElementById('icache-data'),
    dcacheHits: document.getElementById('dcache-hits'),
    dcacheMisses: document.getElementById('dcache-misses'),
    dcacheTag: document.getElementById('dcache-tag'),
    dcacheData: document.getElementById('dcache-data'),
    helpTitle: document.getElementById('help-title'),
    helpContent: document.getElementById('help-content'),
    modulesTitle: document.getElementById('modules-title'),
    modulesDesc: document.getElementById('modules-desc'),
    moduleClassicLabel: document.getElementById('module-classic-label'),
    moduleVLabel: document.getElementById('module-v-label'),
    moduleExpandedLabel: document.getElementById('module-expanded-label'),
    editorTitle: document.getElementById('editor-title-text'),
    gridTitle: document.getElementById('grid-title-text'),
    moduleRadioButtons: document.querySelectorAll('input[name="module-select"]'),
    vacBox: document.getElementById('vac-box'),
    ixBox: document.getElementById('ix-box'),
    bpBox: document.getElementById('bp-box'),
    vrBox: document.getElementById('vr-box'),
    cacheContainer: document.querySelector('.cache-container')
};

export function formatNumber(num, displayBase) {
    return displayBase === 10 ? String(num) : num.toString(16).toUpperCase();
}

export function log(message, logContainer) {
    logContainer.innerHTML += message + '<br>';
    logContainer.scrollTop = logContainer.scrollHeight;
}

export function clearLog(logContainer) {
    logContainer.innerHTML = '';
}

export function updateAcUI(ac, zeroFlag, negativeFlag, displayBase, acValue, nFlagBox, zFlagBox) {
    ac &= 0xFF;
    zeroFlag = (ac === 0);
    negativeFlag = ((ac & 0x80) !== 0);

    acValue.textContent = formatNumber(ac, displayBase);
    
    nFlagBox.classList.toggle('active', negativeFlag);
    zFlagBox.classList.toggle('active', zeroFlag);
    
    return { ac, zeroFlag, negativeFlag };
}

export function updatePcUI(pc, displayBase, pcValue) {
    pcValue.textContent = formatNumber(pc, displayBase);
}

export function updateVacUI(vac, displayBase, vacValue) {
    const formattedVac = vac.map(v => formatNumber(v, displayBase));
    vacValue.textContent = `[${formattedVac.join(', ')}]`;
}

export function updateIxUI(ix, displayBase, ixValue) {
    ixValue.textContent = formatNumber(ix, displayBase);
}

export function updateBpUI(bp, displayBase, bpValue) {
    bpValue.textContent = formatNumber(bp, displayBase);
}

export function updateVrUI(vr, displayBase, vrValue) {
    const formattedVr = vr.map(v => formatNumber(v, displayBase));
    vrValue.textContent = `[${formattedVr.join(', ')}]`;
}

export function updateBaseUI(displayBase, baseDisplay) {
    baseDisplay.textContent = displayBase === 10 ? 'DEC' : 'HEX';
}

export function updateCacheUI(iCache, dCache, displayBase, icacheHits, icacheMisses, icacheTag, icacheData, dcacheHits, dcacheMisses, dcacheTag, dcacheData) {
    icacheHits.textContent = iCache.hits;
    icacheMisses.textContent = iCache.misses;
    icacheTag.textContent = iCache.valid ? formatNumber(iCache.tag, displayBase) : '-';
    icacheData.textContent = iCache.valid ? `[${iCache.data.map(d => formatNumber(d, displayBase)).join(', ')}]` : '[...]';
    
    dcacheHits.textContent = dCache.hits;
    dcacheMisses.textContent = dCache.misses;
    dcacheTag.textContent = dCache.valid ? formatNumber(dCache.tag, displayBase) : '-';
    dcacheData.textContent = dCache.valid ? `[${dCache.data.map(d => formatNumber(d, displayBase)).join(', ')}]` : '[...]';
}

export function toggleModal(modalElement, show, overlay) {
    modalElement.style.display = show ? 'block' : 'none';
    overlay.style.display = show ? 'block' : 'none';
}

export function createMemoryGrid(memoryGrid, memorySize) {
    for (let i = 0; i < memorySize; i++) {
        const cell = document.createElement('div');
        cell.className = 'memory-cell';
        cell.id = `mem-cell-${i}`;

        const addr = document.createElement('div');
        addr.className = 'memory-cell-addr';
        addr.id = `mem-addr-${i}`;

        const value = document.createElement('div');
        value.className = 'memory-cell-value';
        value.id = `mem-value-${i}`;
        
        cell.appendChild(addr);
        cell.appendChild(value);
        memoryGrid.appendChild(cell);
    }
}
