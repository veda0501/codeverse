import React, { useState } from 'react';
import { Play, ArrowRight } from 'lucide-react';

export default function AnalogyVisual({ type = 'variables' }) {
  const [jarValue, setJarValue] = useState('Sugar');
  const [inputValue, setInputValue] = useState('');
  const [loopCount, setLoopCount] = useState(0);
  const maxLoops = 5;
  const [conditionValue, setConditionValue] = useState(50);
  const [pointerAddress] = useState('0x7FFE');
  const [houseValue, setHouseValue] = useState('Gold Coins');

  const handleUpdateVar = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setJarValue(inputValue);
      setInputValue('');
    }
  };

  const stepLoop = () => {
    if (loopCount < maxLoops) {
      setLoopCount(prev => prev + 1);
    } else {
      setLoopCount(0);
    }
  };

  return (
    <div className="analogy-visual-container glass-card">
      <div className="analogy-header">
        <h5>Interactive Concept Explorer</h5>
      </div>

      <div className="analogy-display">
        {/* VARIABLES ANALOGY */}
        {type === 'variables' && (
          <div className="analogy-content variables-view">
            <div className="concept-split">
              <div className="concept-visual">
                <p className="analogy-p">A variable stores a value in memory with a symbolic name:</p>
                <div className="jar-scene">
                  <div className="jar">
                    <div className="jar-lid"></div>
                    <div className="jar-body">
                      <div className="jar-content">{jarValue}</div>
                    </div>
                    <div className="jar-label">
                      <span>favorite_food</span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleUpdateVar} className="analogy-controls">
                  <input 
                    type="text" 
                    placeholder="Update value..." 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="input-control"
                    maxLength={15}
                  />
                  <button type="submit" className="btn btn-primary">Store</button>
                </form>
              </div>
              <div className="concept-code">
                <div className="code-panel">
                  <div className="code-header">Python Implementation</div>
                  <pre><code>{`# Variable declaration & assignment
favorite_food = "Sugar"
print(favorite_food)

# Reassignment
favorite_food = "${jarValue}"
print(favorite_food)`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOOPS ANALOGY */}
        {type === 'loops' && (
          <div className="analogy-content loops-view">
            <div className="concept-split">
              <div className="concept-visual">
                <p className="analogy-p">Loops repeat a block of code a fixed number of iterations:</p>
                
                <div className="wheel-scene">
                  <div className={`hamster-wheel ${loopCount > 0 ? 'spinning' : ''}`} style={{ transform: `rotate(${loopCount * 72}deg)` }}>
                    <div className="wheel-spoke"></div>
                    <div className="wheel-spoke" style={{ transform: 'rotate(45deg)' }}></div>
                    <div className="wheel-spoke" style={{ transform: 'rotate(90deg)' }}></div>
                    <div className="wheel-spoke" style={{ transform: 'rotate(135deg)' }}></div>
                    <span className="hamster">⚙️</span>
                  </div>
                  <div className="loop-counter-display">
                    <div className="counter-box">
                      <span className="count-label">Iteration:</span>
                      <span className="count-number">{loopCount} / {maxLoops}</span>
                    </div>
                  </div>
                </div>

                <div className="analogy-controls">
                  <button onClick={stepLoop} className="btn btn-primary">
                    <Play size={14} />
                    <span>{loopCount === maxLoops ? 'Reset' : 'Step'}</span>
                  </button>
                </div>
              </div>
              <div className="concept-code">
                <div className="code-panel">
                  <div className="code-header">Loop Mechanics</div>
                  <pre><code>{`# for loop - repeat 5 times
for i in range(5):
    print(f"Iteration: {i}")
# Output: 0, 1, 2, 3, 4

# while loop - repeat until condition
counter = 0
while counter < 5:
    print(counter)
    counter += 1`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDITIONALS ANALOGY */}
        {type === 'conditionals' && (
          <div className="analogy-content conditionals-view">
            <div className="concept-split">
              <div className="concept-visual">
                <p className="analogy-p">Conditionals execute code based on boolean conditions (if/else branches):</p>
                
                <div className="conditional-scene">
                  <div className="slider-label">Score: {conditionValue}</div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={conditionValue} 
                    onChange={(e) => setConditionValue(parseInt(e.target.value))}
                    className="range-slider"
                  />

                  <div className="paths-container">
                    <div className="path-node start-node">
                      <span>if score &gt;= 50</span>
                    </div>
                    <div className="paths-split">
                      <div className={`split-branch pass-branch ${conditionValue >= 50 ? 'active glow-text-primary' : ''}`}>
                        <ArrowRight size={20} />
                        <span>TRUE Path</span>
                      </div>
                      <div className={`split-branch fail-branch ${conditionValue < 50 ? 'active glow-text-secondary' : ''}`}>
                        <ArrowRight size={20} />
                        <span>FALSE Path</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="concept-code">
                <div className="code-panel">
                  <div className="code-header">Conditional Logic</div>
                  <pre><code>{`score = ${conditionValue}

if score >= 50:
    print("PASS")
    result = "Success"
else:
    print("FAIL")
    result = "Try again"

print(result)`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POINTERS ANALOGY */}
        {type === 'pointers' && (
          <div className="analogy-content pointers-view">
            <div className="concept-split">
              <div className="concept-visual">
                <p className="analogy-p">A pointer holds a memory address, allowing indirect access to variables (dereferencing):</p>
                
                <div className="pointer-scene">
                  <div className="pointer-block glass-card">
                    <div className="block-header">Pointer (*ptr)</div>
                    <div className="block-body">
                      <div className="address-val">{pointerAddress}</div>
                      <div className="label-sub">Memory Address</div>
                    </div>
                  </div>

                  <div className="arrow-connection">
                    <div className="dotted-line"></div>
                    <ArrowRight size={24} className="connecting-arrow" />
                  </div>

                  <div className="pointer-block glass-card target-block">
                    <div className="block-header">Variable (*ptr)</div>
                    <div className="block-body">
                      <div className="actual-val">{houseValue}</div>
                      <div className="address-tag">Dereferenced Value</div>
                    </div>
                  </div>
                </div>

                <div className="analogy-controls">
                  <input 
                    type="text" 
                    placeholder="Modify value..." 
                    value={houseValue}
                    onChange={(e) => setHouseValue(e.target.value)}
                    className="input-control"
                  />
                </div>
              </div>
              <div className="concept-code">
                <div className="code-panel">
                  <div className="code-header">Pointer Basics (C)</div>
                  <pre><code>{`int x = 42;
int *ptr = &x;  // ptr holds address
printf("%d\\n", *ptr);   // Output: 42
printf("%p\\n", ptr);    // Output: 0x7FFE

*ptr = 50;      // Modify x indirectly
printf("%d\\n", x);      // Output: 50`}</code></pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .analogy-visual-container {
          padding: 1.25rem;
          background: rgba(30, 27, 75, 0.2);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .analogy-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .analogy-header h5 {
          font-family: var(--font-display);
          font-size: 0.95rem;
          color: var(--text-primary);
          margin: 0;
        }

        .analogy-p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          text-align: center;
        }

        .analogy-controls {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          justify-content: center;
          width: 100%;
        }

        .input-control {
          padding: 0.5rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-family: var(--font-mono);
          flex: 1;
          min-width: 150px;
        }

        .input-control:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 8px var(--primary-glow);
        }

        /* Concept Split Layout */
        .concept-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
          width: 100%;
        }

        .concept-visual {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .concept-code {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .code-panel {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--primary);
          border-radius: 8px;
          overflow: hidden;
          font-size: 0.8rem;
        }

        .code-header {
          background: var(--bg-tertiary);
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid var(--primary);
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--primary);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .code-panel pre {
          margin: 0;
          padding: 0.75rem;
          overflow-x: auto;
          background: transparent;
        }

        .code-panel code {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          line-height: 1.4;
          color: var(--text-primary);
          display: block;
          white-space: pre;
        }

        /* Variables Jar CSS */
        .jar-scene {
          display: flex;
          justify-content: center;
          padding: 1.5rem 0;
        }

        .jar {
          width: 110px;
          height: 140px;
          border: 4px solid var(--primary);
          border-radius: 20px 20px 30px 30px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.05);
          box-shadow: 0 0 20px var(--primary-glow);
        }

        .jar-lid {
          width: 70px;
          height: 12px;
          background: var(--secondary);
          border-radius: 6px;
          position: absolute;
          top: -12px;
          left: 16px;
        }

        .jar-body {
          width: 100%;
          text-align: center;
          padding: 10px;
        }

        .jar-content {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          background: var(--primary-glow);
          padding: 0.4rem;
          border-radius: 8px;
          word-break: break-all;
        }

        .jar-label {
          position: absolute;
          bottom: -15px;
          background: var(--secondary);
          color: white;
          font-size: 0.65rem;
          font-family: var(--font-mono);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        /* Loops Wheel CSS */
        .wheel-scene {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 0;
        }

        .hamster-wheel {
          width: 120px;
          height: 120px;
          border: 5px dashed var(--secondary);
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 0 15px var(--secondary-glow);
        }

        .hamster-wheel.spinning {
          border-style: dotted;
        }

        .wheel-spoke {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          position: absolute;
        }

        .hamster {
          font-size: 2rem;
          position: absolute;
          bottom: 8px;
        }

        .loop-counter-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .counter-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .count-label {
          color: var(--text-secondary);
          margin-right: 0.5rem;
        }

        .count-number {
          font-weight: bold;
          color: var(--success);
          font-family: var(--font-display);
        }

        /* Conditionals slider */
        .conditional-scene {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem 0;
        }

        .slider-label {
          font-size: 0.85rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--primary);
        }

        .range-slider {
          width: 80%;
          accent-color: var(--primary);
          cursor: pointer;
        }

        .paths-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        .start-node {
          background: var(--bg-tertiary);
          border: 1.5px solid var(--primary);
          padding: 0.4rem 0.8rem;
          border-radius: 99px;
          font-size: 0.8rem;
          font-family: var(--font-mono);
          box-shadow: 0 0 10px var(--primary-glow);
        }

        .paths-split {
          display: flex;
          gap: 1.5rem;
          width: 100%;
          justify-content: center;
        }

        .split-branch {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          font-size: 0.75rem;
          font-weight: 600;
          transition: var(--transition-smooth);
          color: var(--text-muted);
        }

        .split-branch.pass-branch.active {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--success);
          color: var(--success);
          box-shadow: 0 0 15px var(--success-glow);
        }

        .split-branch.fail-branch.active {
          background: rgba(239, 68, 68, 0.08);
          border-color: var(--danger);
          color: var(--danger);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
        }

        /* Pointer Scene */
        .pointer-scene {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem 0;
          width: 100%;
        }

        .pointer-block {
          width: 130px;
          padding: 0.75rem;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .pointer-block.target-block {
          border-color: var(--accent);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .block-header {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.25rem;
        }

        .address-val, .actual-val {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .actual-val {
          color: var(--accent);
        }

        .label-sub, .address-tag {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .address-tag {
          font-family: var(--font-mono);
        }

        .arrow-connection {
          display: flex;
          align-items: center;
        }

        .dotted-line {
          width: 30px;
          border-top: 2px dashed var(--text-muted);
        }

        .connecting-arrow {
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .concept-split {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .jar {
            width: 90px;
            height: 120px;
          }
        }
      `}</style>
    </div>
  );
}
