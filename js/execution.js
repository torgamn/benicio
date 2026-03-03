import { CONSTANTS } from './constants.js';
import { accessICache, accessDCache } from './cache.js';
import { isInstructionVisible } from './assembler.js';
import { logMessage } from './language.js';
import { updateAcUI, updatePcUI, updateVacUI, updateIxUI, updateBpUI, updateVrUI, updateCacheUI, formatNumber } from './ui.js';

export function executeSingleInstruction(state, ui, memorySize) {
    if (state.pc < 0 || state.pc >= memorySize) {
        logMessage('errorPcOutOfBounds', state, ui);
        return 'HALT';
    }
    
    const opcode = accessICache(state.pc, state, ui, memorySize);
    const instr = CONSTANTS.REVERSE_INSTRUCTION_MAP[opcode];
    
    if (!instr || !isInstructionVisible(instr, state.currentModule)) {
        logMessage('errorInvalidOpcode', state, ui, opcode, state.pc);
        return 'HALT';
    }
    
    let arg = 0;
    if (CONSTANTS.OPERAND_INSTRUCTIONS.includes(instr) && !CONSTANTS.SIMPLE_INSTRUCTIONS.includes(instr)) {
        if (state.pc + 1 < memorySize) {
            arg = accessICache(state.pc + 1, state, ui, memorySize);
        }
    }

    const argText = CONSTANTS.OPERAND_INSTRUCTIONS.includes(instr) && !CONSTANTS.SIMPLE_INSTRUCTIONS.includes(instr) ? formatNumber(arg, state.displayBase) : '';
    logMessage('executing', state, ui, instr, argText, formatNumber(state.pc, state.displayBase));

    switch (instr) {
        case 'NOP': state.pc++; break;
        case 'STA': accessDCache(arg, state, ui, memorySize, state.ac); state.opcodeMap[arg] = null; state.pc += 2; break;
        case 'LDA': state.ac = accessDCache(arg, state, ui, memorySize); state.pc += 2; break;
        case 'ADD': state.ac += accessDCache(arg, state, ui, memorySize); state.pc += 2; break;
        case 'OR':  state.ac |= accessDCache(arg, state, ui, memorySize); state.pc += 2; break;
        case 'AND': state.ac &= accessDCache(arg, state, ui, memorySize); state.pc += 2; break;
        case 'NOT': state.ac = ~state.ac; state.pc++; break;
        case 'JMP': state.pc = arg; break;
        case 'JN': state.pc = state.negativeFlag ? arg : state.pc + 2; break;
        case 'JZ': state.pc = state.zeroFlag ? arg : state.pc + 2; break;
        case 'HLT': logMessage('halted', state, ui); return 'HALT';

        // Expanded instructions
        case 'LDIX': state.ix = accessDCache(arg, state, ui, memorySize); state.pc += 2; break;
        case 'STIX': accessDCache(arg, state, ui, memorySize, state.ix); state.opcodeMap[arg] = null; state.pc += 2; break;
        case 'LDBP': state.bp = accessDCache(arg, state, ui, memorySize); state.pc += 2; break;
        case 'STBP': accessDCache(arg, state, ui, memorySize, state.bp); state.opcodeMap[arg] = null; state.pc += 2; break;
        
        case 'LDX':
            state.ac = accessDCache((arg + state.ix) % memorySize, state, ui, memorySize);
            state.pc += 2;
            break;
        case 'STX':
            accessDCache((arg + state.ix) % memorySize, state, ui, memorySize, state.ac);
            state.opcodeMap[(arg + state.ix) % memorySize] = null;
            state.pc += 2;
            break;
        case 'LDBX':
            state.ac = accessDCache((state.bp + state.ix) % memorySize, state, ui, memorySize);
            state.pc += 1;
            break;
        case 'STBX':
            accessDCache((state.bp + state.ix) % memorySize, state, ui, memorySize, state.ac);
            state.opcodeMap[(state.bp + state.ix) % memorySize] = null;
            state.pc += 1;
            break;
            
        case 'LOOP':
            state.ix = (state.ix - 1) & 0xFF;
            if (state.ix !== 0) {
                state.pc = arg;
            } else {
                state.pc += 2;
            }
            break;

        case 'VLD': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) state.vac[i] = accessDCache(address + i, state, ui, memorySize);
            }
            state.pc += 2;
            break;
        }
        case 'VST': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) {
                    accessDCache(address + i, state, ui, memorySize, state.vac[i]);
                    state.opcodeMap[address + i] = null;
                }
            }
            state.pc += 2;
            break;
        }
        case 'VADD': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) state.vac[i] = (state.vac[i] + accessDCache(address + i, state, ui, memorySize)) & 0xFF;
            }
            state.pc += 2;
            break;
        }
        case 'VEADD': {
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                state.vac[i] = (state.vac[i] + state.ac) & 0xFF;
            }
            state.pc++;
            break;
        }
        case 'VOR': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) state.vac[i] = (state.vac[i] | accessDCache(address + i, state, ui, memorySize)) & 0xFF;
            }
            state.pc += 2;
            break;
        }
        case 'VAND': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) state.vac[i] = (state.vac[i] & accessDCache(address + i, state, ui, memorySize)) & 0xFF;
            }
            state.pc += 2;
            break;
        }
        case 'VNOT': {
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                state.vac[i] = (~state.vac[i]) & 0xFF;
            }
            state.pc++;
            break;
        }
        case 'VLD2': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) state.vr[i] = accessDCache(address + i, state, ui, memorySize);
            }
            state.pc += 2;
            break;
        }
        case 'VST2': {
            const address = arg;
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                if (address + i < memorySize) {
                    accessDCache(address + i, state, ui, memorySize, state.vr[i]);
                    state.opcodeMap[address + i] = null;
                }
            }
            state.pc += 2;
            break;
        }
        case 'VADDV': {
            for (let i = 0; i < CONSTANTS.VECTOR_REG_SIZE; i++) {
                state.vac[i] = (state.vac[i] + state.vr[i]) & 0xFF;
            }
            state.pc++;
            break;
        }
    }
    
    const acResult = updateAcUI(state.ac, state.zeroFlag, state.negativeFlag, state.displayBase, ui.acValue, ui.nFlagBox, ui.zFlagBox);
    state.ac = acResult.ac;
    state.zeroFlag = acResult.zeroFlag;
    state.negativeFlag = acResult.negativeFlag;
    
    updatePcUI(state.pc, state.displayBase, ui.pcValue);
    updateVacUI(state.vac, state.displayBase, ui.vacValue);
    updateIxUI(state.ix, state.displayBase, ui.ixValue);
    updateBpUI(state.bp, state.displayBase, ui.bpValue);
    updateVrUI(state.vr, state.displayBase, ui.vrValue);
    updateCacheUI(state.iCache, state.dCache, state.displayBase, ui.icacheHits, ui.icacheMisses, ui.icacheTag, ui.icacheData, ui.dcacheHits, ui.dcacheMisses, ui.dcacheTag, ui.dcacheData);
    return 'CONTINUE';
}

export function resetState(state, ui, iCacheSize, dCacheSize, vectorRegSize) {
    state.ac = 0;
    state.pc = 0;
    state.vac = new Array(vectorRegSize).fill(0);
    state.ix = 0;
    state.bp = 0;
    state.vr = new Array(vectorRegSize).fill(0);
    
    state.iCache = { tag: -1, valid: false, data: new Array(iCacheSize).fill(0), hits: 0, misses: 0 };
    state.dCache = { tag: -1, valid: false, data: new Array(dCacheSize).fill(0), hits: 0, misses: 0 };

    const acResult = updateAcUI(state.ac, state.zeroFlag, state.negativeFlag, state.displayBase, ui.acValue, ui.nFlagBox, ui.zFlagBox);
    state.ac = acResult.ac;
    state.zeroFlag = acResult.zeroFlag;
    state.negativeFlag = acResult.negativeFlag;
    
    updatePcUI(state.pc, state.displayBase, ui.pcValue);
    updateVacUI(state.vac, state.displayBase, ui.vacValue);
    updateIxUI(state.ix, state.displayBase, ui.ixValue);
    updateBpUI(state.bp, state.displayBase, ui.bpValue);
    updateVrUI(state.vr, state.displayBase, ui.vrValue);
    updateCacheUI(state.iCache, state.dCache, state.displayBase, ui.icacheHits, ui.icacheMisses, ui.icacheTag, ui.icacheData, ui.dcacheHits, ui.dcacheMisses, ui.dcacheTag, ui.dcacheData);
    updateBaseUI(state.displayBase, ui.baseDisplay);
}

function updateBaseUI(displayBase, baseDisplay) {
    baseDisplay.textContent = displayBase === 10 ? 'DEC' : 'HEX';
}
