import os

files = [
    'src/components/chapters/Chapter3Interference.tsx',
    'src/components/chapters/Chapter4Sparsify.tsx',
    'src/components/chapters/Chapter6Sandbox.tsx'
]

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Let's replace the broken strings.
    content = content.replace("{\\'>\\'}", '{" >"}')
    content = content.replace('> EMPIRICAL BENCHMARK', '{">"} EMPIRICAL BENCHMARK')
    content = content.replace('> MATRIX CROSSTALK: 16×16', '{">"} MATRIX CROSSTALK: 16×16')
    content = content.replace('> ASSOCIATIVE READOUT FIDELITY', '{">"} ASSOCIATIVE READOUT FIDELITY')
    content = content.replace('> DENSE PROFILE', '{">"} DENSE PROFILE')
    content = content.replace('> SPARSE PROFILE', '{">"} SPARSE PROFILE')
    content = content.replace('> LIVE MULTIMODAL TELEMETRY', '{">"} LIVE MULTIMODAL TELEMETRY')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
