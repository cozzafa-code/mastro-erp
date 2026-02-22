with open('components/MastroERP.tsx', encoding='utf-8') as f:
    c = f.read()

# Fix 1: rimuovi 'use client' duplicato
c = c.replace("'use client'\r\n", "")
c = c.replace("'use client'\n", "")

# Fix 2: rimuovi TUTTI i backtick+-> nel file intero
before = c.count(chr(96) + "->")
c = c.replace(chr(96) + "->", "")
print(f"backtick-> rimossi: {before}")

# Fix 3: sostituisci selectedMsg IIFE
MARKER = "{selectedMsg && (() => {"
start = c.find(MARKER)
if start == -1:
    print("selectedMsg IIFE non trovato (gia rimosso?)")
else:
    depth = 0
    i = start + 1
    while i < len(c):
        if c[i] == '{': depth += 1
        elif c[i] == '}':
            if depth == 0:
                end = i + 1
                break
            depth -= 1
        i += 1
    replacement = '{selectedMsg && (<div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 100 }}><div onClick={() => { setSelectedMsg(null); setReplyText(""); }} style={{ padding: 16, cursor: "pointer", fontWeight: 700, color: T.acc }}>← Chiudi</div></div>)}'
    c = c[:start] + replacement + c[end:]
    print(f"selectedMsg IIFE sostituito")

with open('components/MastroERP.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('done')