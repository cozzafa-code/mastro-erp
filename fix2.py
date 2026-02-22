with open(r'components\MastroERP.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Stampa le righe intorno ai 5 IIFE per debug
targets = [951, 992, 2219, 4630, 4846]
for t in targets:
    print(f"\n=== Intorno alla riga {t} ===")
    start = max(0, t-2)
    end = min(len(lines), t+3)
    for i in range(start, end):
        print(f"{i+1}: {lines[i]}", end='')