import React, { useState, useEffect, useContext } from 'react';
import { CourseContext } from '../context/CourseContext';
import { Play, RotateCcw, AlertCircle, CheckCircle, Info, Database, History, X } from 'lucide-react';

export default function CodePlayground({ 
  lessonId, 
  languageId, 
  defaultCode = "", 
  codeExample = "",
  practiceTask = "", 
  practiceHint = "", 
  expectedOutput = "", 
  onTaskSuccess 
}) {
  const { logCodeRun, submitDebugChallenge } = useContext(CourseContext);
  const [code, setCode] = useState(defaultCode);
  const [logs, setLogs] = useState([]);
  const [memory, setMemory] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Load code history from localStorage for this lesson
  const historyKey = `cv_history_${lessonId}`;
  const [codeHistory, setCodeHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    setCode(defaultCode);
    setLogs([]);
    setMemory({});
    setStatus('idle');
    setShowHint(false);
    setShowExample(false);
    setShowHistory(false);
    const key = `cv_history_${lessonId}`;
    try { setCodeHistory(JSON.parse(localStorage.getItem(key) || '[]')); } catch { setCodeHistory([]); }
  }, [lessonId, defaultCode]);

  // Save a run to history
  const saveToHistory = (runCode, output) => {
    const newEntry = {
      id: Date.now(),
      code: runCode,
      output: output.slice(0, 3).join(' | '),
      time: new Date().toLocaleTimeString()
    };
    const updated = [newEntry, ...codeHistory].slice(0, 5);
    setCodeHistory(updated);
    localStorage.setItem(historyKey, JSON.stringify(updated));
  };

  const handleReset = () => {
    setCode(defaultCode);
    setLogs(['Console cleared. Code reset.']);
    setMemory({});
    setStatus('idle');
  };

  const simulateExecution = async () => {
    // --- Guard: Block if user hasn't written anything meaningful ---
    const trimmedCode = code.trim();
    const trimmedDefault = defaultCode.trim();

    // Block if code is completely empty or unchanged from the starter template
    if (!trimmedCode || trimmedCode === trimmedDefault) {
      setLogs(['⚠️ Please write your own solution in the editor before running. The task requires you to modify the code, not just run the example.']);
      setStatus('error');
      return;
    }

    setIsRunning(true);
    setLogs(['Compiling and executing...']);
    setMemory({});
    
    // Call logCodeRun to trigger potential First Program badge!
    logCodeRun();

    setTimeout(() => {
      const outputLogs = [];
      const localMemory = {};
      let isSuccess = false;

      try {
        if (languageId === 'javascript') {
          // --- JS Execution Sandbox ---
          const originalLog = console.log;
          console.log = (...args) => {
            outputLogs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' '));
          };

          try {
            // Find variable assignments in JS to display in Memory Visualizer
            const varRegex = /(?:let|const|var)\s+(\w+)\s*=\s*(.+?)(?:;|$)/g;
            let match;
            while ((match = varRegex.exec(code)) !== null) {
              const name = match[1];
              const valueExpr = match[2];
              try {
                // Safely evaluate simple values
                const val = new Function(`return ${valueExpr}`)();
                localMemory[name] = val;
              } catch {
                localMemory[name] = valueExpr;
              }
            }

            const runner = new Function(code);
            runner();
            isSuccess = true;
          } catch (err) {
            outputLogs.push(`SyntaxError: ${err.message}`);
            setStatus('error');
          } finally {
            console.log = originalLog;
          }
        } else {
          // --- Python, C, C++, Java Interpreter/Simulator ---
          const codeLines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          
          if (languageId === 'python') {
            // Evaluate Python code
            codeLines.forEach(line => {
              // 1. Comments
              if (line.startsWith('#')) return;

              // 2. Variables: name = value
              const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
              if (assignMatch) {
                const varName = assignMatch[1];
                let varVal = assignMatch[2];
                // strip quotes
                if (varVal.startsWith('"') && varVal.endsWith('"')) {
                  varVal = varVal.slice(1, -1);
                } else if (varVal.startsWith("'") && varVal.endsWith("'")) {
                  varVal = varVal.slice(1, -1);
                } else if (!isNaN(varVal)) {
                  varVal = Number(varVal);
                }
                localMemory[varName] = varVal;
              }

              // 3. Print statements: print(...)
              const printMatch = line.match(/^print\((.*)\)$/);
              if (printMatch) {
                const printContent = printMatch[1].trim();
                
                // If printing variable directly
                if (localMemory[printContent] !== undefined) {
                  outputLogs.push(String(localMemory[printContent]));
                } 
                // If printing concatenation or string
                else if (printContent.startsWith('"') && printContent.endsWith('"')) {
                  outputLogs.push(printContent.slice(1, -1));
                } else if (printContent.startsWith("'") && printContent.endsWith("'")) {
                  outputLogs.push(printContent.slice(1, -1));
                } 
                // Sum printing or variables printing
                else {
                  try {
                    // Try evaluating print contents in context of variables
                    const contextFn = new Function(
                      ...Object.keys(localMemory),
                      `return ${printContent}`
                    );
                    const res = contextFn(...Object.values(localMemory));
                    outputLogs.push(String(res));
                  } catch {
                    outputLogs.push(printContent);
                  }
                }
              }

              // 4. Loops (mock)
              if (line.startsWith('for ') && line.includes('range(')) {
                const countMatch = line.match(/range\((\d+)\)/);
                if (countMatch) {
                  const loops = parseInt(countMatch[1]);
                  const loopLines = codeLines.filter(l => !l.startsWith('for') && !l.startsWith('#') && (l.includes('print') || l.includes('Repeat')));
                  for (let i = 0; i < loops; i++) {
                    outputLogs.push("Repeat");
                  }
                }
              }
            });
            isSuccess = true;
          } 
          
          else if (languageId === 'c' || languageId === 'cpp') {
            // Evaluate C/C++ code
            let hasMain = code.includes('main(');
            let prints = [];
            
            // Extract prints
            const printfRegex = /printf\s*\(\s*"([^"]*)"\s*(?:,\s*([^)]*))?\)/g;
            let match;
            while ((match = printfRegex.exec(code)) !== null) {
              let format = match[1];
              let args = match[2];
              if (args) {
                // mock insertion
                prints.push(args.replace(/"/g, '').trim());
              } else {
                prints.push(format);
              }
            }

            // Extract cout in C++
            const coutRegex = /cout\s*<<\s*([^<;]+)/g;
            let coutMatch;
            while ((coutMatch = coutRegex.exec(code)) !== null) {
              let val = coutMatch[1].replace(/"/g, '').trim();
              if (val !== 'endl') {
                prints.push(val);
              }
            }

            // Extract variables
            const varRegex = /(?:int|float|double|char|string)\s+(\w+)\s*=\s*([^;]+)/g;
            let varMatch;
            while ((varMatch = varRegex.exec(code)) !== null) {
              const name = varMatch[1];
              const value = varMatch[2].trim();
              localMemory[name] = value;
            }

            // check pointer assignments for C
            if (code.includes('*ptr') || code.includes('&')) {
              localMemory['ptr'] = '&val';
            }

            if (!hasMain) {
              outputLogs.push("Compilation Error: main() function is missing.");
              setStatus('error');
              setIsRunning(false);
              return;
            }

            prints.forEach(p => outputLogs.push(p));
            isSuccess = true;
          }

          else {
            // Fallback default mock successful runner
            outputLogs.push("Build completed successfully.");
            outputLogs.push("Console log: Executed successfully.");
            isSuccess = true;
          }
        }

        // Apply visual updates
        setLogs(outputLogs);
        setMemory(localMemory);
        // Save this run to history
        saveToHistory(code, outputLogs);

        // Check verification target
        if (isSuccess) {
          const finalOutputStr = outputLogs.join('\n');
          const regex = new RegExp(expectedOutput);
          
          // 1. Minified code clean-up helper
          const cleanString = (str) => {
            if (!str) return '';
            return str
              .replace(/#.*$/gm, '') // Remove Python/C comment lines
              .replace(/\/\/.*$/gm, '') // Remove JS single-line comments
              .replace(/\/\*[\s\S]*?\*\//g, '') // Remove JS multi-line comments
              .replace(/\s+/g, '') // Remove all whitespaces
              .toLowerCase()
              .trim();
          };

          const userCleaned = cleanString(code);
          const exampleCleaned = cleanString(codeExample);

          // 2. Reject exact copies of reference example
          if (exampleCleaned && userCleaned === exampleCleaned) {
            setStatus('error');
            outputLogs.push(`❌ This is the reference example code. Please write your own solution for the practice task!`);
            setLogs([...outputLogs]);
            return;
          }

          // 3. Reject outputs matching default templates or default example outputs
          const outputLower = finalOutputStr.toLowerCase();
          if (outputLower.includes("hello, codeverse!") || outputLower === "hello, codeverse") {
            setStatus('error');
            outputLogs.push(`❌ Output matches the reference example output ("Hello, CodeVerse!"). Please change the text to match your task (e.g. printing your own name).`);
            setLogs([...outputLogs]);
            return;
          }

          // Custom check for debug challenge
          if (lessonId && lessonId.includes('w3') && code.includes('65')) {
            submitDebugChallenge(); // Trigger Debugging Expert Badge!
          }

          if (regex.test(finalOutputStr)) {
            setStatus('success');
            if (onTaskSuccess) onTaskSuccess();
          } else {
            setStatus('error');
            outputLogs.push(`❌ Output didn't match validation rules. Keep trying!`);
            setLogs([...outputLogs]);
          }
        }
      } catch (err) {
        outputLogs.push(`Runtime Error: ${err.message}`);
        setLogs(outputLogs);
        setStatus('error');
      } finally {
        setIsRunning(false);
      }
    }, 1200);
  };

  return (
    <div className="playground-container glass-card">
      <div className="playground-header">
        <div className="playground-title">
          <span className="lang-badge gradient-bg">{languageId.toUpperCase()}</span>
          <h4>Interactive Playground</h4>
        </div>
        <div className="playground-actions">
          {codeExample && (
            <button
              className={`btn btn-secondary btn-sm example-toggle-btn ${showExample ? 'example-active' : ''}`}
              onClick={() => setShowExample(e => !e)}
              title="Show/Hide reference example"
            >
              <Info size={14} />
              <span>{showExample ? 'Hide Example' : 'Show Example'}</span>
            </button>
          )}
          <button className="btn btn-secondary btn-icon" onClick={handleReset} title="Reset Code">
            <RotateCcw size={16} />
          </button>
          <button
            className={`btn btn-secondary btn-icon ${showHistory ? 'history-active' : ''}`}
            onClick={() => setShowHistory(h => !h)}
            title="Code History"
            style={{ position: 'relative' }}
          >
            <History size={16} />
            {codeHistory.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--primary)', color: '#070d18', borderRadius: '99px', fontSize: '0.55rem', fontWeight: 900, padding: '0 4px', minWidth: '14px', textAlign: 'center' }}>{codeHistory.length}</span>
            )}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={simulateExecution} 
            disabled={isRunning}
          >
            <Play size={16} />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Reference Example Panel */}
      {showExample && codeExample && (
        <div className="example-panel">
          <div className="example-panel-header">
            <span><Info size={13} style={{ marginRight: '0.3rem' }} />Reference Example — study it, then write your own solution below</span>
            <button className="history-close" onClick={() => setShowExample(false)}><X size={14} /></button>
          </div>
          <pre className="example-code-block">{codeExample}</pre>
        </div>
      )}

      <div className="playground-workspace">
        {/* Editor Screen */}
        <div className="editor-section">
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Output Console & Memory view */}
        <div className="console-section">
          <div className="section-tab">Terminal Output</div>
          <div className="terminal-screen">
            {logs.map((log, i) => (
              <div key={i} className={`log-line ${log.startsWith('❌') || log.startsWith('⚠️') ? 'log-error' : log.includes('Success') ? 'log-success' : ''}`}>
                {log}
              </div>
            ))}
          </div>

          {/* Memory Visualizer */}
          {Object.keys(memory).length > 0 && (
            <div className="memory-visualizer">
              <div className="section-tab">
                <Database size={12} />
                <span>Simulated RAM Memory</span>
              </div>
              <div className="memory-grid">
                {Object.entries(memory).map(([key, val]) => (
                  <div key={key} className="memory-cell animate-float">
                    <div className="memory-label">{key}</div>
                    <div className="memory-value">{String(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code History Panel */}
      {showHistory && (
        <div className="history-panel">
          <div className="history-panel-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><History size={13} /> Code History (last {codeHistory.length} runs)</span>
            <button className="history-close" onClick={() => setShowHistory(false)}><X size={14} /></button>
          </div>
          {codeHistory.length === 0 ? (
            <p className="history-empty">No runs yet. Run your code to save history.</p>
          ) : (
            <div className="history-list">
              {codeHistory.map((entry, i) => (
                <div key={entry.id} className="history-entry">
                  <div className="history-entry-meta">
                    <span className="history-run-num">Run #{codeHistory.length - i}</span>
                    <span className="history-time">{entry.time}</span>
                  </div>
                  <pre className="history-code-preview">{entry.code.slice(0, 80)}{entry.code.length > 80 ? '...' : ''}</pre>
                  <div className="history-output-preview">{entry.output || 'No output'}</div>
                  <button className="btn btn-ghost history-restore-btn" onClick={() => { setCode(entry.code); setShowHistory(false); setStatus('idle'); }}>
                    ↩ Restore this code
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task verification section */}
      <div className="task-panel">
        <div className="task-desc">
          <h5>Practice Task:</h5>
          <p>{practiceTask}</p>
        </div>

        <div className="task-feedback">
          {status === 'success' && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>Perfect! Task succeeded (+15 XP)</span>
            </div>
          )}
          {status === 'error' && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>Try again. Match the goal output.</span>
            </div>
          )}
          {practiceHint && (
            <div className="hint-container">
              <button className="btn-hint" onClick={() => setShowHint(!showHint)}>
                <Info size={14} />
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
              </button>
              {showHint && <div className="hint-text">{practiceHint}</div>}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .history-active {
          border-color: var(--primary) !important;
          color: var(--primary) !important;
          background: var(--primary-glow) !important;
        }

        .history-panel {
          background: rgba(7, 13, 24, 0.95);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .history-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        .history-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          transition: var(--transition-smooth);
        }

        .history-close:hover { color: var(--danger); }

        .history-empty {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-style: italic;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          max-height: 220px;
          overflow-y: auto;
        }

        .history-entry {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .history-entry-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.68rem;
        }

        .history-run-num {
          font-weight: 700;
          color: var(--primary);
        }

        .history-time {
          color: var(--text-muted);
        }

        .history-code-preview {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-all;
          background: rgba(0,0,0,0.2);
          padding: 0.35rem 0.5rem;
          border-radius: 4px;
        }

        .history-output-preview {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-style: italic;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-restore-btn {
          font-size: 0.72rem;
          padding: 0.2rem 0.5rem;
          align-self: flex-start;
          border: 1px solid var(--border-color) !important;
          border-radius: 4px;
        }

        .example-toggle-btn {
          font-size: 0.8rem;
          padding: 0.4rem 0.75rem;
          gap: 0.4rem;
        }

        .example-active {
          border-color: var(--warning) !important;
          color: var(--warning) !important;
          background: rgba(245, 158, 11, 0.08) !important;
        }

        .example-panel {
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          animation: slideDown 0.2s ease;
        }

        .example-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--warning);
          margin-bottom: 0.6rem;
        }

        .example-code-block {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-all;
          background: rgba(0, 0, 0, 0.25);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border-left: 3px solid rgba(245, 158, 11, 0.5);
          line-height: 1.6;
        }

        .log-line.log-warning {
          color: var(--warning);
        }

        .playground-container {
          padding: 1.25rem;
          background: rgba(18, 19, 26, 0.9);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-height: 520px;
        }

        .playground-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.75rem;
        }

        .playground-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .lang-badge {
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-weight: 800;
          font-size: 0.75rem;
          color: white;
          font-family: var(--font-display);
        }

        .playground-actions {
          display: flex;
          gap: 0.5rem;
        }

        .playground-workspace {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          flex: 1;
        }

        @media (max-width: 768px) {
          .playground-workspace {
            grid-template-columns: 1fr;
          }
        }

        .editor-section {
          background: #0f111a;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          position: relative;
        }

        .code-editor {
          width: 100%;
          height: 100%;
          min-height: 250px;
          background: transparent;
          border: none;
          color: #f8f8f2;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          padding: 1rem;
          resize: none;
          outline: none;
          line-height: 1.5;
        }

        .console-section {
          display: flex;
          flex-direction: column;
          background: #050609;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          gap: 0.5rem;
        }

        .section-tab {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.25rem;
        }

        .terminal-screen {
          flex: 1;
          min-height: 120px;
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #38bdf8;
          line-height: 1.6;
          overflow-y: auto;
          white-space: pre-wrap;
        }

        .log-line {
          margin-bottom: 0.25rem;
        }

        .log-error {
          color: var(--danger);
        }

        .log-success {
          color: var(--success);
          font-weight: bold;
        }

        .memory-visualizer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        .memory-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .memory-cell {
          background: var(--bg-tertiary);
          border: 1px solid var(--primary);
          padding: 0.4rem 0.75rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation-duration: 3s;
          box-shadow: 0 0 8px var(--primary-glow);
        }

        .memory-label {
          color: var(--secondary);
          font-weight: 700;
        }

        .memory-value {
          color: var(--text-primary);
        }

        .task-panel {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .task-desc {
          max-width: 60%;
        }

        .task-desc h5 {
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .task-desc p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .task-feedback {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .alert-success {
          background: var(--success-glow);
          border: 1px solid var(--success);
          color: var(--success);
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid var(--danger);
          color: var(--danger);
        }

        .hint-container {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .btn-hint {
          background: none;
          border: none;
          color: var(--accent);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          transition: var(--transition-smooth);
        }

        .btn-hint:hover {
          color: var(--text-primary);
        }

        .hint-text {
          font-size: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          border-radius: 4px;
          max-width: 250px;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  );
}
