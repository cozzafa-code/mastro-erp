with open(r'components\MastroERP.tsx', 'r', encoding='utf-8-sig') as f:
    lines = f.readlines()

# Sostituisci righe 1030-1096 (indice 1030-1096) con il widget
new_lines = lines[:1030]
new_lines.append('          calendario: <MastroAgendaWidget events={events} cantieri={cantieri} T={T} onEventClick={() => setTab("agenda")} onAddEvent={() => setTab("agenda")} />,\n')
new_lines.extend(lines[1097:])

with open(r'components\MastroERP.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("OK - " + str(len(lines)) + " -> " + str(len(new_lines)) + " righe")