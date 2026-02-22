with open(r'components\MastroERP.tsx', 'r', encoding='utf-8-sig') as f:
    content = f.read()

def remove_first_function(content, func_name):
    pattern = f'  const {func_name} = () =>'
    idx1 = content.find(pattern)
    if idx1 == -1:
        print(f"NON TROVATO: {func_name}")
        return content
    idx2 = content.find(pattern, idx1 + 10)
    if idx2 == -1:
        print(f"Nessun duplicato: {func_name}")
        return content
    
    # Trova fine prima funzione tracciando graffe o parentesi
    # Cerca la prossima riga che inizia con "  const " o "  /*" dopo idx1
    end = content.find('\n  const ', idx1 + 50)
    end2 = content.find('\n  /* ', idx1 + 50)
    if end2 > 0 and (end < 0 or end2 < end):
        end = end2
    
    if end < 0 or end > idx2:
        # usa idx2 come fine
        end = idx2
    
    removed = content[idx1:end]
    content = content[:idx1] + content[end:]
    print(f"OK rimosso {func_name} ({len(removed)} chars)")
    return content

content = remove_first_function(content, 'renderAgenda')
content = remove_first_function(content, 'renderMessaggi')
content = remove_first_function(content, 'renderSettings')

with open(r'components\MastroERP.tsx', 'w', encoding='utf-8') as f:
    f.write(content)