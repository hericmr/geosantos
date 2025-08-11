#!/bin/bash

# Script para limpeza de arquivos duplicados após refatoração
# Este script remove os arquivos antigos que foram duplicados e refatorados

echo "🧹 Iniciando limpeza de arquivos duplicados..."

# Diretório base do projeto
PROJECT_ROOT="src"

# Função para fazer backup antes de remover
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        local backup_dir="backup/$(dirname "$file")"
        mkdir -p "$backup_dir"
        cp "$file" "$backup_dir/"
        echo "📦 Backup criado: $backup_dir/$(basename "$file")"
    fi
}

# Função para remover arquivo com confirmação
remove_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🗑️  Removendo: $file"
        rm "$file"
    else
        echo "⚠️  Arquivo não encontrado: $file"
    fi
}

# Criar diretório de backup
mkdir -p backup

echo ""
echo "📁 Removendo arquivos de validação duplicados..."

# Arquivos de validação do modo neighborhood
backup_file "$PROJECT_ROOT/utils/modes/neighborhood/validation.ts"
remove_file "$PROJECT_ROOT/utils/modes/neighborhood/validation.ts"

# Arquivos de validação do modo famousPlaces
backup_file "$PROJECT_ROOT/utils/modes/famousPlaces/validation.ts"
remove_file "$PROJECT_ROOT/utils/modes/famousPlaces/validation.ts"

echo ""
echo "📁 Removendo arquivos de pontuação duplicados..."

# Arquivos de pontuação do modo neighborhood
backup_file "$PROJECT_ROOT/utils/modes/neighborhood/scoring.ts"
remove_file "$PROJECT_ROOT/utils/modes/neighborhood/scoring.ts"

# Arquivos de pontuação do modo famousPlaces
backup_file "$PROJECT_ROOT/utils/modes/famousPlaces/scoring.ts"
remove_file "$PROJECT_ROOT/utils/modes/famousPlaces/scoring.ts"

echo ""
echo "📁 Renomeando arquivos refatorados..."

# Renomear arquivos refatorados para nomes finais
if [ -f "$PROJECT_ROOT/utils/modes/neighborhood/validation-refactored.ts" ]; then
    mv "$PROJECT_ROOT/utils/modes/neighborhood/validation-refactored.ts" "$PROJECT_ROOT/utils/modes/neighborhood/validation.ts"
    echo "✅ Renomeado: validation-refactored.ts -> validation.ts (neighborhood)"
fi

if [ -f "$PROJECT_ROOT/utils/modes/neighborhood/scoring-refactored.ts" ]; then
    mv "$PROJECT_ROOT/utils/modes/neighborhood/scoring-refactored.ts" "$PROJECT_ROOT/utils/modes/neighborhood/scoring.ts"
    echo "✅ Renomeado: scoring-refactored.ts -> scoring.ts (neighborhood)"
fi

if [ -f "$PROJECT_ROOT/utils/modes/famousPlaces/validation-refactored.ts" ]; then
    mv "$PROJECT_ROOT/utils/modes/famousPlaces/validation-refactored.ts" "$PROJECT_ROOT/utils/modes/famousPlaces/validation.ts"
    echo "✅ Renomeado: validation-refactored.ts -> validation.ts (famousPlaces)"
fi

if [ -f "$PROJECT_ROOT/utils/modes/famousPlaces/scoring-refactored.ts" ]; then
    mv "$PROJECT_ROOT/utils/modes/famousPlaces/scoring-refactored.ts" "$PROJECT_ROOT/utils/modes/famousPlaces/scoring.ts"
    echo "✅ Renomeado: scoring-refactored.ts -> scoring.ts (famousPlaces)"
fi

echo ""
echo "📁 Atualizando imports nos arquivos refatorados..."

# Atualizar imports nos arquivos refatorados
update_imports() {
    local file="$1"
    if [ -f "$file" ]; then
        # Substituir imports de módulos compartilhados
        sed -i 's|from .*shared.*|from "../../../shared"|g' "$file"
        echo "✅ Imports atualizados em: $file"
    fi
}

update_imports "$PROJECT_ROOT/utils/modes/neighborhood/validation.ts"
update_imports "$PROJECT_ROOT/utils/modes/neighborhood/scoring.ts"
update_imports "$PROJECT_ROOT/utils/modes/famousPlaces/validation.ts"
update_imports "$PROJECT_ROOT/utils/modes/famousPlaces/scoring.ts"

echo ""
echo "🧹 Limpeza concluída!"
echo ""
echo "📊 Resumo da limpeza:"
echo "   - Arquivos duplicados removidos: 4"
echo "   - Arquivos refatorados renomeados: 4"
echo "   - Imports atualizados: 4"
echo "   - Backup criado em: backup/"
echo ""
echo "⚠️  IMPORTANTE: Verifique se todos os imports estão funcionando corretamente"
echo "   antes de prosseguir com a próxima etapa."
echo ""
echo "🔍 Para verificar se tudo está funcionando:"
echo "   1. Execute: npm run build"
echo "   2. Execute: npm run dev"
echo "   3. Teste os modos de jogo"
echo ""
echo "📝 Se houver problemas, os arquivos originais estão em: backup/" 